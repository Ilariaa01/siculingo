<script setup>
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  feedback: {
    type: Object,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

function onSelect(answer, answerIndex) {
  emit('select', { answer, answerIndex })
}

function answerFeedbackClass(answerIndex, isCorrectAnswer) {
  if (!props.feedback) {
    return 'border-[#D8B857] bg-[#E0BE56] text-[#171E32]'
  }

  const isSelected = props.feedback.index === answerIndex

  if (isSelected && props.feedback.correct) {
    return 'border-[#6BAE53] bg-[#79C35F] text-white shadow-[0_10px_24px_rgba(107,174,83,0.22)]'
  }

  if (isSelected && !props.feedback.correct) {
    return 'border-[#C85F5F] bg-[#E89B9B] text-[#4E1414] shadow-[0_10px_24px_rgba(200,95,95,0.18)]'
  }

  if (isCorrectAnswer) {
    return 'border-[#A9D6A0] bg-[#E9F5E6] text-[#285020]'
  }

  return 'border-[#D8B857] bg-[#E0BE56] text-[#171E32] opacity-70'
}
</script>

<template>
  <section class="w-full">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <button
        v-for="(answer, answerIndex) in props.question.answers"
        :key="`${props.question.value}-${answerIndex}`"
        type="button"
        :disabled="props.disabled"
        class="min-h-[56px] rounded-full border px-3 py-2.5 text-center text-xs font-semibold leading-snug shadow-sm transition sm:min-h-[64px] sm:px-4 sm:py-3 sm:text-sm"
        :class="[
          answerFeedbackClass(answerIndex, answer.correct),
          props.disabled ? 'cursor-not-allowed' : 'hover:brightness-95',
        ]"
        @click="onSelect(answer, answerIndex)"
      >
        {{ answer.text }}
      </button>
    </div>
  </section>
</template>
