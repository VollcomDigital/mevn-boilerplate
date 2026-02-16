export default defineNuxtConfig({
  ssr: true,
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? "http://api:4000"
    }
  },
  nitro: {
    preset: "node-cluster",
    compressPublicAssets: true,
    routeRules: {
      "/": {
        headers: {
          "cache-control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300"
        }
      },
      "/api/health/**": {
        headers: {
          "cache-control": "no-store"
        }
      }
    }
  }
});
