<script setup>
import Results from "./Results.vue";

const props = defineProps({
  questionsOk: {
    type: Array,
    required: true,
  },
  questionsKo: {
    type: Array,
    required: true,
  },
  questionsOkRequired: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["restart"]);
</script>

<template>
  <section
    class="mx-auto flex min-h-full w-full min-w-0 flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:px-10 sm:py-10"
  >
    <div
      class="mx-auto flex max-h-[75vh] min-h-[410px] w-full max-w-[1095px] min-w-0 flex-col overflow-hidden rounded-[24px] bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] max-sm:max-h-none max-sm:w-full max-sm:max-w-[760px] max-sm:rounded-[24px] max-sm:p-4 sm:rounded-[32px] sm:p-8"
    >
      <h2 class="text-center text-2xl font-extrabold italic text-navy sm:text-4xl">
        Quiz non superato
      </h2>
      <p class="mt-3 text-center text-sm font-semibold text-[#1E2435] sm:text-lg">
        Hai risposto correttamente a {{ props.questionsOk.length }} domande su
        {{ props.questionsOk.length + props.questionsKo.length }}. Per superare
        il quiz servono almeno {{ props.questionsOkRequired }} risposte
        corrette.
      </p>

      <div class="mt-6 min-h-0 flex-1 overflow-y-auto pr-1 sm:mt-8 sm:pr-2">
        <Results
          :questions-ok="props.questionsOk"
          :questions-ko="props.questionsKo"
        />
      </div>

      <button
        type="button"
        class="mt-6 self-center rounded-full border-2 border-[#171E32] bg-limone px-8 py-3 text-base font-bold text-[#171E32] shadow-lg transition-all duration-300 hover:border-limone hover:bg-[#171E32] hover:text-limone hover:shadow-xl active:scale-95 sm:px-10 sm:py-4 sm:text-lg"
        @click="emit('restart')"
      >
        Ricomincia
      </button>
    </div>
  </section>
</template>
