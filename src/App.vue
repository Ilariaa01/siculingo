<script setup>
import { onMounted, provide } from "vue";
import { createGlobalState, globalInjectionKey } from "./composables/global.js";

import Auth from "./components/Auth.vue";
import Loading from "./components/Loading.vue";

const global = createGlobalState();
provide(globalInjectionKey, global);

onMounted(() => {});
</script>

<template>
  <Loading v-if="global.loading > 0" />
  <div class="flex h-dvh flex-col overflow-hidden">
    <Auth />

    <main
      class="mx-auto flex h-full w-full max-w-none flex-1 flex-col items-stretch overflow-hidden"
    >
      <router-view />
    </main>
  </div>
</template>
