
<script setup>
import { onMounted, computed } from 'vue'
import Quiz from '../components/Quiz.vue'
import { useGlobal } from '../composables/global'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, ensureUserAccount, getAccountByUid } from '../firebase.js'
import SiculingoImage from '../assets/Image_siculingo.svg'
import Logo from '../assets/logo.svg'
import LemonBackground from '../assets/sfondo_limone.svg'

// Replace the hex color below with your desired background color.
// Example: const backgroundColor = '#FFEFD5'
const backgroundColor = '#111625'

const homeStyle = computed(() => ({
  backgroundColor,
}))

const quizPageStyle = computed(() => ({
  backgroundImage: `url(${LemonBackground})`,
}))


const global = useGlobal()

async function connectWithGoogle() {
  try {
    global.loading++
    const { user: firebaseUser } = await signInWithPopup(auth, googleProvider)
    await ensureUserAccount(firebaseUser)
    global.account = await getAccountByUid(firebaseUser.uid)
  } catch (err) {
    const code = err?.code
    if (code === 'auth/popup-closed-by-user') return
    console.error('[auth] connectWithGoogle failed', err)
  } finally {
    global.loading--
  }
}

onMounted(() => {
  global.dialog = {
    title: 'Benvenuto!',
    content: 'Questa è la home view. Esplora gli elementi disponibili.',
  }

})

</script>

<template>
  <div class="home-view relative w-full min-h-dvh overflow-hidden" :style="homeStyle">
    <div v-if="!global.account" class="absolute inset-0 z-0">
      <img :src="SiculingoImage" alt="Siculingo" class="absolute inset-0 h-full w-full object-cover object-center" />
      <div class="absolute inset-0 bg-black/15"></div>
    </div>

    <div class="relative z-10 flex min-h-dvh flex-col px-0">
      <div v-if="!global.account" class="relative h-dvh w-full overflow-hidden">
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div class="flex flex-col items-center justify-center gap-7 sm:gap-8">
            <img :src="Logo" alt="Logo Siculingo" class="h-24 w-auto drop-shadow-[0_8px_12px_rgba(0,0,0,0.22)] sm:h-32 md:h-36" />
            <div class="pointer-events-auto">
            <button type="button" class="inline-block rounded-full bg-[#E5C158] px-6 py-2.5 font-semibold text-[#111625] shadow-md transition hover:brightness-95" @click="connectWithGoogle">Accedi</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="quiz-page relative min-h-dvh w-full overflow-hidden bg-[#0A1230]" :style="quizPageStyle">
        <div class="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 pb-6 pt-4 sm:px-8 sm:pt-6">
          <div class="flex flex-1 items-center justify-center py-4 sm:py-6">
            <Quiz />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-page {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
