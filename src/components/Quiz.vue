<script setup>
import { computed, onMounted, ref } from 'vue'
import Answers from './Answers.vue'
import ResultKo from './ResultKo.vue'
import ResultOk from './ResultOk.vue'
import { useGlobal } from '../composables/global'

const global = useGlobal()

const questions = ref([])
const questionsOk = ref([])
const questionsKo = ref([])
const questionsIndex = ref(0)
const questionsOkRequired = 3
const fetchError = ref('')

const currentQuestion = computed(() => {
  if (questionsIndex.value >= questions.value.length) {
    return null
  }
  return questions.value[questionsIndex.value]?.question ?? null
})

const isFinished = computed(() => {
  return questions.value.length > 0 && questionsIndex.value >= questions.value.length
})

const isQuizPassed = computed(() => {
  return questionsOk.value.length > questionsOkRequired
})

async function loadQuestions() {
  fetchError.value = ''
  try {
    const response = await fetch('/data.json')
    if (!response.ok) {
      throw new Error('Errore durante il caricamento delle domande')
    }

    const payload = await response.json()
    if (!Array.isArray(payload)) {
      throw new Error('Il file data.json non contiene un array valido')
    }

    questions.value = payload
  } catch (error) {
    fetchError.value = error?.message || 'Errore sconosciuto'
  }
}

function cloneQuestionWithSelection(question, answerIndex) {
  return {
    ...question,
    questionIndex: questionsIndex.value,
    answers: question.answers.map((answer, index) => ({
      ...answer,
      selected: index === answerIndex,
    })),
  }
}

function showDialogMessage(content) {
  global.dialog = {
    title: 'Quiz',
    content,
  }
}

function onAnswerSelected({ answer, answerIndex }) {
  if (!currentQuestion.value) {
    return
  }

  const questionToStore = cloneQuestionWithSelection(currentQuestion.value, answerIndex)

  if (answer.correct) {
    questionsOk.value.push(questionToStore)
    showDialogMessage('risposta esatta')
  } else {
    questionsKo.value.push(questionToStore)
    showDialogMessage('risposta sbagliata')
  }

  questionsIndex.value += 1
}

function restartQuiz() {
  questionsIndex.value = 0
  questionsOk.value = []
  questionsKo.value = []
}

onMounted(() => {
  loadQuestions()
})
</script>

<template>
  <section class="mt-8 w-full">
    <h1 class="mb-4 text-2xl font-bold text-neutral-900">Quiz dialetto siculo</h1>

    <p
      v-if="fetchError"
      class="rounded-md border border-red-300 bg-red-50 p-3 text-red-800"
    >
      {{ fetchError }}
    </p>

    <div v-else-if="questions.length === 0" class="text-neutral-600">
      Caricamento domande...
    </div>

    <div v-else-if="!isFinished" class="space-y-3">
      <p class="text-sm text-neutral-600">
        Domanda {{ questionsIndex + 1 }} di {{ questions.length }}
      </p>

      <Answers
        v-if="currentQuestion"
        :question="currentQuestion"
        @select="onAnswerSelected"
      />
    </div>

    <ResultOk
      v-else-if="isQuizPassed"
      :questions-ok="questionsOk"
      :questions-ko="questionsKo"
      :questions-ok-required="questionsOkRequired"
      @restart="restartQuiz"
    />

    <ResultKo
      v-else
      :questions-ok="questionsOk"
      :questions-ko="questionsKo"
      :questions-ok-required="questionsOkRequired"
      @restart="restartQuiz"
    />
  </section>
</template>
