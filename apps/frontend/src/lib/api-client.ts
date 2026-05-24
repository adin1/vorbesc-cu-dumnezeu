const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(
  path: string,
  method: HttpMethod,
  body?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as { message?: string | string[]; error?: string };
      if (Array.isArray(payload.message)) {
        message = payload.message.join(', ');
      } else if (typeof payload.message === 'string' && payload.message.length > 0) {
        message = payload.message;
      } else if (typeof payload.error === 'string' && payload.error.length > 0) {
        message = payload.error;
      }
    } else {
      const text = await response.text();
      if (text.length > 0) {
        message = text;
      }
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
    denomination: string;
  };
};

export type ChatResponse = {
  type: 'normal' | 'crisis';
  structured: {
    warmMessage: string;
    verse: string;
    prayer: string;
    reflectionQuestion: string;
  };
  disclaimer: string;
};

export type SpiritualGuideMood = {
  id: string;
  slug: string;
  name: string;
};

export type SpiritualGuideResponse = {
  mood: string;
  warmMessage: string;
  verse: string;
  prayer: string;
  reflectionQuestion: string;
};

export type SpiritualDailyResponse = {
  verseOfDay: string;
  prayerOfDay: string;
};

export type AdminMetricsResponse = {
  users: number;
  prayers: number;
  journalEntries: number;
  prayerRequests: number;
  activePlans: number;
  totalDonations: number;
  totalSubscriptions: number;
  estimatedMonthlyRevenue: number;
  premiumUsers: number;
  activeMonetizationPlans: Array<{
    slug: string;
    name: string;
    subscribers: number;
  }>;
  facebookVisitors: number;
  facebookRegisteredUsers: number;
  facebookUsersStartedPlan: number;
  facebookUsersPostedPrayerRequest: number;
  refreshedAt: string;
};

export type Prayer = {
  id: string;
  title: string;
  content: string;
  category: { name: string };
  userId?: string;
};

export type GeneratedPrayerResponse = {
  topic: string;
  prayer: string;
  suggestion: string;
};

export type SpiritualPlan = {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  isPremium?: boolean;
  premiumTier?: string | null;
  locked?: boolean;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
};

export type UserSubscription = {
  id: string;
  status: string;
  startedAt: string;
  expiresAt?: string | null;
  provider: string;
  providerSubscriptionId?: string | null;
  plan: SubscriptionPlan;
};

export type Donation = {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  providerPaymentId?: string | null;
  message?: string | null;
  createdAt: string;
};

export type PremiumFeature = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
};

export type MonetizationSummary = {
  currentPlan: SubscriptionPlan | null;
  activeSubscription: UserSubscription | null;
  donationHistory: Donation[];
  quickDonationValues: number[];
  premiumFeatures: PremiumFeature[];
  featureAccess: {
    audioPrayers: boolean;
    pdfExport: boolean;
    premiumThemes: boolean;
    unlimitedFavorites: boolean;
    customNotifications: boolean;
    familyProfiles: boolean;
  };
  favoriteLimit: number | null;
  emails: {
    donationThankYou: { subject: string; preview: string; text: string; html: string };
    premiumConfirmation: { subject: string; preview: string; text: string; html: string };
    subscriptionExpiring: { subject: string; preview: string; text: string; html: string };
    premiumWelcome: { subject: string; preview: string; text: string; html: string };
  };
};

export type PrayerRequest = {
  id: string;
  content: string;
  anonymous: boolean;
  status: string;
  shareTarget?: string;
  facebookShareText?: string;
  supports: Array<{ id: string }>;
  createdAt?: string;
};

export type JournalEntry = {
  id: string;
  mood: string;
  burden: string;
  gratitude: string;
  prayerToday: string;
  createdAt: string;
};

export type JournalExport = {
  format: string[];
  json: JournalEntry[];
  pdfPlaceholder: string;
};

export type UserPlanProgress = {
  id: string;
  userId: string;
  planId: string;
  dayNumber: number;
  completed: boolean;
};

export type SpiritualPreference = {
  id?: string;
  userId?: string;
  preferredTone: string;
  spiritualGoal: string;
  confession: string;
};

