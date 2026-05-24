import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import Stripe from 'stripe';
import { PrismaService } from '../../database/prisma.service';
import { CreateDonationCheckoutDto, CreateSubscriptionCheckoutDto } from './dto';
import {
  donationThankYouTemplate,
  premiumConfirmationTemplate,
  premiumWelcomeTemplate,
  subscriptionExpiringTemplate,
} from './monetization-email.templates';

type ParsedSubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  stripePriceId: string | null;
  features: string[];
  isActive: boolean;
  createdAt: Date;
};

type PaymentProvider = 'STRIPE' | 'LEMONSQUEEZY';

type AdminMonetizationMetrics = {
  totalDonations: number;
  totalSubscriptions: number;
  estimatedMonthlyRevenue: number;
  premiumUsers: number;
  activePlans: number;
  activePlanBreakdown: Array<{
    slug: string;
    name: string;
    subscribers: number;
  }>;
};

const FEATURE_TO_PLAN: Record<string, 'gratuit' | 'premium-basic' | 'premium-family'> = {
  'audio-prayers': 'premium-basic',
  'pdf-export': 'premium-basic',
  'premium-themes': 'premium-basic',
  'unlimited-favorites': 'premium-basic',
  'custom-notifications': 'premium-basic',
  'family-profiles': 'premium-family',
};

