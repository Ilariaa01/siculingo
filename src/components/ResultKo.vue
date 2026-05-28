<script setup>
import Results from './Results.vue'

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
})

const emit = defineEmits(['restart'])
</script>

<template>
  <section class="w-full rounded-lg border border-red-300 bg-red-50 p-6">
    <h2 class="text-xl font-semibold text-red-900">Quiz non superato</h2>
    <p class="mt-2 text-red-800">
      Hai risposto correttamente a {{ props.questionsOk.length }} domande su
      {{ props.questionsOk.length + props.questionsKo.length }}.
      Per superare il quiz servono più di {{ props.questionsOkRequired }} risposte corrette.
    </p>

    <div class="mt-4">
      <Results
        :questions-ok="props.questionsOk"
        :questions-ko="props.questionsKo"
      />
    </div>

    <button
      type="button"
      class="mt-5 rounded-md bg-red-700 px-4 py-2 text-white hover:bg-red-800"
      @click="emit('restart')"
    >
      Ricomincia
    </button>
  </section>
</template>
