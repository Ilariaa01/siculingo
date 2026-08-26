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
  if (props.disabled || props.feedback) {
    return
  }

  emit('select', {
    answer,
    answerIndex,
  })
}

function answerFeedbackClass(answerIndex, answer) {
  // STATO INIZIALE
  if (!props.feedback) {
    return [
      'border-[#D8B857]',
      'bg-[#E0BE56]',
      'text-[#171E32]',
      'hover:brightness-95',
    ].join(' ')
  }

  const isSelected = props.feedback.index === answerIndex
  const isCorrectAnswer = answer.correct
  const wasCorrect = props.feedback.correct

  // RISPOSTA CORRETTA
  if (wasCorrect && isSelected) {
    return [
      'border-[#0B8742]',
      'bg-[#0B8742]',
      'text-white',
      'shadow-[0_10px_24px_rgba(11,135,66,0.25)]',
    ].join(' ')
  }

  // RISPOSTA ERRATA SELEZIONATA
  if (!wasCorrect && isSelected) {
    return [
      'border-[#B93333]',
      'bg-[#B93333]',
      'text-white',
      'shadow-[0_10px_24px_rgba(185,51,51,0.25)]',
    ].join(' ')
  }

  // RISPOSTA CORRETTA DOPO UN ERRORE
  if (!wasCorrect && isCorrectAnswer) {
    return [
      'border-[#0B8742]',
      'bg-[#0B8742]',
      'text-white',
      'shadow-[0_10px_24px_rgba(11,135,66,0.22)]',
    ].join(' ')
  }

  // ALTRE RISPOSTE DOPO IL FEEDBACK
  return [
    'border-[#D8B857]',
    'bg-[#E0BE56]',
    'text-[#171E32]',
    'opacity-45',
  ].join(' ')
}
</script>

<template>
  <section class="w-full">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">

      <button
        v-for="(answer, answerIndex) in props.question.answers"
        :key="`${props.question.value}-${answerIndex}`"
        type="button"
        :disabled="props.disabled"
        class="
          flex
          min-h-[84px]
          items-center
          justify-center
          rounded-[22px]
          border
          px-3
          py-3
          text-center
          text-[18px]
          font-bold
          leading-snug
          shadow-sm
          transition-all
          duration-200
          ease-out
          sm:min-h-[100px]
          sm:px-4
        "
        :class="[
          answerFeedbackClass(answerIndex, answer),

          props.disabled
            ? 'cursor-not-allowed'
            : 'hover:scale-[1.01] hover:brightness-95',

          props.feedback && !props.disabled
            ? 'cursor-default'
            : '',
        ]"
        @click="onSelect(answer, answerIndex)"
      >
        {{ answer.text }}
      </button>

    </div>
  </section>
</template>