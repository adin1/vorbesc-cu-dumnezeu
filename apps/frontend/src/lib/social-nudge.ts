const SOCIAL_NUDGE_DATE_KEY = 'social_nudge_date_v1';
const SOCIAL_NUDGE_COUNT_KEY = 'social_nudge_count_v1';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function consumeDailySocialNudge(maxPerDay = 2) {
  if (typeof window === 'undefined') {
    return false;
  }

  const currentDay = today();
  const storedDay = window.localStorage.getItem(SOCIAL_NUDGE_DATE_KEY);
  const rawCount = window.localStorage.getItem(SOCIAL_NUDGE_COUNT_KEY);
  const count = Number.parseInt(rawCount || '0', 10);

  if (storedDay !== currentDay) {
    window.localStorage.setItem(SOCIAL_NUDGE_DATE_KEY, currentDay);
    window.localStorage.setItem(SOCIAL_NUDGE_COUNT_KEY, '1');
    return true;
  }

  if (count >= maxPerDay) {
    return false;
  }

  window.localStorage.setItem(SOCIAL_NUDGE_COUNT_KEY, String(count + 1));
  return true;
}
