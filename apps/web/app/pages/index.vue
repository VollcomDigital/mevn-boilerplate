<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();

const { data, pending, error, refresh } = await useAsyncData(
  "api-info",
  () => $fetch(`${runtimeConfig.public.apiBaseUrl}/api/v1/info`),
  {
    server: true,
    dedupe: "defer"
  }
);
</script>

<template>
  <main style="font-family: Inter, sans-serif; margin: 2rem auto; max-width: 720px; line-height: 1.5;">
    <h1>Cloud Native MEVN Platform</h1>
    <p>
      Nuxt 4 SSR is enabled and this page uses <code>useAsyncData</code> to fetch backend status during server rendering.
    </p>

    <button type="button" style="margin-bottom: 1rem;" @click="refresh()">
      Refresh API Status
    </button>

    <p v-if="pending">Loading backend status...</p>
    <p v-else-if="error">Backend error: {{ error.message }}</p>
    <pre v-else>{{ data }}</pre>
  </main>
</template>
