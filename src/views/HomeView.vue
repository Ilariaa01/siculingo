
<script setup>
import { onMounted, onUnmounted, computed, ref, watch } from 'vue'
import ItemsList from '../components/ItemsList.vue'
import Quiz from '../components/Quiz.vue'
import { useGlobal } from '../composables/global'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, ensureUserAccount, getAccountByUid } from '../firebase.js'
import Logo from '../assets/logo.svg'
import SicilyShape from '../assets/formasicilia.svg'
import BeachImage from '../assets/spiaggia.jpg'
import ScalaImage from '../assets/scala-dei-turchi-agrigento.jpg'

// Replace the hex color below with your desired background color.
// Example: const backgroundColor = '#FFEFD5'
const backgroundColor = '#111625'

const homeStyle = computed(() => ({
  backgroundColor,
}))

const sicilyMaskStyle = computed(() => ({
  WebkitMaskImage: `url(${SicilyShape})`,
  maskImage: `url(${SicilyShape})`,
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center bottom',
  maskPosition: 'center bottom',
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
}))

const sceneryImages = [BeachImage, ScalaImage]
const currentSceneryIndex = ref(0)
let sceneryTimer = null

const currentSceneryImage = computed(() => sceneryImages[currentSceneryIndex.value])


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
  if (!global.account) {
    sceneryTimer = window.setInterval(() => {
      currentSceneryIndex.value = (currentSceneryIndex.value + 1) % sceneryImages.length
    }, 4000)
  }
  global.dialog = {
    title: 'Benvenuto!',
    content: 'Questa è la home view. Esplora gli elementi disponibili.',
  }

})

onUnmounted(() => {
  if (sceneryTimer) {
    window.clearInterval(sceneryTimer)
    sceneryTimer = null
  }
})

</script>

<template>
  <div class="home-view relative w-full min-h-screen overflow-hidden" :style="homeStyle">
    <div v-if="!global.account" class="pointer-events-none absolute inset-0 z-0">
      <div class="absolute inset-0 h-screen w-screen" :style="sicilyMaskStyle">
        <img :src="currentSceneryImage" alt="Paesaggio siciliano" class="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#111625]/20 via-transparent to-transparent"></div>
      </div>
    </div>

    <div class="relative z-10 flex min-h-screen flex-col px-0">
      <div v-if="!global.account" class="relative min-h-screen w-full overflow-hidden">
        <div class="relative z-50 pointer-events-auto flex flex-col items-center justify-center gap-4 w-full transform translate-y-6 py-12 max-h-[60vh]">
          <div class="flex flex-col items-center gap-2 px-0">
            <img :src="Logo" alt="Logo" class="h-20 w-auto sm:h-28" />

              <div class="text-center">
                <p class="mb-2 text-base sm:text-lg font-medium text-neutral-100">Benvenuto — prova il quiz sul dialetto siculo</p>
                <button type="button" class="mt-2 mb-2 inline-block rounded-full bg-[#E5C158] px-4 py-2 font-semibold text-[#111625] shadow-sm transition hover:brightness-95" @click="connectWithGoogle">Accedi</button>
              </div>
          </div>
        </div>
      </div>

      <div v-else class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 py-8">
        <ItemsList />
        <Quiz />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
