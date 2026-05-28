<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, ensureUserAccount, getAccountByUid } from '../firebase.js'

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
  <header class="w-full">
    <div class="mx-auto flex items-center justify-end gap-3">
      <template v-if="user">
        <div class="flex items-center gap-3">
          <img
            v-if="user.photoURL"
            :src="user.photoURL"
            :alt="user.displayName || 'User'"
            class="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
            referrerpolicy="no-referrer"
            width="36"
            height="36"
          />
          <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {{ user.displayName || user.email || 'User' }}
          </span>
          <button
            type="button"
            class="text-sm font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </template>
    </div>
  </header>
</template>
