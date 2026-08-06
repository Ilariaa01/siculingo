<script setup>
import { computed } from 'vue'

const props = defineProps({
  questionsOk: {
    type: Array,
    required: true,
  },
  questionsKo: {
    type: Array,
    required: true,
  },
})

const mergedResults = computed(() => {
  const ok = props.questionsOk.map((question) => ({
    ...question,
    result: 'ok',
  }))
  const ko = props.questionsKo.map((question) => ({
    ...question,
    result: 'ko',
  }))

  return [...ok, ...ko].sort((a, b) => a.questionIndex - b.questionIndex)
})
</script>

<template>
  <section class="w-full rounded-lg border border-neutral-200 bg-white p-4">
    <h3 class="text-base font-semibold text-neutral-900">Riepilogo risposte</h3>

    <ul class="mt-3 space-y-2">
      <li
        v-for="(result, index) in mergedResults"
        :key="`${result.value}-${index}`"
        class="rounded-md border border-neutral-200 p-3"
      >
        <p class="font-medium text-neutral-900">
          {{ result.value }} - {{ result.result }}
        </p>
        <p
          v-if="result.result === 'ko'"
          class="mt-1 text-sm text-neutral-700"
        >
          Risposta corretta: {{ result.correctAnswer?.text || result.answers.find((answer) => answer.correct)?.text }}
        </p>
      </li>
    </ul>
  </section>
</template>
