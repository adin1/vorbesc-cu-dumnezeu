import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateDonationCheckoutDto,
  CreateSubscriptionCheckoutDto,
  VerifyCheckoutSessionDto,
} from './dto';
import { MonetizationService } from './monetization.service';

@Controller('monetization')
export class MonetizationController {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Get('plans')
  @UseGuards(JwtAuthGuard)
  listPlans() {
    return this.monetizationService.listPlans();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getSummary(@CurrentUser() user: { id: string }) {
    return this.monetizationService.getUserMonetizationSummary(user.id);
  }

  @Post('checkout/subscription')
  @UseGuards(JwtAuthGuard)
  createSubscriptionCheckout(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSubscriptionCheckoutDto,
  ) {
    return this.monetizationService.createSubscriptionCheckoutSession(user.id, dto);
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  createCheckoutSessionAlias(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSubscriptionCheckoutDto,
  ) {
    return this.monetizationService.createSubscriptionCheckoutSession(user.id, dto);
  }

  @Post('checkout/donation')
  @UseGuards(JwtAuthGuard)
  createDonationCheckout(@CurrentUser() user: { id: string }, @Body() dto: CreateDonationCheckoutDto) {
    return this.monetizationService.createDonationCheckoutSession(user.id, dto);
  }

  @Post('create-donation-checkout')
  @UseGuards(JwtAuthGuard)
  createDonationCheckoutAlias(@CurrentUser() user: { id: string }, @Body() dto: CreateDonationCheckoutDto) {
    return this.monetizationService.createDonationCheckoutSession(user.id, dto);
  }

  @Post('checkout/verify')
  @UseGuards(JwtAuthGuard)
  verifyCheckout(@CurrentUser() user: { id: string }, @Body() dto: VerifyCheckoutSessionDto) {
    return this.monetizationService.verifyCheckoutSession(user.id, dto.sessionId);
  }

  @Post('subscriptions/:id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelSubscription(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.monetizationService.cancelSubscription(user.id, id);
  }

  @Post('webhook')
  @Public()
  handleWebhook(
    @Headers('stripe-signature') stripeSignature: string | string[] | undefined,
    @Req() request: Request & { rawBody?: Buffer },
  ) {
    return this.monetizationService.handleWebhook(stripeSignature, request.rawBody);
  }
}
