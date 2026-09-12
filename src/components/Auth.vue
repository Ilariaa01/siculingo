<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, ensureUserAccount, getAccountByUid } from '../firebase.js'
import Logo from '../assets/SicuLingo_loogo.svg'

import { useGlobal } from '../composables/global.js'
const global = useGlobal()

const user = ref(null)

let unsubscribeAuth = () => {}

onMounted(() => {
  
  unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
    global.loading ++
    user.value = u
    if (!u) {
      global.account = null
      global.loading --
      return
    }
    try {
      await ensureUserAccount(u)
      global.account = await getAccountByUid(u.uid)
    } finally {
      global.loading --
    }
  })
})

onUnmounted(() => {
  unsubscribeAuth()
})

async function logout() {
  await firebaseSignOut(auth)
}
</script>

<template>
  <header v-if="user" class="w-full flex-none bg-[#0A1230] text-white shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
    <div class="mx-auto flex w-full max-w-none items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
      <img :src="Logo" alt="Siculingo" class="h-8 w-auto sm:h-10 lg:h-11" />

      <div class="flex items-center gap-3">
        <img
          v-if="user.photoURL"
          :src="user.photoURL"
          :alt="user.displayName || 'User'"
          class="h-9 w-9 rounded-full object-cover ring-2 ring-white/20"
          referrerpolicy="no-referrer"
          width="36"
          height="36"
        />
        <span class="text-sm font-medium text-white sm:text-base">
          {{ user.displayName || user.email || 'User' }}
        </span>
        <button
          type="button"
          class="cursor-pointer text-sm font-medium text-white/80 underline-offset-2 transition hover:text-white hover:underline"
          @click="logout"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
</template>
