<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore, Question } from '../store'
import { ArrowLeft, Sliders, LayoutList, BookOpen } from 'lucide-vue-next'
import QuestionList from '../components/QuestionList.vue'
import Flashcard from '../components/Flashcard.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

const props = defineProps<{
  categoryName: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const store = useAppStore()

const activeFilter = ref<'all' | '重点' | '必问' | '了解'>('all')
const studyMode = ref<'list' | 'flashcard'>('list')

const baseQuestions = computed<Question[]>(() => {
  if (props.categoryName === '我的收藏') {
    return store.favoriteQuestions.map(item => item.question)
  }
  const matchedCat = store.questionBank.find(c => c.category === props.categoryName)
  return matchedCat ? matchedCat.questions : []
})

const filteredQuestions = computed<Question[]>(() => {
  if (activeFilter.value === 'all') {
    return baseQuestions.value
  }
  return baseQuestions.value.filter(q => q.level === activeFilter.value)
})

const viewProgress = computed(() => {
  if (baseQuestions.value.length === 0) return { mastered: 0, total: 0, percent: 0 }
  const total = baseQuestions.value.length
  const mastered = baseQuestions.value.filter(q => store.isMastered(q.id)).length
  const percent = Math.round((mastered / total) * 100)
  return { mastered, total, percent }
})
</script>

<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden select-none">
    <div class="border-b border-app-subtle mb-4 pb-3">
      <div class="flex items-center gap-2">
      <button 
        @click="emit('back')"
        class="shrink-0 w-8 h-8 rounded-full bg-app-surface border border-app flex items-center justify-center text-app-secondary hover:text-app-heading transition-colors cursor-pointer"
      >
        <ArrowLeft :size="16" />
      </button>

        <div class="text-center flex-1 min-w-0 px-1">
        <h3 class="text-sm font-bold text-app-heading tracking-tight truncate">
          {{ props.categoryName }}
        </h3>
        <div class="flex items-center justify-center gap-1.5 mt-0.5 text-[9px] font-mono text-app-muted">
          <span>攻克度</span>
          <span class="text-app-accent font-bold">
            {{ viewProgress.mastered }}/{{ viewProgress.total }}
          </span>
          <span>({{ viewProgress.percent }}%)</span>
        </div>
        </div>

        <div class="shrink-0 w-8" aria-hidden="true" />
      </div>

      <div class="flex items-center justify-between gap-3 mt-2.5">
        <div class="bg-app-inset p-1 rounded-full flex border border-app shrink-0">
        <button 
          @click="studyMode = 'list'"
          class="px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1 transition"
          :class="[
            studyMode === 'list'
              ? 'bg-app-surface-hover text-app-accent font-extrabold shadow'
              : 'text-app-muted hover:text-app-secondary'
          ]"
        >
          <LayoutList :size="10" />
          <span>列表</span>
        </button>
        <button 
          @click="studyMode = 'flashcard'"
          class="px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1 transition"
          :class="[
            studyMode === 'flashcard'
              ? 'bg-app-surface-hover text-app-accent font-extrabold shadow'
              : 'text-app-muted hover:text-app-secondary'
          ]"
        >
          <BookOpen :size="10" />
          <span>闪卡</span>
        </button>
        </div>

        <ThemeToggle />
      </div>
    </div>

    <div class="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 invisible-scrollbar">
      <button 
        v-for="filter in (['all', '重点', '必问', '了解'] as const)"
        :key="filter"
        @click="activeFilter = filter"
        class="px-3.5 py-1.5 rounded-xl border text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
        :class="[
          activeFilter === filter 
            ? 'bg-app-accent-solid border-app-accent text-white font-extrabold shadow-sm' 
            : 'bg-app-surface border-app text-app-secondary hover:text-app hover:border-app-strong'
        ]"
      >
        {{ filter === 'all' ? '全部' : filter }}
      </button>
    </div>

    <div class="flex-1 overflow-y-auto pr-1 select-none custom-scrollbar">
      <div v-if="filteredQuestions.length > 0" class="h-full">
        <QuestionList 
          v-if="studyMode === 'list'"
          :questions="filteredQuestions"
          :categoryName="props.categoryName"
        />
        <Flashcard 
          v-else
          :questions="filteredQuestions"
          :categoryName="props.categoryName"
        />
      </div>

      <div v-else class="text-center py-20 bg-app-muted rounded-3xl border border-app mt-2 p-6">
        <Sliders class="mx-auto text-app-faint mb-2 stroke-[1.5]" :size="32" />
        <p class="text-app-muted text-xs font-medium">该筛选条件下暂无题目</p>
        <p class="text-app-faint text-[10px] mt-1.5 leading-relaxed">
          可以在主页收藏更多题目，或切换筛选过滤器查看。
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.invisible-scrollbar::-webkit-scrollbar {
  display: none;
}
.invisible-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
