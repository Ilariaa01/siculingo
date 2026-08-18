<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
const isCardFlipped = ref(false)
const explanationDetails = ref(null)

const FEEDBACK_DURATION_MS = 900
const FLIP_DURATION_MS = 620
let feedbackTimerId = null
let flipTimerId = null

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

  if (flipTimerId !== null) {
    clearTimeout(flipTimerId)
    flipTimerId = null
  }
}

function normalizeToArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }

  return []
}

function buildExplanationDetails(question, selectedAnswer, correctAnswer, isCorrect) {
  const explanation = question?.explanation ?? {}
  const fallbackMeaning = correctAnswer?.text ?? ''
  const meanings = normalizeToArray(explanation.meanings ?? fallbackMeaning)

  const usageExample =
    explanation.usageExample ??
    `${question.value}: ${fallbackMeaning}.`

  const usageExplanation =
    explanation.usageExplanation ??
    `In pratica: ${question.value} corrisponde a ${fallbackMeaning.toLowerCase()}.`

  const origin =
    explanation.origin ??
    `L'origine precisa non e presente nei dati correnti. In questa scheda il termine e associato a "${fallbackMeaning}".`

  const originExplanation =
    explanation.originExplanation ??
    `Approfondimento: il termine ${question.value} e usato con questo significato nel lessico quotidiano.`

  const curiosity =
    explanation.curiosity ??
    `Curiosita linguistica: ripetere il termine in una frase aiuta a memorizzarne meglio l'uso.`

  return {
    isCorrect,
    selectedAnswer: selectedAnswer?.text ?? '',
    correctAnswer: correctAnswer?.text ?? '',
    subtitle: (isCorrect ? explanation.correctSubtitle : explanation.wrongSubtitle) ?? selectedAnswer?.text ?? fallbackMeaning,
    meanings,
    usageExample,
    usageExplanation,
    origin,
    originExplanation,
    curiosity,
  }
}

function resetCardState() {
  clearFeedbackTimer()
  answerFeedback.value = null
  isAnswering.value = false
  isCardFlipped.value = false
  explanationDetails.value = null
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
  if (!currentQuestion.value || isAnswering.value || isCardFlipped.value) {
    return
  }

  clearFeedbackTimer()
  const questionToStore = cloneQuestionWithSelection(currentQuestion.value, answerIndex)
  const selectedAnswer = currentQuestion.value.answers?.[answerIndex]
  const correctAnswer = currentQuestion.value.answers?.find((item) => item.correct) ?? null

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
  explanationDetails.value = buildExplanationDetails(currentQuestion.value, selectedAnswer, correctAnswer, selectedAnswer.correct)

  feedbackTimerId = setTimeout(() => {
    feedbackTimerId = null
    isCardFlipped.value = true
    flipTimerId = setTimeout(() => {
      isAnswering.value = false
      flipTimerId = null
    }, FLIP_DURATION_MS)
  }, FEEDBACK_DURATION_MS)
}

watch(
  () => questionsIndex.value,
  () => {
    resetCardState()
  },
)

