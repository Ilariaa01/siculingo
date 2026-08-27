<script setup>
import { computed, onMounted, ref } from 'vue'

const history = ref([])
const expandedQuiz = ref(null)

const QUESTIONS_TOTAL = 24
const QUESTIONS_REQUIRED = 15

const sortedHistory = computed(() => {
  return [...history.value].reverse()
})

function loadHistory() {
  try {
    const savedHistory = localStorage.getItem('quizHistory')

    if (!savedHistory) {
      history.value = []
      return
    }

    const parsedHistory = JSON.parse(savedHistory)

    if (Array.isArray(parsedHistory)) {
      history.value = parsedHistory
    } else {
      history.value = []
    }
  } catch (error) {
    console.error(
      'Errore durante il caricamento dello storico:',
      error
    )

    history.value = []
  }
}

function clearHistory() {
  const confirmed = window.confirm(
    'Sei sicuro di voler cancellare definitivamente tutto lo storico dei quiz?'
  )

  if (!confirmed) return

  localStorage.removeItem('quizHistory')
  history.value = []
  expandedQuiz.value = null
}

function toggleQuiz(index) {
  if (expandedQuiz.value === index) {
    expandedQuiz.value = null
  } else {
    expandedQuiz.value = index
  }
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Data non disponibile'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 'Data non disponibile'
  }

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getCorrectAnswers(quiz) {
  if (typeof quiz.correct === 'number') {
    return quiz.correct
  }

  if (Array.isArray(quiz.questionsOk)) {
    return quiz.questionsOk.length
  }

  return 0
}

function getWrongAnswers(quiz) {
  if (typeof quiz.wrong === 'number') {
    return quiz.wrong
  }

  if (Array.isArray(quiz.questionsKo)) {
    return quiz.questionsKo.length
  }

  return 0
}

function getTotalAnswers(quiz) {
  const correct = getCorrectAnswers(quiz)
  const wrong = getWrongAnswers(quiz)

  if (correct + wrong > 0) {
    return correct + wrong
  }

  return QUESTIONS_TOTAL
}

function isPassed(quiz) {
  const correct = getCorrectAnswers(quiz)

  if (typeof quiz.passed === 'boolean') {
    return quiz.passed
  }

  return correct >= QUESTIONS_REQUIRED
}

function getQuestions(quiz) {
  if (Array.isArray(quiz.questions)) {
    return quiz.questions
  }

  if (
    Array.isArray(quiz.questionsOk) ||
    Array.isArray(quiz.questionsKo)
  ) {
    return [
      ...(quiz.questionsOk || []),
      ...(quiz.questionsKo || []),
    ]
  }

  return []
}

onMounted(() => {
  loadHistory()
})
</script>

