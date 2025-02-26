<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup>
useHead({
  link: [
    { rel: 'manifest', href: '/manifest.json' }
  ]
})
</script>
