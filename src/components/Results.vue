<script setup>
import { computed } from "vue";

const props = defineProps({
  questionsOk: {
    type: Array,
    required: true,
  },
  questionsKo: {
    type: Array,
    required: true,
  },
});

const mergedResults = computed(() => {
  const ok = props.questionsOk.map((question) => ({
    ...question,
    result: "ok",
  }));
  const ko = props.questionsKo.map((question) => ({
    ...question,
    result: "ko",
  }));

  return [...ok, ...ko].sort((a, b) => a.questionIndex - b.questionIndex);
});
</script>

<template>
  <section class="w-full rounded-[20px] p-3 sm:rounded-[24px] sm:p-5">
    <h3 class="text-lg font-extrabold italic text-navy sm:text-2xl">
      Riepilogo risposte
    </h3>

    <!-- MODIFICATO: Aggiunto scroll interno, max-height per mobile e padding per la scrollbar -->
    <ul class="mt-4 space-y-3 max-h-[45vh] overflow-y-auto pr-1.5 custom-scrollbar sm:max-h-none sm:overflow-visible sm:pr-0">
      <li
        v-for="(result, index) in mergedResults"
        :key="`${result.value}-${index}`"
        class="rounded-[18px] border-2 border-[#D9DCE8] bg-white p-3 shadow-sm sm:rounded-[22px] sm:p-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-base font-extrabold italic text-[#AD2E2E] sm:text-lg">
            {{ result.value }}
          </p>

          <span
            class="rounded-full px-3 py-1 text-xs font-bold sm:text-sm"
            :class="
              result.result === 'ok'
                ? 'bg-[#DDF4E7] text-[#0B8742]'
                : 'bg-[#F6D9D9] text-[#7B1A1A]'
            "
          >
            {{ result.result === "ok" ? "Corretta" : "Errata" }}
          </span>
        </div>

        <p v-if="result.result === 'ko'" class="mt-2 text-sm font-semibold text-[#1E2435]">
          Corretta:
          <span class="font-normal">
            {{
              result.correctAnswer?.text ||
              result.answers.find((answer) => answer.correct)?.text
            }}
          </span>
        </p>
      </li>
    </ul>
  </section>
</template>

<!-- AGGIUNTO: Stile per la scrollbar elegante su mobile -->
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}
</style>
