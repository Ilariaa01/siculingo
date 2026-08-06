<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Answers from './Answers.vue'
import ResultKo from './ResultKo.vue'
import ResultOk from './ResultOk.vue'
import { useGlobal } from '../composables/global'

const global = useGlobal()

const questions = ref([])
const questionsOk = ref([])
const questionsKo = ref([])
const questionsIndex = ref(0)
const questionsOkRequired = 15
const fetchError = ref('')
const answerFeedback = ref(null)
const isAnswering = ref(false)

const FEEDBACK_DURATION_MS = 900
let feedbackTimerId = null

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
  return questionsOk.value.length >= questionsOkRequired
})

function clearFeedbackTimer() {
  if (feedbackTimerId !== null) {
    clearTimeout(feedbackTimerId)
    feedbackTimerId = null
  }
}

function shuffleAnswers(answers) {
  const shuffledAnswers = [...answers]

  for (let index = shuffledAnswers.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffledAnswers[index], shuffledAnswers[randomIndex]] = [shuffledAnswers[randomIndex], shuffledAnswers[index]]
  }

  return shuffledAnswers
}

async function loadQuestions() {
  fetchError.value = ''
  global.loading += 1
  try {
    const response = await fetch('/data.json')
    if (!response.ok) {
      throw new Error('Errore durante il caricamento delle domande')
    }

    const payload = await response.json()
    if (!Array.isArray(payload)) {
      throw new Error('Il file data.json non contiene un array valido')
    }

    questions.value = payload.map((item) => ({
      ...item,
      question: {
        ...item.question,
        answers: shuffleAnswers(item.question.answers),
      },
    }))
  } catch (error) {
    fetchError.value = error?.message || 'Errore sconosciuto'
  } finally {
    global.loading -= 1
  }
}

function cloneQuestionWithSelection(question, answerIndex) {
  const selectedAnswer = question.answers[answerIndex] ?? null
  const correctAnswer = question.answers.find((answer) => answer.correct) ?? null

  return {
    ...question,
    questionIndex: questionsIndex.value,
    selectedAnswer: selectedAnswer ? { ...selectedAnswer, selected: true } : null,
    correctAnswer: correctAnswer ? { ...correctAnswer } : null,
    answers: question.answers.map((answer, index) => ({
      ...answer,
      selected: index === answerIndex,
    })),
  }
}

function onAnswerSelected({ answer, answerIndex }) {
  if (!currentQuestion.value || isAnswering.value) {
    return
  }

  clearFeedbackTimer()
  const questionToStore = cloneQuestionWithSelection(currentQuestion.value, answerIndex)
  const selectedAnswer = currentQuestion.value.answers?.[answerIndex]

  if (!selectedAnswer) {
    return
  }

  if (selectedAnswer.correct) {
    questionsOk.value.push(questionToStore)
  } else {
    questionsKo.value.push(questionToStore)
  }

  isAnswering.value = true
  answerFeedback.value = {
    index: answerIndex,
    correct: selectedAnswer.correct,
  }

  feedbackTimerId = setTimeout(() => {
    questionsIndex.value += 1
    answerFeedback.value = null
    isAnswering.value = false
    feedbackTimerId = null
  }, FEEDBACK_DURATION_MS)
}

function restartQuiz() {
  clearFeedbackTimer()
  questionsIndex.value = 0
  questionsOk.value = []
  questionsKo.value = []
  answerFeedback.value = null
  isAnswering.value = false
}

function goPreviousQuestion() {
  if (questionsIndex.value === 0) return
  questionsIndex.value -= 1
}

function goNextQuestion() {
  if (isFinished.value) return
  questionsIndex.value += 1
}

function answerRandomly() {
  if (!questions.value.length) return

  clearFeedbackTimer()
  questionsOk.value = []
  questionsKo.value = []
  answerFeedback.value = null
  isAnswering.value = false

  for (const item of questions.value) {
    const question = item.question
    const randomIndex = Math.floor(Math.random() * question.answers.length)
    const questionToStore = cloneQuestionWithSelection(question, randomIndex)

    if (question.answers[randomIndex].correct) {
      questionsOk.value.push(questionToStore)
    } else {
      questionsKo.value.push(questionToStore)
    }
  }

  questionsIndex.value = questions.value.length
}

defineExpose({
  questions,
  questionsIndex,
  isFinished,
  answerRandomly,
})

onMounted(() => {
  loadQuestions()
})

onBeforeUnmount(() => {
  clearFeedbackTimer()
})
</script>

<template>
  <section class="flex h-full w-full flex-1 flex-col overflow-hidden px-4 sm:px-0">

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

      <div class="flex items-center justify-center gap-6 xl:gap-10">
        <button
          type="button"
          class="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white text-2xl font-semibold leading-none text-[#0B1334] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:scale-105 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 sm:flex sm:h-16 sm:w-16 sm:text-3xl"
          :disabled="questionsIndex === 0 || isAnswering"
          @click="goPreviousQuestion"
        >
          ←
        </button>

        <div class="w-full max-w-[860px] rounded-[34px] bg-white px-4 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:px-8 sm:py-7">
          <div class="mb-4 sm:mb-5">
            <div class="w-full text-center">
              <h2 class="text-4xl font-bold italic leading-none text-[#AD2E2E] sm:text-5xl">
                {{ currentQuestion?.value || `Domanda ${currentStep}` }}
              </h2>
              <p class="mt-4 text-xl font-semibold text-[#1E2435] sm:text-2xl">Cosa significa</p>
            </div>
          </div>

          <Answers
            v-if="currentQuestion"
            :question="currentQuestion"
            :feedback="answerFeedback"
            :disabled="isAnswering"
            @select="onAnswerSelected"
          />
        </div>

        <button
          type="button"
          class="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white text-2xl font-semibold leading-none text-[#0B1334] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:scale-105 hover:brightness-95 sm:flex sm:h-16 sm:w-16 sm:text-3xl"
          :disabled="isAnswering"
          @click="goNextQuestion"
        >
          →
        </button>
      </div>
    </div>

    <div v-else class="flex h-full min-h-0 w-full flex-1 overflow-hidden">
      <ResultOk
        v-if="isQuizPassed"
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
    </div>
  </section>
</template>
