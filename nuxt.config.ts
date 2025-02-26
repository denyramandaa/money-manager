// https://nuxt.com/docs/api/configuration/nuxt-config
import VitePluginWasm from 'vite-plugin-wasm';
export default defineNuxtConfig({
  plugins: [
    '~/plugins/firebaseClient.js',
  ],
  vite: {
    plugins: [
      VitePluginWasm(),
    ],
  },
  devtools: { enabled: false },
  runtimeConfig: {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    public: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      ALLOWED_USER: process.env.ALLOWED_USER,
    }
  },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-highcharts',
    '@nuxt/icon',
    '@nuxtjs/google-fonts',
    '@vite-pwa/nuxt'
  ],
  googleFonts: {
    families: {
      'Francois+One': true,
      'Zain': true,
      'Carrois+Gothic': true,
    },
  },
  css: [
    '@/assets/css/main.css'
  ]
})