export default function manifest() {
    return {
      name: 'ArogyaQueue - Smart OPD',
      short_name: 'ArogyaQueue',
      description: 'AI-Powered OPD Queue & Smart Triage System for I.G.M. Hospital',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#2563eb', // Blue theme match karne ke liye
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
      ],
    }
  }