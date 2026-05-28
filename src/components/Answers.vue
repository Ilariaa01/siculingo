<script setup>
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select'])

function onSelect(answer, answerIndex) {
  emit('select', { answer, answerIndex })
}
</script>

<template>
  <section class="w-full rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-neutral-900">{{ props.question.text }}</h2>

    <div class="mt-4 grid gap-3">
      <button
        v-for="(answer, answerIndex) in props.question.answers"
        :key="`${props.question.value}-${answerIndex}`"
        type="button"
        class="rounded-md border border-neutral-300 bg-neutral-50 px-4 py-3 text-left text-neutral-800 transition hover:bg-neutral-100"
        @click="onSelect(answer, answerIndex)"
      >
        {{ answer.text }}
      </button>
    </div>
  </section>
</template>