<template>
  <section
    class="min-h-full w-full bg-[#F7F8FC] px-4 py-8 sm:px-6 sm:py-10"
  >
    <div class="mx-auto w-full max-w-[1095px]">

      <!-- TITOLO E AZIONI -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            class="text-[2.7rem] font-extrabold italic leading-none text-[#AD2E2E] sm:text-[3.2rem]"
          >
            Storico
          </h1>

          <p class="mt-3 text-lg text-[#1E2435]">
            Qui puoi consultare i risultati dei quiz completati.
          </p>
        </div>

        <!-- PULSANTE SVUOTA STORICO -->
        <button
          v-if="sortedHistory.length > 0"
          type="button"
          class="self-start rounded-full bg-[#B93333] px-6 py-3 font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#8e2424] active:scale-95 sm:self-auto"
          @click="clearHistory"
        >
          Cancella
        </button>
      </div>

      <!-- NESSUN QUIZ -->
      <div
        v-if="sortedHistory.length === 0"
        class="rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
      >
        <h2
          class="text-2xl font-bold text-[#171E32]"
        >
          Nessun quiz completato
        </h2>

        <p
          class="mt-2 text-[#5E6475]"
        >
          Quando completerai un quiz, il risultato apparirà qui.
        </p>
      </div>

      <!-- ELENCO QUIZ -->
      <div
        v-else
        class="flex flex-col gap-4"
      >

        <article
          v-for="(quiz, index) in sortedHistory"
          :key="quiz.id ?? index"
          class="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
        >

          <!-- SCHEDA PRINCIPALE -->
          <div
            class="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >

            <!-- INFO QUIZ -->
            <div>
              <div class="flex flex-wrap items-center gap-3">

                <h2
                  class="text-2xl font-extrabold text-[#171E32]"
                >
                  Quiz {{ sortedHistory.length - index }}
                </h2>

                <!-- STATO -->
                <span
                  v-if="isPassed(quiz)"
                  class="rounded-full bg-[#0B8742] px-4 py-1.5 text-sm font-bold text-white"
                >
                  Superato
                </span>

                <span
                  v-else
                  class="rounded-full bg-[#B93333] px-4 py-1.5 text-sm font-bold text-white"
                >
                  Non superato
                </span>

              </div>

              <p
                class="mt-2 text-sm text-[#6A7080]"
              >
                {{ formatDate(quiz.date ?? quiz.createdAt) }}
              </p>
            </div>

            <!-- PUNTEGGIO -->
            <div class="text-left sm:text-right">

              <p
                class="text-3xl font-extrabold text-[#171E32]"
              >
                {{ getCorrectAnswers(quiz) }}
                /
                {{ getTotalAnswers(quiz) }}
              </p>

              <p
                class="text-sm text-[#6A7080]"
              >
                risposte corrette
              </p>

            </div>

            <!-- BOTTONE -->
            <button
              type="button"
              class="rounded-full border-2 border-[#171E32] bg-[#EAC656] px-6 py-3 font-bold text-[#171E32] transition-all duration-200 hover:bg-[#171E32] hover:text-[#EAC656]"
              @click="toggleQuiz(index)"
            >
              {{
                expandedQuiz === index
                  ? 'Nascondi'
                  : 'Vedi parole'
              }}
            </button>

          </div>

          <!-- DETTAGLI -->
          <div
            v-if="expandedQuiz === index"
            class="border-t border-[#E2E4EA] bg-[#FAFAFC] px-5 py-5 sm:px-6"
          >

            <!-- STATISTICHE -->
            <div
              class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3"
            >

              <div
                class="rounded-2xl bg-white p-4"
              >
                <p class="text-sm text-[#6A7080]">
                  Corrette
                </p>

                <p
                  class="mt-1 text-2xl font-extrabold text-[#0B8742]"
                >
                  {{ getCorrectAnswers(quiz) }}
                </p>
              </div>

              <div
                class="rounded-2xl bg-white p-4"
              >
                <p class="text-sm text-[#6A7080]">
                  Errate
                </p>

                <p
                  class="mt-1 text-2xl font-extrabold text-[#B93333]"
                >
                  {{ getWrongAnswers(quiz) }}
                </p>
              </div>

              <div
                class="col-span-2 rounded-2xl bg-white p-4 sm:col-span-1"
              >
                <p class="text-sm text-[#6A7080]">
                  Obiettivo
                </p>

                <p
                  class="mt-1 text-2xl font-extrabold text-[#171E32]"
                >
                  {{ QUESTIONS_REQUIRED }} / {{ QUESTIONS_TOTAL }}
                </p>
              </div>

            </div>

            <!-- PAROLE -->
            <div
              v-if="getQuestions(quiz).length > 0"
            >
              <h3
                class="mb-3 text-xl font-bold text-[#171E32]"
              >
                Parole del quiz
              </h3>

              <div
                class="grid gap-3 sm:grid-cols-2"
              >
                <div
                  v-for="(question, questionIndex) in getQuestions(quiz)"
                  :key="question.id ?? questionIndex"
                  class="rounded-2xl bg-white p-4"
                >

                  <div
                    class="flex items-center justify-between gap-3"
                  >
                    <p
                      class="text-lg font-extrabold italic text-[#AD2E2E]"
                    >
                      {{
                        question.value ??
                        question.question?.value ??
                        `Parola ${questionIndex + 1}`
                      }}
                    </p>

                    <span
                      v-if="
                        question.selectedAnswer?.correct ||
                        question.correct === true
                      "
                      class="rounded-full bg-[#0B8742] px-3 py-1 text-xs font-bold text-white"
                    >
                      Corretta
                    </span>

                    <span
                      v-else
                      class="rounded-full bg-[#B93333] px-3 py-1 text-xs font-bold text-white"
                    >
                      Errata
                    </span>
                  </div>

                  <p
                    v-if="question.selectedAnswer?.text"
                    class="mt-2 text-sm text-[#5E6475]"
                  >
                    Risposta:
                    <span class="font-semibold text-[#171E32]">
                      {{ question.selectedAnswer.text }}
                    </span>
                  </p>

                  <p
                    v-if="question.correctAnswer?.text"
                    class="mt-1 text-sm text-[#5E6475]"
                  >
                    Corretta:
                    <span class="font-semibold text-[#171E32]">
                      {{ question.correctAnswer.text }}
                    </span>
                  </p>

                </div>
              </div>
            </div>

            <p
              v-else
              class="text-sm text-[#6A7080]"
            >
              Le parole di questo quiz non sono disponibili nello storico.
            </p>

          </div>

        </article>

      </div>

    </div>
  </section>
</template>
