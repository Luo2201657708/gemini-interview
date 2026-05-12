<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore, CategoryData, Question } from '../store'
import { Search, Star, Award, ChevronRight, BookOpen, Sparkles } from 'lucide-vue-next'
import QuestionList from '../components/QuestionList.vue'

const store = useAppStore()

const searchKeyword = ref('')

const emit = defineEmits<{
  (e: 'selectCategory', categoryName: string): void
  (e: 'viewFavorites'): void
}>()

// Map lovely emojis for each technical category
const categoryEmojis: Record<string, string> = {
  'C语言': '🇨',
  'LINUX基础': '🐧',
  '数据结构': '🌳',
  '文件IO': '📂',
  '系统编程': '⚙️',
  '网络编程': '🌐',
  'C++': '➕',
  'QT': '🏗️',
  'ARM开发板&项目': '🎛️',
  'STM32': '☁️',
  '单片机模块&项目要点': '💡',
  '驱动': '🔌',
  '项目工作经验汇总': '💼',
  '模电数电&硬件': '⚡',
  '软件测试': '🧪'
}

function getEmoji(categoryName: string): string {
  return categoryEmojis[categoryName] || '📚'
}

// Live search matching results from Pinia getter
const searchResults = computed(() => {
  return store.searchQuestions(searchKeyword.value)
})

// Flatten question representation for search results so they work with QuestionList
const searchResultsQuestions = computed<Question[]>(() => {
  return searchResults.value.map(item => item.question)
})

function handleCategoryClick(catName: string) {
  emit('selectCategory', catName)
}

function handleFavoritesClick() {
  emit('viewFavorites')
}

// Stats for landing summaries
const totalQuestionsCount = computed(() => {
  return store.overallProgress.totalQuestions
})

const masteredQuestionsCount = computed(() => {
  return store.overallProgress.masteredCount
})

const percentCompleted = computed(() => {
  return store.overallProgress.percent
})
</script>