function restartQuiz() {
  resetCardState()
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

function answerRandomly() {
  if (!questions.value.length) return

  resetCardState()
  questionsOk.value = []
  questionsKo.value = []

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

const explanationStatusLabel = computed(() => {
  if (!answerFeedback.value) {
    return ''
  }

  return answerFeedback.value.correct ? 'Risposta corretta' : 'Risposta errata'
})

const explanationStatusIcon = computed(() => {
  if (!answerFeedback.value) {
    return ''
  }

  return answerFeedback.value.correct ? 'check' : 'cross'
})

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
  <section class="flex h-full w-full flex-1 flex-col overflow-visible px-4 sm:px-0">

    <p v-if="fetchError" class="mx-auto max-w-4xl rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800 shadow-sm">
      {{ fetchError }}
    </p>

    <div v-else-if="questions.length === 0" class="mx-auto max-w-4xl rounded-[34px] bg-white p-6 text-center text-neutral-600 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
      Caricamento domande...
    </div>

    <div v-else-if="!isFinished" class="w-full">
      <div class="quiz-shell relative mx-auto w-full max-w-[1400px]" style="--card-width: min(72vw, 760px); --card-height: 370px; --arrow-gap: 100px;">
        <div class="mx-auto mb-4 flex w-[var(--card-width)] max-w-full items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm sm:px-6">
          <div class="h-3 flex-1 overflow-hidden rounded-full bg-[#D9DCE8]">
            <div
              class="h-full rounded-full bg-[#0B1334] transition-all duration-300"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
          <span class="text-xs font-semibold text-[#0B1334] sm:text-sm">{{ currentStep }} su {{ totalQuestions }}</span>
        </div>

        <div class="relative mx-auto h-[var(--card-height)] w-[var(--card-width)] max-w-full">
          <div class="quiz-flip-scene absolute left-1/2 top-0 h-full w-full -translate-x-1/2">
            <div class="quiz-flip-card" :class="{ 'is-flipped': isCardFlipped }">
              <div class="quiz-flip-face quiz-flip-front rounded-[32px] bg-white px-4 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:px-8 sm:py-7">
                <div class="mb-4 sm:mb-5">
                  <div class="w-full text-center">
                    <h2 class="text-[2.7rem] font-bold italic leading-none text-[#AD2E2E] sm:text-[3.2rem]">
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

              <div class="quiz-flip-face quiz-flip-back rounded-[32px] bg-white px-4 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:px-8 sm:py-7">
                <div class="w-full text-center">
                  <h2 class="text-[2.7rem] font-bold italic leading-none text-[#AD2E2E] sm:text-[3.2rem]">
                    {{ currentQuestion?.value || `Domanda ${currentStep}` }}
                  </h2>
                  <p class="mt-4 text-xl font-semibold italic text-[#1E2435] sm:text-2xl">
                    {{ explanationDetails?.subtitle || '' }}
                  </p>
                </div>

                <div
                  v-if="answerFeedback?.correct && explanationDetails"
                  class="mt-4 flex min-h-[44px] items-center justify-between gap-3 rounded-full bg-[#0B8742] px-5 text-white"
                >
                  <span class="text-sm font-semibold italic sm:text-[1.05rem]">Risposta corretta</span>
                  <span class="text-sm sm:text-[1.05rem]">{{ explanationDetails.correctAnswer }}</span>
                </div>

                <div
                  v-else-if="!answerFeedback?.correct && explanationDetails"
                  class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <div class="rounded-full bg-[#F6D9D9] px-4 py-2 text-sm font-semibold text-[#7B1A1A]">
                    Hai scelto: {{ explanationDetails.selectedAnswer }}
                  </div>
                  <div class="rounded-full bg-[#0B8742] px-4 py-2 text-sm font-semibold text-white">
                    Corretta: {{ explanationDetails.correctAnswer }}
                  </div>
                </div>

                <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <article class="rounded-[22px] bg-[#EAC656] px-5 py-4 text-[#171E32]">
                    <h3 class="text-center text-[1.7rem] font-bold italic text-[#171E32]">Come si usa?</h3>
                    <p class="mt-3 text-center text-[1.95rem] font-bold leading-tight text-[#AB2E33]">
                      {{ explanationDetails?.usageExample || '' }}
                    </p>
                    <p class="mt-3 text-center text-[1.35rem] leading-snug text-[#171E32]">
                      ({{ explanationDetails?.usageExplanation || '' }})
                    </p>
                    <p
                      v-if="!answerFeedback?.correct && explanationDetails?.meanings?.length"
                      class="mt-3 text-[1.1rem] leading-snug text-[#171E32]"
                    >
                      <span class="font-semibold">Significati:</span>
                      {{ explanationDetails.meanings.join(' ; ') }}
                    </p>
                  </article>

                  <article class="rounded-[22px] bg-[#EAC656] px-5 py-4 text-[#171E32]">
                    <h3 class="text-center text-[1.7rem] font-bold italic text-[#171E32]">Da dove viene?</h3>
                    <p class="mt-3 text-[1.25rem] leading-snug text-[#171E32]">{{ explanationDetails?.origin || '' }}</p>
                    <p class="mt-3 text-[1.25rem] leading-snug text-[#171E32]">
                      <span class="font-semibold">Curiosita:</span>
                      {{ explanationDetails?.curiosity || '' }}
                    </p>
                    <p
                      v-if="!answerFeedback?.correct"
                      class="mt-3 text-[1.1rem] leading-snug text-[#171E32]"
                    >
                      {{ explanationDetails?.originExplanation || '' }}
                    </p>
                  </article>
                </div>

                <div
                  v-if="explanationStatusLabel"
                  class="pointer-events-none absolute -bottom-7 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-[0_10px_28px_rgba(0,0,0,0.24)]"
                  :class="explanationStatusIcon === 'check' ? 'bg-[#0B8742]' : 'bg-[#B93333]'"
                >
                  <svg v-if="explanationStatusIcon === 'check'" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                    <path d="M5 13L10 18L19 7" fill="none" stroke="currentColor" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                    <path d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5" fill="none" stroke="currentColor" stroke-width="3.8" stroke-linecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="absolute left-[calc(50%-var(--card-width)/2-var(--arrow-gap))] top-[170px] z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center overflow-visible rounded-full bg-white text-[#0B1334] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-out hover:scale-110 hover:brightness-95 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="questionsIndex === 0 || isAnswering"
          @click="goPreviousQuestion"
          aria-label="Domanda precedente"
        >
          <svg viewBox="0 0 20 20" width="16" height="16" class="block" aria-hidden="true" style="overflow: visible;">
            <path d="M12.75 4.75L7.5 10L12.75 15.25" transform="translate(-0.8 0)" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          class="absolute left-[calc(50%+var(--card-width)/2+var(--arrow-gap))] top-[170px] z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center overflow-visible rounded-full bg-white text-[#0B1334] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-out hover:scale-110 hover:brightness-95 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="isAnswering"
          @click="goNextQuestion"
          aria-label="Domanda successiva"
        >
          <svg viewBox="0 0 20 20" width="16" height="16" class="block" aria-hidden="true" style="overflow: visible;">
            <path d="M7.25 15.25L12.5 10L7.25 4.75" transform="translate(0.8 0)" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
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

<style scoped>
.quiz-flip-scene {
  perspective: 1800px;
}

.quiz-flip-card {
  position: relative;
  height: 100%;
  width: 100%;
  transform-style: preserve-3d;
  transition: transform 620ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

.quiz-flip-card.is-flipped {
  transform: rotateY(180deg);
}

.quiz-flip-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.quiz-flip-back {
  transform: rotateY(180deg);
}
</style>