export type ProfileResponse = {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  denomination: string;
  dailyStreak: number;
  notifyDaily: boolean;
  notifyCommunity: boolean;
  spiritualPreference: SpiritualPreference;
  favoriteVerses?: FavoriteVerse[];
  savedPrayers?: Prayer[];
  monetization?: MonetizationSummary;
};

export type CheckoutSessionResponse = {
  sessionId: string;
  url: string | null;
};

export type CheckoutVerificationResponse = {
  id: string;
  status: string | null;
  paymentStatus: string | null;
  mode: string;
  amountTotal: number | null;
  currency: string | null;
  customerEmail: string | null;
  metadata?: Record<string, string>;
};

export type ProfileStats = {
  favoriteVerses: number;
  savedPrayers: number;
  unreadNotifications: number;
  journalEntries: number;
  prayerRequests: number;
};

export type JournalTrendItem = {
  date: string;
  count: number;
};

export type JournalTrendResponse = {
  days: number;
  items: JournalTrendItem[];
};

export type DashboardResponse = {
  stats: ProfileStats;
  trend: JournalTrendResponse;
  latestNotifications: NotificationItem[];
  recommendation: {
    title: string;
    message: string;
    verse: string;
    actionLabel: string;
    actionPath: string;
  };
  quickActions: Array<{
    label: string;
    path: string;
    priority: number;
  }>;
};

export type DashboardCacheStats = {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
  evictionsExpired: number;
  evictionsCapacity: number;
  entries: number;
  hitRate: number;
  totalRequests: number;
  maxEntries: number;
};

export type DashboardCacheClearResponse = {
  removed: number;
  stats: DashboardCacheStats;
};

export type DashboardCachePermissions = {
  canClearAll: boolean;
};

