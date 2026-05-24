import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vorbește cu Dumnezeu',
    short_name: 'VCD',
    description: 'Sprijin spiritual creștin cu rugăciuni, planuri și comunitate.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f2e9',
    theme_color: '#1f3a5f',
    lang: 'ro',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
