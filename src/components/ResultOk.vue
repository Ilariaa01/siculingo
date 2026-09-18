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
  <!-- Aumenta il padding superiore del background da py-8 a pt-16 pb-8 -->
  <section
    class="mx-auto flex min-h-full w-full min-w-0 flex-col items-center justify-center overflow-y-auto bg-green-50 px-4 py-8 sm:px-10 sm:py-10"
  >
    <div
      class="mx-auto flex w-full max-w-[1095px] max-h-[75vh] min-w-0 flex-col overflow-hidden rounded-lg border border-green-300 bg-white p-6 max-sm:min-h-[410px] max-sm:max-h-none max-sm:w-full max-sm:max-w-[760px] max-sm:rounded-[10px] max-sm:p-3"
    >
      <h2 class="text-xl font-semibold text-green-900">
        Complimenti, hai superato il quiz!
      </h2>

      <p class="mt-2 text-green-800">
        Hai risposto correttamente a {{ props.questionsOk.length }} domande su
        {{ props.questionsOk.length + props.questionsKo.length }}. Obiettivo
        minimo richiesto: almeno {{ props.questionsOkRequired }}.
      </p>

      <div class="mt-6 flex-1 min-h-0 overflow-y-auto pr-2 sm:mt-4">
        <Results
          :questions-ok="props.questionsOk"
          :questions-ko="props.questionsKo"
        />
      </div>

      <button
        type="button"
        class="mt-5 rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800"
        @click="emit('restart')"
      >
        Ricomincia
      </button>
    </div>
  </section>
</template>
