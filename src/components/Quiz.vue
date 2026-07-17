<script setup>
import { computed, onMounted, ref } from 'vue'
import Answers from './Answers.vue'
import ResultKo from './ResultKo.vue'
import ResultOk from './ResultOk.vue'
import { useGlobal } from '../composables/global'

const global = useGlobal()

const questions = ref([])
const questionsOk = ref([])
const questionsKo = ref([])
const questionsIndex = ref(0)
const questionsOkRequired = 3
const fetchError = ref('')

const currentQuestion = computed(() => {
  if (questionsIndex.value >= questions.value.length) {
    return null
  }
  return questions.value[questionsIndex.value]?.question ?? null
})

const isFinished = computed(() => {
  return questions.value.length > 0 && questionsIndex.value >= questions.value.length
})

const totalQuestions = computed(() => questions.value.length || 1)

const currentStep = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.min(questionsIndex.value + 1, questions.value.length)
})

const progressPercent = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.min((questionsIndex.value / questions.value.length) * 100, 100)
})

const isQuizPassed = computed(() => {
  return questionsOk.value.length > questionsOkRequired
})

async function loadQuestions() {
  fetchError.value = ''
  try {
    const response = await fetch('/data.json')
    if (!response.ok) {
      throw new Error('Errore durante il caricamento delle domande')
    }

    const payload = await response.json()
    if (!Array.isArray(payload)) {
      throw new Error('Il file data.json non contiene un array valido')
    }

    questions.value = payload
  } catch (error) {
    fetchError.value = error?.message || 'Errore sconosciuto'
  }
}

function cloneQuestionWithSelection(question, answerIndex) {
  return {
    ...question,
    questionIndex: questionsIndex.value,
    answers: question.answers.map((answer, index) => ({
      ...answer,
      selected: index === answerIndex,
    })),
  }
}

function showDialogMessage(content) {
  global.dialog = {
    title: 'Quiz',
    content,
  }
}

function onAnswerSelected({ answer, answerIndex }) {
  if (!currentQuestion.value) {
    return
  }

  const questionToStore = cloneQuestionWithSelection(currentQuestion.value, answerIndex)

  if (answer.correct) {
    questionsOk.value.push(questionToStore)
    showDialogMessage('risposta esatta')
  } else {
    questionsKo.value.push(questionToStore)
    showDialogMessage('risposta sbagliata')
  }

  questionsIndex.value += 1
}

function restartQuiz() {
  questionsIndex.value = 0
  questionsOk.value = []
  questionsKo.value = []
}

function goPreviousQuestion() {
  if (questionsIndex.value === 0) return
  questionsIndex.value -= 1
}

function goNextQuestion() {
  if (isFinished.value) return
  questionsIndex.value += 1
}

onMounted(() => {
  loadQuestions()
})
</script>

<template>
  <section class="w-full px-4 sm:px-0">

    <p v-if="fetchError" class="mx-auto max-w-4xl rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800 shadow-sm">
      {{ fetchError }}
    </p>

    <div v-else-if="questions.length === 0" class="mx-auto max-w-4xl rounded-[34px] bg-white p-6 text-center text-neutral-600 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
      Caricamento domande...
    </div>

    <div v-else-if="!isFinished" class="w-full">
      <div class="mx-auto mb-4 flex w-full max-w-[860px] items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm sm:px-6">
        <div class="h-3 flex-1 overflow-hidden rounded-full bg-[#D9DCE8]">
          <div
            class="h-full rounded-full bg-[#0B1334] transition-all duration-300"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <span class="text-xs font-semibold text-[#0B1334] sm:text-sm">{{ currentStep }} su {{ totalQuestions }}</span>
      </div>

      <div class="flex items-center justify-center gap-2 sm:gap-4">
        <button
          type="button"
          class="hidden h-[92px] w-[92px] items-center justify-center rounded-full bg-white text-6xl font-semibold leading-none text-[#0B1334] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:scale-105 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 sm:flex sm:h-[110px] sm:w-[110px]"
          :disabled="questionsIndex === 0"
          @click="goPreviousQuestion"
        >
          ←
        </button>

        <div class="w-full max-w-[860px] rounded-[34px] bg-white px-4 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:px-8 sm:py-7">
          <div class="mb-4 flex items-start justify-between gap-3 sm:mb-5">
            <div class="w-full text-center">
              <h2 class="text-4xl font-bold italic leading-none text-[#AD2E2E] sm:text-5xl">
                {{ currentQuestion?.value || `Domanda ${currentStep}` }}
              </h2>
              <p class="mt-4 text-xl font-semibold text-[#1E2435] sm:text-2xl">Cosa significa?</p>
            </div>
            <button
              type="button"
              class="rounded-full p-1 text-4xl leading-none text-[#1E2435] transition hover:bg-black/5"
              @click="goNextQuestion"
              aria-label="Salta domanda"
            >
              ×
            </button>
          </div>

          <Answers
            v-if="currentQuestion"
            :question="currentQuestion"
            @select="onAnswerSelected"
          />
        </div>

        <button
          type="button"
          class="hidden h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-6xl font-semibold leading-none text-[#0B1334] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:scale-105 hover:brightness-95 sm:flex sm:h-[110px] sm:w-[110px]"
          @click="goNextQuestion"
        >
          →
        </button>
      </div>
    </div>

    <ResultOk
      v-else-if="isQuizPassed"
      :questions-ok="questionsOk"
      :questions-ko="questionsKo"
      :questions-ok-required="questionsOkRequired"
      @restart="restartQuiz"
    />

    <ResultKo
      v-else
      :questions-ok="questionsOk"
      :questions-ko="questionsKo"
      :questions-ok-required="questionsOkRequired"
      @restart="restartQuiz"
    />
  </section>
</template>
