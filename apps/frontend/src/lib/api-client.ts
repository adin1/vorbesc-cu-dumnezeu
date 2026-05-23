const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
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

export type Prayer = {
  id: string;
  title: string;
  content: string;
  category: { name: string };
  userId?: string;
};

export type SpiritualPlan = {
  id: string;
  title: string;
  description: string;
  durationDays: number;
};

export type PrayerRequest = {
  id: string;
  content: string;
  anonymous: boolean;
  status: string;
  supports: Array<{ id: string }>;
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
  denomination: string;
  dailyStreak: number;
  notifyDaily: boolean;
  notifyCommunity: boolean;
  spiritualPreference: SpiritualPreference;
  favoriteVerses?: FavoriteVerse[];
  savedPrayers?: Prayer[];
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

export function getPrayers(token: string) {
  return request<Prayer[]>('/prayers', 'GET', undefined, token);
}

export function getPlans(token: string) {
  return request<SpiritualPlan[]>('/plans', 'GET', undefined, token);
}

export function getPrayerRequests(token: string) {
  return request<PrayerRequest[]>('/prayer-requests', 'GET', undefined, token);
}

export function createPrayerRequest(token: string, payload: { content: string; anonymous?: boolean }) {
  return request<PrayerRequest>('/prayer-requests', 'POST', payload, token);
}

export function supportPrayerRequest(token: string, prayerRequestId: string) {
  return request<{ id: string }>(`/prayer-requests/${prayerRequestId}/support`, 'POST', {}, token);
}

export function reportPrayerRequest(token: string, prayerRequestId: string, reason: string) {
  return request<PrayerRequest>(`/prayer-requests/${prayerRequestId}/report`, 'POST', { reason }, token);
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