<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    <!-- Header Summary Status -->
    <div class="mb-4">
      <p class="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
        CodeMaster Interview Deck
      </p>
      <h2 class="text-xl font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
        <span>题库概览</span>
        <span class="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-mono border border-indigo-500/20">
          {{ store.questionBank.length }} 分类
        </span>
      </h2>
    </div>

    <!-- Search Tool and Favorites Shortcut -->
    <div class="space-y-3 mb-5">
      <!-- Search Input box -->
      <div class="relative flex items-center">
        <Search class="absolute left-3.5 text-slate-500" :size="16" />
        <input 
          v-model="searchKeyword"
          type="text" 
          placeholder="搜索题目关键字或解析内容..." 
          class="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-2xl pl-10 pr-4 py-3 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <!-- Close search cross -->
        <button 
          v-if="searchKeyword" 
          @click="searchKeyword = ''"
          class="absolute right-3.5 text-slate-500 hover:text-slate-300 text-xs bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center font-mono leading-none"
        >
          ×
        </button>
      </div>

      <!-- Quick Favorites Bar -->
      <div class="flex gap-2">
        <button 
          @click="handleFavoritesClick"
          class="w-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-2xl p-3 text-left flex items-center justify-between transition group cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <div class="bg-amber-500/10 text-amber-400 p-2 rounded-xl border border-amber-500/15 group-hover:scale-105 transition-transform">
              <Star :size="14" fill="currentColor" />
            </div>
            <div>
              <div class="text-xs font-bold text-slate-200">
                我的收藏
              </div>
              <div class="text-[10px] text-slate-500">
                共收藏 {{ store.favorites.length }} 道面试题
              </div>
            </div>
          </div>
          <ChevronRight :size="14" class="text-slate-600 group-hover:text-slate-400 transition" />
        </button>
      </div>
    </div>

    <!-- MAIN BODY SECTION: GRID OR MATCHED RESULTS -->
    <div class="flex-1 overflow-y-auto pr-1 select-none custom-scrollbar">
      <!-- Search results view -->
      <div v-if="searchKeyword" class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <span class="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            Search Matches
          </span>
          <span class="text-[10px] text-indigo-400 font-mono">
            找到 {{ searchResults.length }} 条结果
          </span>
        </div>

        <QuestionList 
          v-if="searchResultsQuestions.length > 0"
          :questions="searchResultsQuestions" 
          categoryName="搜索结果"
        />

        <div v-else class="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
          <BookOpen class="mx-auto text-slate-600 mb-2 stroke-[1.5]" :size="32" />
          <p class="text-slate-500 text-xs">没有找到与其匹配的题目</p>
          <p class="text-slate-600 text-[10px] mt-1.5">试着输入 “指针”, “内存” 或 “进程” 等核心词汇</p>
        </div>
      </div>

      <!-- Standard categories grid -->
      <div v-else class="space-y-5">
        <div class="flex items-center justify-between px-1">
          <span class="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            Technical Categories
          </span>
          <span class="text-[11px] text-slate-400 font-mono">
            总题数: {{ totalQuestionsCount }}
          </span>
        </div>

        <!-- Grid layout -->
        <div class="grid grid-cols-2 gap-3 pb-8">
          <div 
            v-for="cat in store.questionBank" 
            :key="cat.category"
            @click="handleCategoryClick(cat.category)"
            class="bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between gap-3 transition cursor-pointer select-none group relative overflow-hidden"
          >
            <!-- Emojis & Counts -->
            <div class="flex justify-between items-start">
              <span class="text-2xl group-hover:scale-110 transition duration-300">
                {{ getEmoji(cat.category) }}
              </span>
              <!-- Tiny mastery indicator badge -->
              <span 
                v-if="store.categoryProgress(cat.category).percent === 100"
                class="bg-green-500/15 text-green-400 border border-green-500/25 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase"
              >
                已通关
              </span>
            </div>

            <!-- Labels -->
            <div>
              <h3 class="font-bold text-xs text-slate-100 group-hover:text-indigo-400 transition-colors">
                {{ cat.category }}
              </h3>
              <div class="flex items-center gap-1 mt-1">
                <span class="text-[10px] text-slate-500 font-mono">
                  {{ cat.questions.length }} 题
                </span>
                <span class="text-[9px] text-slate-600 font-mono">•</span>
                <span class="text-[9px] text-slate-400 font-mono">
                  已掌握 {{ store.categoryProgress(cat.category).masteredCount }}
                </span>
              </div>
            </div>

            <!-- Custom Category progress mini bar -->
            <div class="w-full bg-slate-950 rounded-full h-1 mt-1 overflow-hidden">
              <div 
                class="h-full bg-indigo-500 transition-all duration-300"
                :style="{ width: store.categoryProgress(cat.category).percent + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Progress Box on Homepage bottom -->
    <div v-if="!searchKeyword" class="mt-auto pt-3 border-t border-slate-900">
      <div class="bg-gradient-to-br from-indigo-900/60 to-purple-950/40 p-4 rounded-2xl border border-indigo-500/10 flex items-center justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-1.5 text-xs text-indigo-300 font-bold mb-1">
            <Award :size="13" />
            <span>面试实力评级</span>
          </div>
          <p class="text-[10px] text-slate-400 leading-relaxed font-light">
            已攻克 {{ masteredQuestionsCount }} 道技术难关。
            {{ percentCompleted < 20 ? '仍需继续积累实力。' : percentCompleted < 50 ? '战力正在强力跃升中！' : percentCompleted < 80 ? '资深实力展露无遗！' : '面试通关率爆表！' }}
          </p>
        </div>

        <div class="text-right flex flex-col items-center">
          <div class="relative w-14 h-14 flex items-center justify-center">
            <!-- Center master percentage radial count -->
            <span class="text-sm font-black text-white font-mono leading-none">
              {{ percentCompleted }}%
            </span>
            <!-- Simple clean indicator style wrapper -->
            <svg class="absolute inset-0 w-full h-full transform -rotate-90">
              <circle 
                cx="28" cy="28" r="24" 
                stroke="rgba(255,255,255,0.05)" stroke-width="4" 
                fill="none" 
              />
              <circle 
                cx="28" cy="28" r="24" 
                stroke="currentColor" stroke-width="4" 
                fill="none" 
                class="text-indigo-500"
                :stroke-dasharray="2 * Math.PI * 24"
                :stroke-dashoffset="2 * Math.PI * 24 * (1 - percentCompleted / 100)"
              />
            </svg>
          </div>
        </div>
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
</style>
