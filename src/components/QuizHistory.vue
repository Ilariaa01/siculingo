<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { auth, getQuizHistory } from "../firebase.js";

const history = ref([]);
const expandedQuiz = ref(null);

const QUESTIONS_TOTAL = 24;
const QUESTIONS_REQUIRED = 15;

const sortedHistory = computed(() => {
  return [...history.value].reverse();
});

async function loadHistory() {
  try {
    history.value = await getQuizHistory(auth.currentUser);
  } catch (error) {
    console.error("Errore durante il caricamento dello storico:", error);

    history.value = [];
  }
}

async function toggleQuiz(index) {
  if (expandedQuiz.value === index) {
    expandedQuiz.value = null;
    return;
  }

  expandedQuiz.value = index;

  await nextTick();

  const quizElement = document.getElementById(`quiz-history-${index}`);
  const historyScroll = quizElement?.closest(".history-scroll");

  if (quizElement && historyScroll) {
    historyScroll.scrollTo({
      top: quizElement.offsetTop - historyScroll.offsetTop,
      behavior: "smooth",
    });
  }
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Data non disponibile";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Data non disponibile";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getCorrectAnswers(quiz) {
  if (typeof quiz.correct === "number") {
    return quiz.correct;
  }

  if (Array.isArray(quiz.questionsOk)) {
    return quiz.questionsOk.length;
  }

  return 0;
}

function getWrongAnswers(quiz) {
  if (typeof quiz.wrong === "number") {
    return quiz.wrong;
  }

  if (Array.isArray(quiz.questionsKo)) {
    return quiz.questionsKo.length;
  }

  return 0;
}

function getTotalAnswers(quiz) {
  const correct = getCorrectAnswers(quiz);
  const wrong = getWrongAnswers(quiz);

  if (correct + wrong > 0) {
    return correct + wrong;
  }

  return QUESTIONS_TOTAL;
}

function isPassed(quiz) {
  const correct = getCorrectAnswers(quiz);

  if (typeof quiz.passed === "boolean") {
    return quiz.passed;
  }

  return correct >= QUESTIONS_REQUIRED;
}

function getQuestions(quiz) {
  if (Array.isArray(quiz.questions)) {
    return quiz.questions;
  }

  if (Array.isArray(quiz.questionsOk) || Array.isArray(quiz.questionsKo)) {
    return [...(quiz.questionsOk || []), ...(quiz.questionsKo || [])];
  }

  return [];
}

onMounted(() => {
  loadHistory();
});
</script>

<template>
  <section
    class="history-page flex min-h-full w-full min-w-0 flex-col items-center bg-[#F7F8FC] px-4 py-8 sm:px-6 sm:py-10"
  >
    <div
      class="history-content flex h-[410px] w-full max-w-[1095px] min-h-0 min-w-0 flex-col overflow-hidden rounded-[10px] bg-white p-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.12)] sm:h-auto sm:max-h-[75vh] sm:w-full sm:rounded-lg sm:p-6"
    >
      <!-- TITOLO E AZIONI -->
      <div
        class="mb-4 flex flex-none flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4"
      >
        <div>
          <h1
            class="text-[1.75rem] font-extrabold italic leading-none text-[#AD2E2E] sm:text-[3.2rem]"
          >
            Storico
          </h1>

          <p class="mt-1.5 text-xs text-[#1E2435] sm:mt-3 sm:text-lg">
            Qui puoi consultare i risultati dei quiz completati.
          </p>
        </div>
      </div>

      <div
        class="history-scroll min-h-0 max-h-[250px] min-w-0 space-y-2 overflow-y-auto pr-1 sm:max-h-[350px] sm:space-y-4"
      >
        <!-- NESSUN QUIZ -->
        <div
          v-if="sortedHistory.length === 0"
          class="rounded-[20px] bg-white px-4 py-8 text-center sm:rounded-[28px] sm:px-6 sm:py-10"
        >
          <h2 class="text-xl font-bold text-[#171E32] sm:text-2xl">
            Nessun quiz completato
          </h2>

          <p class="mt-1.5 text-sm text-[#5E6475] sm:mt-2 sm:text-base">
            Quando completerai un quiz, il risultato apparirà qui.
          </p>
        </div>

        <!-- ELENCO QUIZ -->
        <template v-else>
          <article
            v-for="(quiz, index) in sortedHistory"
            :key="quiz.id ?? index"
            :id="`quiz-history-${index}`"
            class="mx-0 min-w-0 overflow-hidden rounded-[10px] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.12)] sm:mx-6 sm:rounded-[28px]"
          >
            <!-- SCHEDA PRINCIPALE -->
            <div
              class="flex min-w-0 flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-6"
            >
              <!-- INFO QUIZ -->
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2
                    class="min-w-0 break-words text-lg font-extrabold text-[#171E32] sm:text-2xl"
                  >
                    Quiz {{ sortedHistory.length - index }}
                  </h2>

                  <!-- STATO -->
                  <span
                    v-if="isPassed(quiz)"
                    class="rounded-full bg-[#0B8742] px-3 py-1 text-xs font-bold text-white sm:px-4 sm:py-1.5 sm:text-sm"
                  >
                    Superato
                  </span>

                  <span
                    v-else
                    class="rounded-full bg-[#B93333] px-3 py-1 text-xs font-bold text-white sm:px-4 sm:py-1.5 sm:text-sm"
                  >
                    Non superato
                  </span>
                </div>

                <p class="mt-1.5 text-xs text-[#6A7080] sm:mt-2 sm:text-sm">
                  {{ formatDate(quiz.date ?? quiz.createdAt) }}
                </p>
              </div>

              <!-- PUNTEGGIO -->
              <div class="text-left sm:text-right">
                <p class="text-2xl font-extrabold text-[#171E32] sm:text-3xl">
                  {{ getCorrectAnswers(quiz) }}
                  /
                  {{ getTotalAnswers(quiz) }}
                </p>

                <p class="break-words text-xs text-[#6A7080] sm:text-sm">
                  risposte corrette
                </p>
              </div>

              <!-- BOTTONE -->
              <button
                type="button"
                class="w-full rounded-full border-2 border-[#171E32] bg-[#EAC656] px-4 py-2 text-sm font-bold text-[#171E32] transition-all duration-200 hover:bg-[#171E32] hover:text-[#EAC656] sm:w-auto sm:px-6 sm:py-3 sm:text-base"
                @click="toggleQuiz(index)"
              >
                {{ expandedQuiz === index ? "Nascondi" : "Vedi parole" }}
              </button>
            </div>

            <!-- DETTAGLI -->
            <div
              v-if="expandedQuiz === index"
              class="history-details max-h-[calc(75vh-220px)] min-w-0 overflow-y-auto border-t border-[#E2E4EA] bg-[#FAFAFC] px-3 py-4 sm:px-6 sm:py-5"
            >
              <!-- STATISTICHE -->
              <div
                class="mb-4 grid grid-cols-2 gap-2 sm:mb-5 sm:grid-cols-3 sm:gap-3"
              >
                <div class="rounded-xl bg-white p-3 sm:rounded-2xl sm:p-4">
                  <p class="text-xs text-[#6A7080] sm:text-sm">Corrette</p>

                  <p
                    class="mt-1 text-xl font-extrabold text-[#0B8742] sm:text-2xl"
                  >
                    {{ getCorrectAnswers(quiz) }}
                  </p>
                </div>

                <div class="rounded-xl bg-white p-3 sm:rounded-2xl sm:p-4">
                  <p class="text-xs text-[#6A7080] sm:text-sm">Errate</p>

                  <p
                    class="mt-1 text-xl font-extrabold text-[#B93333] sm:text-2xl"
                  >
                    {{ getWrongAnswers(quiz) }}
                  </p>
                </div>

                <div
                  class="col-span-2 rounded-xl bg-white p-3 sm:col-span-1 sm:rounded-2xl sm:p-4"
                >
                  <p class="text-xs text-[#6A7080] sm:text-sm">Obiettivo</p>

                  <p
                    class="mt-1 text-xl font-extrabold text-[#171E32] sm:text-2xl"
                  >
                    {{ QUESTIONS_REQUIRED }} / {{ QUESTIONS_TOTAL }}
                  </p>
                </div>
              </div>

              <!-- PAROLE -->
              <div v-if="getQuestions(quiz).length > 0">
                <h3
                  class="mb-2 text-lg font-bold text-[#171E32] sm:mb-3 sm:text-xl"
                >
                  Parole del quiz
                </h3>

                <div class="grid gap-2 sm:grid-cols-2 sm:gap-3">
                  <div
                    v-for="(question, questionIndex) in getQuestions(quiz)"
                    :key="question.id ?? questionIndex"
                    class="rounded-xl bg-white p-3 sm:rounded-2xl sm:p-4"
                  >
                    <div
                      class="flex min-w-0 flex-wrap items-center justify-between gap-3"
                    >
                      <p
                        class="min-w-0 break-words text-base font-extrabold italic text-[#AD2E2E] sm:text-lg"
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
                        class="rounded-full bg-[#0B8742] px-2.5 py-0.5 text-[11px] font-bold text-white sm:px-3 sm:py-1 sm:text-xs"
                      >
                        Corretta
                      </span>

                      <span
                        v-else
                        class="rounded-full bg-[#B93333] px-2.5 py-0.5 text-[11px] font-bold text-white sm:px-3 sm:py-1 sm:text-xs"
                      >
                        Errata
                      </span>
                    </div>

                    <p
                      v-if="question.selectedAnswer?.text"
                      class="mt-1.5 text-xs text-[#5E6475] sm:mt-2 sm:text-sm"
                    >
                      Risposta:
                      <span class="font-semibold text-[#171E32]">
                        {{ question.selectedAnswer.text }}
                      </span>
                    </p>

                    <p
                      v-if="question.correctAnswer?.text"
                      class="mt-1 text-xs text-[#5E6475] sm:text-sm"
                    >
                      Corretta:
                      <span class="font-semibold text-[#171E32]">
                        {{ question.correctAnswer.text }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <p v-else class="text-sm text-[#6A7080]">
                Le parole di questo quiz non sono disponibili nello storico.
              </p>
            </div>
          </article>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.history-scroll {
  scrollbar-gutter: stable;
}
</style>