@Injectable()
export class MonetizationService {
  private readonly logger = new Logger(MonetizationService.name);
  private readonly stripe: Stripe | null;
  private readonly paymentProvider: PaymentProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const configuredProvider = this.configService.get<string>('PAYMENT_PROVIDER', 'STRIPE').toUpperCase();
    this.paymentProvider = configuredProvider === 'LEMONSQUEEZY' ? 'LEMONSQUEEZY' : 'STRIPE';

    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY', '');
    this.stripe = secretKey
      ? new Stripe(secretKey, {
          apiVersion: '2025-08-27.basil',
        })
      : null;
  }

  async listPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });

    return plans.map((plan) => this.parsePlan(plan));
  }

  async getUserMonetizationSummary(userId: string) {
    const [plans, activeSubscription, donationHistory, premiumFeatures] = await Promise.all([
      this.listPlans(),
      this.prisma.userSubscription.findFirst({
        where: {
          userId,
          status: { in: ['ACTIVE', 'PAST_DUE', 'INCOMPLETE'] },
        },
        include: { plan: true },
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.donation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      this.prisma.premiumFeature.findMany({ orderBy: { createdAt: 'asc' } }),
    ]);

    const currentPlan = activeSubscription
      ? this.parsePlan(activeSubscription.plan)
      : plans.find((plan) => plan.slug === 'gratuit') ?? plans[0] ?? null;

    return {
      currentPlan,
      activeSubscription: activeSubscription
        ? {
            id: activeSubscription.id,
            status: activeSubscription.status,
            startedAt: activeSubscription.startedAt,
            expiresAt: activeSubscription.expiresAt,
            provider: activeSubscription.provider,
            providerSubscriptionId: activeSubscription.providerSubscriptionId,
            plan: this.parsePlan(activeSubscription.plan),
          }
        : null,
      donationHistory,
      quickDonationValues: [500, 1000, 2500, 5000],
      premiumFeatures,
      featureAccess: {
        audioPrayers: await this.hasFeatureAccess(userId, 'audio-prayers'),
        pdfExport: await this.hasFeatureAccess(userId, 'pdf-export'),
        premiumThemes: await this.hasFeatureAccess(userId, 'premium-themes'),
        unlimitedFavorites: await this.hasFeatureAccess(userId, 'unlimited-favorites'),
        customNotifications: await this.hasFeatureAccess(userId, 'custom-notifications'),
        familyProfiles: await this.hasFeatureAccess(userId, 'family-profiles'),
      },
      favoriteLimit: (await this.hasFeatureAccess(userId, 'unlimited-favorites')) ? null : 10,
      emails: {
        donationThankYou: donationThankYouTemplate('25 lei'),
        premiumConfirmation: premiumConfirmationTemplate('Premium Basic'),
        subscriptionExpiring: subscriptionExpiringTemplate('Premium Family'),
        premiumWelcome: premiumWelcomeTemplate('Premium Basic'),
      },
    };
  }

  async createSubscriptionCheckoutSession(userId: string, dto: CreateSubscriptionCheckoutDto) {
    if (this.paymentProvider === 'LEMONSQUEEZY') {
      return this.createLemonSubscriptionCheckout(userId, dto);
    }

    const stripe = this.getStripe();
    const [user, plan] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.subscriptionPlan.findUnique({ where: { slug: dto.planSlug } }),
    ]);

    if (!user) {
      throw new NotFoundException('Utilizatorul nu a fost găsit.');
    }

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Planul selectat nu este disponibil.');
    }

    if (plan.priceMonthly <= 0) {
      throw new BadRequestException('Planul gratuit nu necesită checkout.');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      allow_promotion_codes: true,
      line_items: plan.stripePriceId
        ? [
            {
              quantity: 1,
              price: plan.stripePriceId,
            },
          ]
        : [
            {
              quantity: 1,
              price_data: {
                currency: 'ron',
                unit_amount: plan.priceMonthly,
                recurring: { interval: 'month' },
                product_data: {
                  name: plan.name,
                  description: plan.description,
                },
              },
            },
          ],
      metadata: {
        type: 'subscription',
        userId,
        planSlug: plan.slug,
      },
      success_url: `${this.getFrontendBaseUrl()}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.getFrontendBaseUrl()}/premium/cancel`,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async createDonationCheckoutSession(userId: string, dto: CreateDonationCheckoutDto) {
    if (this.paymentProvider === 'LEMONSQUEEZY') {
      return this.createLemonDonationCheckout(userId, dto);
    }

    const stripe = this.getStripe();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Utilizatorul nu a fost găsit.');
    }

    const currency = 'ron';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      submit_type: 'donate',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: dto.amount,
            product_data: {
              name: 'Susținere comunitate',
              description: 'Contribuție pentru dezvoltarea calmă și discretă a aplicației Vorbește cu Dumnezeu.',
            },
          },
        },
      ],
      metadata: {
        type: 'donation',
        userId,
        message: dto.message ?? '',
      },
      success_url: `${this.getFrontendBaseUrl()}/premium/success?type=donation&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.getFrontendBaseUrl()}/premium/cancel`,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async verifyCheckoutSession(userId: string, sessionId: string) {
    if (this.paymentProvider === 'LEMONSQUEEZY') {
      return {
        id: sessionId,
        status: 'complete',
        paymentStatus: 'paid',
        mode: 'payment',
        amountTotal: null,
        currency: null,
        customerEmail: null,
        metadata: {
          provider: 'LEMONSQUEEZY',
          userId,
        },
      };
    }

    const stripe = this.getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadataUserId = session.metadata?.userId;

    if (metadataUserId && metadataUserId !== userId) {
      throw new ForbiddenException('Această sesiune nu aparține utilizatorului curent.');
    }

    return {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      mode: session.mode,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email ?? session.customer_email,
      metadata: session.metadata,
    };
  }

  async cancelSubscription(userId: string, subscriptionId: string) {
    const subscription = await this.prisma.userSubscription.findFirst({
      where: { id: subscriptionId, userId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Abonamentul nu a fost găsit.');
    }

    if (subscription.provider === 'STRIPE' && subscription.providerSubscriptionId) {
      const stripe = this.getStripe();
      const canceled = await stripe.subscriptions.update(subscription.providerSubscriptionId, {
        cancel_at_period_end: true,
      });

      await this.prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED',
          expiresAt: canceled.cancel_at
            ? new Date(canceled.cancel_at * 1000)
            : subscription.expiresAt ?? new Date(),
        },
      });
    } else {
      await this.prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED',
          expiresAt: subscription.expiresAt ?? new Date(),
        },
      });
    }

    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Abonament actualizat',
        body: `Abonamentul ${subscription.plan.name} a fost trecut în starea de anulare la finalul perioadei curente.`,
      },
    });

    return this.getUserMonetizationSummary(userId);
  }

  async handleWebhook(signature: string | string[] | undefined, rawBody?: Buffer) {
    if (this.paymentProvider === 'LEMONSQUEEZY') {
      return this.handleLemonWebhook(signature, rawBody);
    }

    const stripe = this.getStripe();
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');

    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET lipsește');
    }

    if (!rawBody || !signature || Array.isArray(signature)) {
      throw new BadRequestException('Semnătura Stripe nu este disponibilă.');
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoiceSucceeded(event.data.object as Stripe.Invoice);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event ${event.type}`);
        break;
    }

    return { received: true, type: event.type };
  }

  async hasFeatureAccess(userId: string, featureSlug: string) {
    const requiredPlan = FEATURE_TO_PLAN[featureSlug];
    if (!requiredPlan || requiredPlan === 'gratuit') {
      return true;
    }

    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PAST_DUE', 'INCOMPLETE'] },
      },
      include: { plan: true },
      orderBy: { startedAt: 'desc' },
    });

    if (!activeSubscription) {
      return false;
    }

    if (requiredPlan === 'premium-basic') {
      return ['premium-basic', 'premium-family'].includes(activeSubscription.plan.slug);
    }

    return activeSubscription.plan.slug === 'premium-family';
  }

  async ensureFavoriteVerseCapacity(userId: string) {
    const unlimited = await this.hasFeatureAccess(userId, 'unlimited-favorites');
    if (unlimited) {
      return;
    }

    const count = await this.prisma.favoriteVerse.count({ where: { userId } });
    if (count >= 10) {
      throw new ForbiddenException(
        'Ai ajuns la limita planului gratuit pentru versete favorite. Descoperă Premium pentru favorite nelimitate.',
      );
    }
  }

  async assertPlanAccess(userId: string, planId: string) {
    const plan = await this.prisma.spiritualPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException('Planul spiritual nu a fost găsit.');
    }

    if (!plan.isPremium) {
      return plan;
    }

    const neededFeature = plan.premiumTier === 'PREMIUM_FAMILY' ? 'family-profiles' : 'audio-prayers';
    const allowed = await this.hasFeatureAccess(userId, neededFeature);
    if (!allowed) {
      throw new ForbiddenException('Acest plan face parte din experiența Premium.');
    }

    return plan;
  }

  async getAdminMonetizationMetrics(): Promise<AdminMonetizationMetrics> {
    const [donations, subscriptions, activeSubscriptions, plans] = await Promise.all([
      this.prisma.donation.findMany(),
      this.prisma.userSubscription.findMany({ include: { plan: true } }),
      this.prisma.userSubscription.findMany({
        where: { status: { in: ['ACTIVE', 'PAST_DUE', 'INCOMPLETE'] } },
        include: { plan: true },
      }),
      this.prisma.subscriptionPlan.findMany({ where: { isActive: true } }),
    ]);

    const totalDonations = donations.reduce((sum, item) => sum + item.amount, 0);
    const estimatedMonthlyRevenue = activeSubscriptions.reduce((sum, item) => sum + item.plan.priceMonthly, 0);
    const activePlanBreakdown = plans.map((plan) => ({
      slug: plan.slug,
      name: plan.name,
      subscribers: activeSubscriptions.filter((item) => item.planId === plan.id).length,
    }));

    return {
      totalDonations,
      totalSubscriptions: subscriptions.length,
      estimatedMonthlyRevenue,
      premiumUsers: new Set(activeSubscriptions.map((item) => item.userId)).size,
      activePlans: plans.length,
      activePlanBreakdown,
    };
  }

  private getStripe() {
    if (!this.stripe) {
      throw new BadRequestException('STRIPE_SECRET_KEY lipsește');
    }

    return this.stripe;
  }

  private getFrontendBaseUrl() {
    const configured = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    return configured.split(',')[0].trim();
  }

  private parsePlan(plan: {
    id: string;
    name: string;
    slug: string;
    description: string;
    priceMonthly: number;
    stripePriceId: string | null;
    features: string;
    isActive: boolean;
    createdAt: Date;
  }): ParsedSubscriptionPlan {
    return {
      ...plan,
      features: this.parseFeatures(plan.features),
    };
  }

  private parseFeatures(raw: string) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
      return [];
    }
  }

  private async createLemonSubscriptionCheckout(userId: string, dto: CreateSubscriptionCheckoutDto) {
    const [user, plan] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.subscriptionPlan.findUnique({ where: { slug: dto.planSlug } }),
    ]);

    if (!user) {
      throw new NotFoundException('Utilizatorul nu a fost găsit.');
    }

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Planul selectat nu este disponibil.');
    }

    if (plan.priceMonthly <= 0) {
      throw new BadRequestException('Planul gratuit nu necesită checkout.');
    }

    const checkoutUrl = this.getLemonSubscriptionCheckoutUrl(plan.slug);
    const successUrl = `${this.getFrontendBaseUrl()}/premium/success?provider=lemonsqueezy&type=subscription`;
    const url = this.buildLemonCheckoutUrl(checkoutUrl, user.email, successUrl, {
      type: 'subscription',
      userId,
      planSlug: plan.slug,
    });

    return {
      sessionId: `ls_${randomUUID()}`,
      url,
    };
  }

  private async createLemonDonationCheckout(userId: string, dto: CreateDonationCheckoutDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilizatorul nu a fost găsit.');
    }

    const checkoutUrl = this.getLemonDonationCheckoutUrl(dto.amount);
    const successUrl = `${this.getFrontendBaseUrl()}/premium/success?provider=lemonsqueezy&type=donation`;
    const url = this.buildLemonCheckoutUrl(checkoutUrl, user.email, successUrl, {
      type: 'donation',
      userId,
      amount: String(dto.amount),
      currency: 'RON',
      message: dto.message ?? '',
    });

    return {
      sessionId: `ls_${randomUUID()}`,
      url,
    };
  }

  private getLemonSubscriptionCheckoutUrl(planSlug: string) {
    const keyByPlan: Record<string, string> = {
      'premium-basic': 'LEMONSQUEEZY_CHECKOUT_URL_PREMIUM_BASIC',
      'premium-family': 'LEMONSQUEEZY_CHECKOUT_URL_PREMIUM_FAMILY',
    };

    const envKey = keyByPlan[planSlug];
    if (!envKey) {
      throw new BadRequestException('Planul selectat nu este mapat pentru Lemon Squeezy.');
    }

    const value = this.configService.get<string>(envKey, '').trim();
    if (!value) {
      throw new BadRequestException(`Lipsește variabila ${envKey}`);
    }

    return value;
  }

  private getLemonDonationCheckoutUrl(amount: number) {
    const keyByAmount: Record<number, string> = {
      500: 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_500',
      1000: 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_1000',
      2500: 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_2500',
      5000: 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_5000',
    };

    const envKey = keyByAmount[amount];
    if (!envKey) {
      throw new BadRequestException('Valoarea donației nu este configurată pentru Lemon Squeezy.');
    }

    const value = this.configService.get<string>(envKey, '').trim();
    if (!value) {
      throw new BadRequestException(`Lipsește variabila ${envKey}`);
    }

    return value;
  }

  private buildLemonCheckoutUrl(
    baseUrl: string,
    customerEmail: string,
    successUrl: string,
    custom: Record<string, string>,
  ) {
    const url = new URL(baseUrl);
    url.searchParams.set('checkout[email]', customerEmail);
    url.searchParams.set('checkout[success_url]', successUrl);

    for (const [key, value] of Object.entries(custom)) {
      if (!value) {
        continue;
      }
      url.searchParams.set(`checkout[custom][${key}]`, value);
    }

    return url.toString();
  }

  private async handleLemonWebhook(signature: string | string[] | undefined, rawBody?: Buffer) {
    const webhookSecret = this.configService.get<string>('LEMONSQUEEZY_WEBHOOK_SECRET', '').trim();
    if (!webhookSecret) {
      throw new BadRequestException('LEMONSQUEEZY_WEBHOOK_SECRET lipsește');
    }

    if (!rawBody || !signature || Array.isArray(signature)) {
      throw new BadRequestException('Semnătura Lemon Squeezy nu este disponibilă.');
    }

    const payloadSignature = Buffer.from(signature.trim(), 'hex');
    const expectedSignature = createHmac('sha256', webhookSecret).update(rawBody).digest();
    if (
      payloadSignature.length !== expectedSignature.length ||
      !timingSafeEqual(payloadSignature, expectedSignature)
    ) {
      throw new BadRequestException('Semnătura Lemon Squeezy este invalidă.');
    }

    const payload = JSON.parse(rawBody.toString('utf8')) as {
      meta?: { event_name?: string; custom_data?: Record<string, string> };
      data?: {
        id?: string;
        attributes?: Record<string, unknown>;
      };
    };

    const eventName = payload.meta?.event_name ?? 'unknown';

    switch (eventName) {
      case 'order_created':
        await this.handleLemonOrderCreated(payload);
        break;
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_cancelled':
      case 'subscription_expired':
        await this.handleLemonSubscriptionEvent(payload);
        break;
      default:
        this.logger.debug(`Unhandled Lemon Squeezy event ${eventName}`);
        break;
    }

    return { received: true, type: eventName };
  }

  private async handleLemonOrderCreated(payload: {
    meta?: { custom_data?: Record<string, string> };
    data?: { id?: string; attributes?: Record<string, unknown> };
  }) {
    const custom = payload.meta?.custom_data ?? {};
    if (custom.type !== 'donation') {
      return;
    }

    const providerPaymentId = String(payload.data?.id ?? '');
    if (!providerPaymentId) {
      return;
    }

    const existing = await this.prisma.donation.findFirst({ where: { providerPaymentId } });
    if (existing) {
      return;
    }

    const attributes = payload.data?.attributes ?? {};
    const total = Number(attributes.total ?? custom.amount ?? 0);
    const userId = custom.userId ?? null;
    const currency = String(attributes.currency ?? custom.currency ?? 'RON').toUpperCase();

    await this.prisma.donation.create({
      data: {
        userId,
        amount: Number.isFinite(total) ? total : 0,
        currency,
        provider: 'LEMONSQUEEZY',
        providerPaymentId,
        message: custom.message ?? null,
      },
    });

    if (userId) {
      await this.prisma.notification.create({
        data: {
          userId,
          title: 'Îți mulțumim pentru sprijin',
          body: 'Donația ta a fost înregistrată cu succes. Mulțumim că susții comunitatea.',
        },
      });
    }
  }

  private async handleLemonSubscriptionEvent(payload: {
    meta?: { custom_data?: Record<string, string> };
    data?: { id?: string; attributes?: Record<string, unknown> };
  }) {
    const custom = payload.meta?.custom_data ?? {};
    const providerSubscriptionId = String(payload.data?.id ?? '');
    if (!providerSubscriptionId) {
      return;
    }

    const attributes = payload.data?.attributes ?? {};
    const status = this.normalizeSubscriptionStatus(String(attributes.status ?? 'ACTIVE'));
    const expiresAtRaw = attributes.renews_at ?? attributes.ends_at;
    const expiresAt =
      typeof expiresAtRaw === 'string' && expiresAtRaw.length > 0 ? new Date(expiresAtRaw) : null;

    const existing = await this.prisma.userSubscription.findFirst({
      where: { providerSubscriptionId },
    });

    if (existing) {
      await this.prisma.userSubscription.update({
        where: { id: existing.id },
        data: { status, expiresAt },
      });
      return;
    }

    const userId = custom.userId;
    const planSlug = custom.planSlug;
    if (!userId || !planSlug) {
      return;
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
    if (!plan) {
      return;
    }

    await this.prisma.userSubscription.updateMany({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PAST_DUE', 'INCOMPLETE'] },
      },
      data: { status: 'CANCELED' },
    });

    await this.prisma.userSubscription.create({
      data: {
        userId,
        planId: plan.id,
        status,
        startedAt: new Date(),
        expiresAt,
        provider: 'LEMONSQUEEZY',
        providerSubscriptionId,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Premium activat',
        body: `Planul ${plan.name} este acum activ. Îți mulțumim că susții comunitatea.`,
      },
    });
  }

  private normalizeSubscriptionStatus(status: string) {
    const normalized = status.toUpperCase();
    if (normalized === 'CANCELLED' || normalized === 'EXPIRED') {
      return 'CANCELED';
    }
    if (normalized === 'PAST_DUE' || normalized === 'UNPAID') {
      return 'PAST_DUE';
    }
    if (normalized === 'ON_TRIAL') {
      return 'ACTIVE';
    }
    return normalized || 'ACTIVE';
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata ?? {};
    if (metadata.type === 'donation') {
      const existing = await this.prisma.donation.findFirst({
        where: { providerPaymentId: session.payment_intent?.toString() ?? session.id },
      });

      if (existing) {
        return;
      }

      await this.prisma.donation.create({
        data: {
          userId: metadata.userId || null,
          amount: session.amount_total ?? 0,
          currency: (session.currency ?? 'ron').toUpperCase(),
          provider: 'STRIPE',
          providerPaymentId: session.payment_intent?.toString() ?? session.id,
          message: metadata.message || null,
        },
      });

      if (metadata.userId) {
        await this.prisma.notification.create({
          data: {
            userId: metadata.userId,
            title: 'Îți mulțumim pentru sprijin',
            body: 'Donația ta a fost înregistrată cu succes. Mulțumim că susții comunitatea.',
          },
        });
      }

      return;
    }

    if (metadata.type === 'subscription') {
      const plan = await this.prisma.subscriptionPlan.findUnique({ where: { slug: metadata.planSlug } });
      if (!plan || !metadata.userId) {
        return;
      }

      await this.prisma.userSubscription.updateMany({
        where: {
          userId: metadata.userId,
          status: { in: ['ACTIVE', 'PAST_DUE', 'INCOMPLETE'] },
        },
        data: { status: 'CANCELED' },
      });

      await this.prisma.userSubscription.upsert({
        where: {
          providerSubscriptionId: session.subscription?.toString() ?? session.id,
        },
        update: {
          planId: plan.id,
          status: 'ACTIVE',
          startedAt: new Date(),
          provider: 'STRIPE',
        },
        create: {
          userId: metadata.userId,
          planId: plan.id,
          status: 'ACTIVE',
          startedAt: new Date(),
          provider: 'STRIPE',
          providerSubscriptionId: session.subscription?.toString() ?? session.id,
        },
      });

      await this.prisma.notification.create({
        data: {
          userId: metadata.userId,
          title: 'Premium activat',
          body: `Planul ${plan.name} este acum activ. Îți mulțumim că susții comunitatea.`,
        },
      });
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const record = await this.prisma.userSubscription.findFirst({
      where: { providerSubscriptionId: subscription.id },
    });

    if (!record) {
      return;
    }

    await this.prisma.userSubscription.update({
      where: { id: record.id },
      data: {
        status: subscription.status.toUpperCase(),
        expiresAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
      },
    });
  }

  private async handleInvoiceFailed(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;
    if (!subscriptionId) {
      return;
    }

    const record = await this.prisma.userSubscription.findFirst({
      where: { providerSubscriptionId: subscriptionId },
    });

    if (!record) {
      return;
    }

    await this.prisma.userSubscription.update({
      where: { id: record.id },
      data: { status: 'PAST_DUE' },
    });

    await this.prisma.notification.create({
      data: {
        userId: record.userId,
        title: 'Plată nereușită',
        body: 'Nu am putut procesa ultima plată pentru abonamentul tău. Poți verifica metoda de plată din Stripe.',
      },
    });
  }

  private async handleInvoiceSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;
    if (!subscriptionId) {
      return;
    }

    const record = await this.prisma.userSubscription.findFirst({
      where: { providerSubscriptionId: subscriptionId },
      include: { plan: true },
    });

    if (!record) {
      return;
    }

    await this.prisma.userSubscription.update({
      where: { id: record.id },
      data: {
        status: 'ACTIVE',
        expiresAt: invoice.period_end ? new Date(invoice.period_end * 1000) : record.expiresAt,
      },
    });
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    this.logger.debug(`Payment intent succeeded: ${paymentIntent.id}`);
  }
}