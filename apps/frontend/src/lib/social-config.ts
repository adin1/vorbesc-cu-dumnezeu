export const socialConfig = {
  urls: {
    tiktok:
      process.env.NEXT_PUBLIC_TIKTOK_URL?.trim() ||
      'https://www.tiktok.com/@vorbestecudumnezeu',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_GROUP_URL?.trim() || '',
    app:
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_PUBLIC_URL?.trim() ||
      'https://vorbeste-cu-dumnezeu.vercel.app',
  },
  utm: {
    tiktok: {
      bio: 'utm_source=tiktok&utm_medium=bio&utm_campaign=profile',
      video: 'utm_source=tiktok&utm_medium=video&utm_campaign=launch',
      comment: 'utm_source=tiktok&utm_medium=comment&utm_campaign=community',
      landing: 'utm_source=tiktok&utm_medium=landing&utm_campaign=profile',
    },
    facebook: {
      group: 'utm_source=facebook&utm_medium=group&utm_campaign=comunitate',
      post: 'utm_source=facebook&utm_medium=post&utm_campaign=comunitate',
      landing: 'utm_source=facebook&utm_medium=landing&utm_campaign=community',
    },
  },
  ctas: {
    followTikTok: 'Urmărește-ne pe TikTok',
    joinFacebook: 'Intră în comunitatea Facebook',
    openApp: 'Deschide aplicația',
    support: 'Susține comunitatea',
    premium: 'Descoperă Premium',
    grow: 'Ajută proiectul să crească',
  },
  tracking: {
    enabled: true,
    requireConsent: true,
  },
};

export function appendUtm(url: string, utmQuery: string) {
  if (!url) return '';
  return `${url}${url.includes('?') ? '&' : '?'}${utmQuery}`;
}
