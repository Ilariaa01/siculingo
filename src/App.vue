<script setup>
import { onMounted, provide } from 'vue'
import { createGlobalState, globalInjectionKey } from './composables/global.js'

import Auth from './components/Auth.vue'
import Dialog from './components/Dialog.vue'
import Loading from './components/Loading.vue'

const global = createGlobalState()
provide(globalInjectionKey, global)


onMounted(() => {
  
})
</script>

<template>
  <Loading v-if="global.loading > 0" />
  <Dialog />
  <div class="min-h-screen flex flex-col">
    <main
      class="mx-auto flex w-full max-w-none flex-1 flex-col items-stretch"
    >
      <Auth />
      <router-view />
    </main>
  </div>
</template>
