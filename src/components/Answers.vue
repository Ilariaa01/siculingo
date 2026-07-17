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
  <section class="w-full">
    <p class="mb-4 text-center text-lg font-medium text-[#1E2435]">{{ props.question.text }}</p>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <button
        v-for="(answer, answerIndex) in props.question.answers"
        :key="`${props.question.value}-${answerIndex}`"
        type="button"
        class="min-h-[88px] rounded-2xl border border-[#D8B857] bg-[#E0BE56] px-4 py-5 text-center font-semibold text-[#171E32] shadow-sm transition hover:brightness-95"
        @click="onSelect(answer, answerIndex)"
      >
        {{ answer.text }}
      </button>
    </div>
  </section>
</template>
