<script setup>
import { computed } from "vue";

import Answers from "./Answers.vue";

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  showAnswer: {
    type: Boolean,
    default: false,
  },
  selectedAnswer: {
    type: Object,
    default: null,
  },
  feedback: {
    type: Object,
    default: null,
  },
  explanationDetails: {
    type: Object,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isChangingQuestion: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select-answer", "next"]);

const explanationStatusLabel = computed(() => {
  if (!props.feedback) {
    return "";
  }

  return props.feedback.correct ? "Risposta corretta" : "Risposta errata";
});

const explanationStatusIcon = computed(() => {
  if (!props.feedback) {
    return "";
  }

  return props.feedback.correct ? "check" : "cross";
});

function onAnswerSelected(payload) {
  emit("select-answer", payload);
}
</script>

<template>
  <!-- CARD ULTERIORMENTE ALLUNGATA (max-w-[1020px]) -->
  <div
    class="quiz-flip-scene quiz-card-container relative mx-auto h-auto min-h-[390px] w-full max-w-[1020px] sm:min-h-[350px]"
  >
    <div
      class="quiz-flip-card"
      :class="{
        'is-flipped': props.showAnswer,
        'no-flip-transition': props.isChangingQuestion,
      }"
    >
      <!-- FRONTE CARD (PADDING RIDOTTO E BOTTONI GIALLI PIÙ LUNGHI) -->
      <div
        class="quiz-flip-face quiz-flip-front flex flex-col justify-between rounded-[28px] bg-white px-4 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:rounded-[36px] sm:px-6 sm:py-6"
      >
        <div class="mb-2 sm:mb-4">
          <div class="w-full text-center">
            <h2
              class="break-words text-[2.4rem] font-extrabold italic leading-none text-[#AD2E2E] sm:text-[3.4rem]"
            >
              {{ props.question?.value || "Domanda" }}
            </h2>

            <p class="mt-2 text-lg font-semibold text-[#1E2435] sm:mt-3 sm:text-2xl">
              Cosa significa
            </p>
          </div>
        </div>

        <Answers
          :question="props.question"
          :feedback="props.feedback"
          :disabled="props.disabled"
          class="w-full"
          @select="onAnswerSelected"
        />
      </div>

      <!-- RETRO CARD (PADDING RIDOTTO E CONTENUTO ESTESO) -->
      <div
        class="quiz-flip-face quiz-flip-back relative flex flex-col justify-center items-center gap-3 rounded-[28px] bg-white px-4 pt-6 pb-11 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:gap-4 sm:rounded-[36px] sm:px-6 sm:pt-7 sm:pb-12"
      >
        <!-- 1. TITOLO PAROLA -->
        <div class="w-full text-center">
          <h2
            class="break-words text-[2.1rem] font-extrabold italic leading-tight text-[#AD2E2E] sm:text-[2.8rem]"
          >
            {{ props.question?.value || "Domanda" }}
          </h2>
        </div>

        <!-- 2. BADGE RISPOSTA -->
        <div class="w-full">
          <!-- CASO RISPOSTA CORRETTA -->
          <div
            v-if="props.feedback?.correct && props.explanationDetails"
            class="mx-auto flex min-h-[42px] w-full items-center justify-between gap-4 rounded-full bg-[#0B8742] px-6 py-2 text-white sm:min-h-[46px] sm:px-8"
          >
            <span class="shrink-0 text-xs font-semibold italic sm:text-sm">Risposta corretta</span>
            <span class="truncate text-xs font-bold sm:text-sm">{{ props.explanationDetails.correctAnswer }}</span>
          </div>

          <!-- CASO RISPOSTA ERRATA -->
          <div
            v-else-if="!props.feedback?.correct && props.explanationDetails"
            class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3"
          >
            <div
              class="flex items-center justify-center rounded-full bg-[#F6D9D9] px-4 py-2 text-center text-xs font-semibold text-[#7B1A1A] sm:px-6 sm:py-2.5 sm:text-sm"
            >
              <span class="break-words">
                Hai scelto: <strong class="font-bold">{{ props.explanationDetails.selectedAnswer }}</strong>
              </span>
            </div>

            <div
              class="flex items-center justify-center rounded-full bg-[#0B8742] px-4 py-2 text-center text-xs font-semibold text-white sm:px-6 sm:py-2.5 sm:text-sm"
            >
              <span class="break-words">
                Corretta: <strong class="font-bold">{{ props.explanationDetails.correctAnswer }}</strong>
              </span>
            </div>
          </div>
        </div>

        <!-- 3. BOX "COME SI USA?" ALLUNGATO -->
        <article
          class="w-full rounded-[20px] bg-limone px-6 py-3.5 text-[#171E32] sm:rounded-[24px] sm:px-8 sm:py-4.5"
        >
          <h3 class="text-center text-[1.1rem] font-bold italic text-[#171E32] sm:text-[1.35rem]">
            Come si usa?
          </h3>

          <p
            class="mt-1 text-center text-[1.15rem] font-bold leading-tight text-[#AB2E33] break-words sm:text-[1.45rem]"
          >
            {{ props.explanationDetails?.usageExample || "" }}
          </p>

          <p
            class="mt-1 text-center text-[0.92rem] leading-snug text-[#171E32] break-words sm:text-[1.08rem]"
          >
            ({{ props.explanationDetails?.usageExplanation || "" }})
          </p>
        </article>

        <!-- 4. CERCHIO DI STATO STATICO A CAVALLO DEL BORDO -->
        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none sm:-bottom-7">
          <div
            v-if="explanationStatusLabel && explanationStatusIcon === 'check'"
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0B8742] text-white shadow-[0_10px_28px_rgba(0,0,0,0.24)] sm:h-14 sm:w-14"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path
                d="M5 13L10 18L19 7"
                fill="none"
                stroke="currentColor"
                stroke-width="3.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div
            v-else-if="explanationStatusLabel"
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#B93333] text-white shadow-[0_10px_28px_rgba(0,0,0,0.24)] sm:h-14 sm:w-14"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path
                d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5"
                fill="none"
                stroke="currentColor"
                stroke-width="3.5"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-flip-scene {
  perspective: 1800px;
}

.quiz-flip-card {
  display: grid;
  height: auto;
  min-height: 100%;
  width: 100%;
  transform-style: preserve-3d;
  transition: transform 620ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

.quiz-flip-card.no-flip-transition {
  transition: none;
}

.quiz-flip-card.is-flipped {
  transform: rotateY(180deg);
}

.quiz-flip-face {
  grid-area: 1 / 1;
  min-width: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.quiz-flip-back {
  transform: rotateY(180deg);
}
</style>
