<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore, Question } from '../store'
import { ArrowLeft, Sliders, LayoutList, BookOpen } from 'lucide-vue-next'
import QuestionList from '../components/QuestionList.vue'
import Flashcard from '../components/Flashcard.vue'

const props = defineProps<{
  categoryName: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const store = useAppStore()

// Filter categories state: 'all' | '重点' | '必问' | '了解'
const activeFilter = ref<'all' | '重点' | '必问' | '了解'>('all')

// Mode toggle state: 'list' | 'flashcard'
const studyMode = ref<'list' | 'flashcard'>('list')

// Retrieve all base questions for the targeted mode
const baseQuestions = computed<Question[]>(() => {
  if (props.categoryName === '我的收藏') {
    // Treat Favorites list as a dynamic category
    return store.favoriteQuestions.map(item => item.question)
  }
  // Standard category loader
  const matchedCat = store.questionBank.find(c => c.category === props.categoryName)
  return matchedCat ? matchedCat.questions : []
})

// Apply the selected filter
const filteredQuestions = computed<Question[]>(() => {
  if (activeFilter.value === 'all') {
    return baseQuestions.value
  }
  return baseQuestions.value.filter(q => q.level === activeFilter.value)
})

// Current mastery values specifically for this view
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
    <!-- Top Nav Action Bar -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
      <button 
        @click="emit('back')"
        class="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft :size="16" />
      </button>

      <div class="text-center flex-1 px-3">
        <h3 class="text-sm font-bold text-white tracking-tight truncate">
          {{ props.categoryName }}
        </h3>
        <div class="flex items-center justify-center gap-1.5 mt-0.5 text-[9px] font-mono text-slate-500">
          <span>攻克度</span>
          <span class="text-indigo-400 font-bold">
            {{ viewProgress.mastered }}/{{ viewProgress.total }}
          </span>
          <span>({{ viewProgress.percent }}%)</span>
        </div>
      </div>

      <!-- Mode switcher pill -->
      <div class="bg-slate-950 p-1 rounded-full flex border border-slate-850">
        <button 
          @click="studyMode = 'list'"
          class="px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1 transition"
          :class="[
            studyMode === 'list'
              ? 'bg-slate-800 text-indigo-400 font-extrabold shadow'
              : 'text-slate-500 hover:text-slate-350'
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
              ? 'bg-slate-800 text-indigo-400 font-extrabold shadow'
              : 'text-slate-500 hover:text-slate-355'
          ]"
        >
          <BookOpen :size="10" />
          <span>闪卡</span>
        </button>
      </div>
    </div>

    <!-- Category Filters row (全部与重点等) -->
    <div class="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 invisible-scrollbar">
      <button 
        v-for="filter in (['all', '重点', '必问', '了解'] as const)"
        :key="filter"
        @click="activeFilter = filter"
        class="px-3.5 py-1.5 rounded-xl border text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
        :class="[
          activeFilter === filter 
            ? 'bg-indigo-600 border-indigo-500 text-white font-extrabold shadow-sm shadow-indigo-600/10' 
            : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
        ]"
      >
        {{ filter === 'all' ? '全部' : filter }}
      </button>
    </div>

    <!-- MAIN BODY SCROLLER -->
    <div class="flex-1 overflow-y-auto pr-1 select-none custom-scrollbar">
      <div v-if="filteredQuestions.length > 0" class="h-full">
        <!-- Render List mode -->
        <QuestionList 
          v-if="studyMode === 'list'"
          :questions="filteredQuestions"
          :categoryName="props.categoryName"
        />

        <!-- Render Flashcard mode -->
        <Flashcard 
          v-else
          :questions="filteredQuestions"
          :categoryName="props.categoryName"
        />
      </div>

      <!-- Empty state placeholder -->
      <div v-else class="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 mt-2 p-6">
        <Sliders class="mx-auto text-slate-700 mb-2 stroke-[1.5]" :size="32" />
        <p class="text-slate-500 text-xs font-medium">该筛选条件下暂无题目</p>
        <p class="text-slate-600 text-[10px] mt-1.5 leading-relaxed">
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
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

.invisible-scrollbar::-webkit-scrollbar {
  display: none;
}
.invisible-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