export type FavoriteVerse = {
  id: string;
  reference: string;
  text: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  items: NotificationItem[];
  total: number;
  limit: number;
  offset: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export function register(payload: {
  email: string;
  password: string;
  name: string;
  denomination: string;
  acquisition?: {
    source?: string;
    medium?: string;
    campaign?: string;
    landingPage?: string;
    referrer?: string;
    firstVisitAt?: string;
  };
}) {
  return request<AuthResponse>('/auth/register', 'POST', payload);
}

export function login(payload: { email: string; password: string }) {
  return request<AuthResponse>('/auth/login', 'POST', payload);
}

export function me(token: string) {
  return request<AuthResponse['user']>('/auth/me', 'GET', undefined, token);
}

export function aiChat(token: string, message: string) {
  return request<ChatResponse>('/ai/chat', 'POST', { message }, token);
}

export function getSpiritualMoods(token: string) {
  return request<SpiritualGuideMood[]>('/spiritual-guide/moods', 'GET', undefined, token).then((items) =>
    items.map((item) => ({ id: item.id, slug: item.slug, name: item.name })),
  );
}

export function getSpiritualDaily(token: string) {
  return request<SpiritualDailyResponse>('/spiritual-guide/daily', 'GET', undefined, token);
}

export function sendSpiritualMessage(
  token: string,
  payload: { moodId?: string; mood?: string; userText?: string },
) {
  return request<SpiritualGuideResponse>('/spiritual-guide/message', 'POST', payload, token);
}

export function getAdminMetrics(token: string) {
  return request<AdminMetricsResponse>('/admin/metrics', 'GET', undefined, token);
}

export function getMonetizationPlans(token: string) {
  return request<SubscriptionPlan[]>('/monetization/plans', 'GET', undefined, token);
}

export function getMonetizationSummary(token: string) {
  return request<MonetizationSummary>('/monetization/me', 'GET', undefined, token);
}

export function createSubscriptionCheckout(token: string, planSlug: string) {
  return request<CheckoutSessionResponse>('/monetization/checkout/subscription', 'POST', { planSlug }, token);
}

export function createDonationCheckout(
  token: string,
  payload: { amount: number; currency?: 'RON' | 'EUR'; message?: string },
) {
  return request<CheckoutSessionResponse>('/monetization/checkout/donation', 'POST', payload, token);
}

export function verifyCheckoutSession(token: string, sessionId: string) {
  return request<CheckoutVerificationResponse>('/monetization/checkout/verify', 'POST', { sessionId }, token);
}

export function cancelSubscription(token: string, subscriptionId: string) {
  return request<MonetizationSummary>(`/monetization/subscriptions/${subscriptionId}/cancel`, 'POST', {}, token);
}

export function getPrayers(token: string) {
  return request<Prayer[]>('/prayers', 'GET', undefined, token);
}

export function generatePrayer(token: string, topic: string) {
  return request<GeneratedPrayerResponse>('/prayers/generate', 'POST', { topic }, token);
}

export function saveGeneratedPrayer(
  token: string,
  payload: { topic: string; prayer: string; suggestion?: string },
) {
  return request<Prayer>('/prayers/save-generated', 'POST', payload, token);
}

export function getPlans(token: string) {
  return request<SpiritualPlan[]>('/plans', 'GET', undefined, token);
}

export function getPlanById(token: string, planId: string) {
  return request<SpiritualPlan & { days: Array<{
    id: string;
    dayNumber: number;
    title: string;
    verse: string;
    explanation: string;
    prayer: string;
    reflectionQuestion: string;
  }> }>(`/plans/${planId}`, 'GET', undefined, token);
}

export function getPrayerRequests(token: string) {
  return request<PrayerRequest[]>('/prayer-requests', 'GET', undefined, token);
}

export function createPrayerRequest(token: string, payload: { content: string; anonymous?: boolean }) {
  return request<PrayerRequest>('/prayer-requests', 'POST', payload, token);
}

export function createPrayerRequestWithMode(
  token: string,
  payload: { content: string; anonymous?: boolean; publishMode?: 'APP_ONLY' | 'FACEBOOK_PREP' },
) {
  return request<PrayerRequest>('/prayer-requests', 'POST', payload, token);
}

export function supportPrayerRequest(token: string, prayerRequestId: string) {
  return request<{ id: string }>(`/prayer-requests/${prayerRequestId}/support`, 'POST', {}, token);
}

export function reportPrayerRequest(token: string, prayerRequestId: string, reason: string) {
  return request<PrayerRequest>(`/prayer-requests/${prayerRequestId}/report`, 'POST', { reason }, token);
}

export function getPendingPrayerRequests(token: string) {
  return request<Array<PrayerRequest & { user?: { id: string; email: string; name: string } }>>(
    '/prayer-requests/moderation/pending',
    'GET',
    undefined,
    token,
  );
}

export function moderatePrayerRequest(
  token: string,
  prayerRequestId: string,
  payload: { status: 'APPROVED' | 'REJECTED'; moderationNote?: string },
) {
  return request<PrayerRequest>(`/prayer-requests/moderation/${prayerRequestId}`, 'PATCH', payload, token);
}

export function postAcquisition(payload: {
  source: string;
  medium?: string;
  campaign?: string;
  landingPage?: string;
  referrer?: string;
  firstVisitAt?: string;
  userId?: string;
}) {
  return request<{ id: string }>('/analytics/acquisition', 'POST', payload);
}

export function getJournalEntries(token: string) {
  return request<JournalEntry[]>('/journal', 'GET', undefined, token);
}

export function createJournalEntry(
  token: string,
  payload: { mood: string; burden: string; gratitude: string; prayerToday: string },
) {
  return request<JournalEntry>('/journal', 'POST', payload, token);
}

export function updateJournalEntry(
  token: string,
  journalId: string,
  payload: Partial<{ mood: string; burden: string; gratitude: string; prayerToday: string }>,
) {
  return request<JournalEntry>(`/journal/${journalId}`, 'PATCH', payload, token);
}

export function deleteJournalEntry(token: string, journalId: string) {
  return request<JournalEntry>(`/journal/${journalId}`, 'DELETE', {}, token);
}

export function exportJournalEntries(token: string) {
  return request<JournalExport>('/journal/export', 'GET', undefined, token);
}

export function startPlan(token: string, planId: string) {
  return request<UserPlanProgress>(`/plans/${planId}/start`, 'POST', {}, token);
}

export function updatePlanProgress(
  token: string,
  progressId: string,
  payload: { dayNumber: number; completed?: boolean },
) {
  return request<UserPlanProgress>(`/plans/progress/${progressId}`, 'PATCH', payload, token);
}

export function getProfile(token: string) {
  return request<ProfileResponse>('/profile', 'GET', undefined, token);
}

export function getProfileStats(token: string) {
  return request<ProfileStats>('/profile/stats', 'GET', undefined, token);
}

export function getProfileTrend(token: string, days = 7) {
  return request<JournalTrendResponse>(`/profile/stats/trend?days=${days}`, 'GET', undefined, token);
}

export function getDashboard(token: string, days = 7) {
  return request<DashboardResponse>(`/profile/dashboard?days=${days}`, 'GET', undefined, token);
}

export function getDashboardCacheStats(token: string) {
  return request<DashboardCacheStats>('/profile/dashboard/cache-stats', 'GET', undefined, token);
}

export function resetDashboardCacheStats(token: string) {
  return request<DashboardCacheStats>('/profile/dashboard/cache-stats/reset', 'POST', {}, token);
}

export function clearDashboardCache(token: string) {
  return request<DashboardCacheClearResponse>('/profile/dashboard/cache/clear', 'POST', {}, token);
}

export function clearDashboardCacheAll(token: string) {
  return request<DashboardCacheClearResponse>('/profile/dashboard/cache/clear-all', 'POST', {}, token);
}

export function getDashboardCachePermissions(token: string) {
  return request<DashboardCachePermissions>('/profile/dashboard/cache/permissions', 'GET', undefined, token);
}

export function updateProfile(
  token: string,
  payload: {
    name?: string;
    denomination?: string;
    notifyDaily?: boolean;
    notifyCommunity?: boolean;
  },
) {
  return request<ProfileResponse>('/profile', 'PATCH', payload, token);
}

export function updateSpiritualPreference(
  token: string,
  payload: { preferredTone?: string; spiritualGoal?: string; confession?: string },
) {
  return request<SpiritualPreference>('/profile/preferences', 'PATCH', payload, token);
}

export function exportGdprData(token: string) {
  return request<Record<string, unknown>>('/gdpr/export', 'GET', undefined, token);
}

export function deleteGdprAccount(token: string) {
  return request<{ success: boolean }>('/gdpr/delete-account', 'DELETE', {}, token);
}

export function getFavoriteVerses(token: string, params?: { limit?: number; offset?: number }) {
  const query = new URLSearchParams();
  if (params?.limit !== undefined) {
    query.set('limit', String(params.limit));
  }
  if (params?.offset !== undefined) {
    query.set('offset', String(params.offset));
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<PaginatedResponse<FavoriteVerse>>(
    `/profile/favorite-verses${suffix}`,
    'GET',
    undefined,
    token,
  );
}

export function addFavoriteVerse(token: string, payload: { reference: string; text: string }) {
  return request<FavoriteVerse>('/profile/favorite-verses', 'POST', payload, token);
}

export function deleteFavoriteVerse(token: string, id: string) {
  return request<FavoriteVerse>(`/profile/favorite-verses/${id}`, 'DELETE', {}, token);
}

export function getSavedPrayers(token: string, params?: { limit?: number; offset?: number }) {
  const query = new URLSearchParams();
  if (params?.limit !== undefined) {
    query.set('limit', String(params.limit));
  }
  if (params?.offset !== undefined) {
    query.set('offset', String(params.offset));
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<PaginatedResponse<Prayer>>(`/profile/saved-prayers${suffix}`, 'GET', undefined, token);
}

export function deleteSavedPrayer(token: string, id: string) {
  return request<Prayer>(`/profile/saved-prayers/${id}`, 'DELETE', {}, token);
}

export function savePrayer(token: string, prayerId: string) {
  return request<Prayer>(`/prayers/${prayerId}/save`, 'POST', {}, token);
}

export function getNotifications(
  token: string,
  params?: { limit?: number; offset?: number; unreadOnly?: boolean },
) {
  const query = new URLSearchParams();
  if (params?.limit !== undefined) {
    query.set('limit', String(params.limit));
  }
  if (params?.offset !== undefined) {
    query.set('offset', String(params.offset));
  }
  if (params?.unreadOnly !== undefined) {
    query.set('unreadOnly', String(params.unreadOnly));
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<NotificationListResponse>(`/notifications${suffix}`, 'GET', undefined, token);
}

export function markNotificationRead(token: string, id: string) {
  return request<NotificationItem>(`/notifications/${id}/read`, 'PATCH', {}, token);
}

export function markAllNotificationsRead(token: string) {
  return request<{ count: number }>('/notifications/read-all', 'PATCH', {}, token);
}
