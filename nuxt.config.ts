// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

const demo = process.env.NUXT_PUBLIC_DEMO === 'true' || process.env.NUXT_PUBLIC_DEMO === '1'

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      demo
    }
  },
  nitro: demo
    ? { prerender: { ignore: ['/admin', '/admin/**', '/doctor', '/doctor/**', '/account', '/login'] } }
    : undefined,
  vite: { plugins: [tailwindcss()] },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' }
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  components: [
    { path: '~/components', pathPrefix: false },
    { path: '~/features/admin/components', pathPrefix: false },
    { path: '~/features/landing/sections', pathPrefix: false }
  ],
  devtools: { enabled: true }
})
