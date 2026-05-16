<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore, Question } from '../store'
import { Search, Star, ChevronRight, BookOpen, PlusCircle } from 'lucide-vue-next'
import QuestionList from '../components/QuestionList.vue'

const store = useAppStore()

const searchKeyword = ref('')

const emit = defineEmits<{
  (e: 'selectCategory', categoryName: string): void
  (e: 'viewFavorites'): void
  (e: 'addQuestions'): void
}>()

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
  '软件测试': '🧪',
}

function getEmoji(categoryName: string): string {
  return categoryEmojis[categoryName] || '📚'
}

const searchResults = computed(() => {
  return store.searchQuestions(searchKeyword.value)
})

const searchResultsQuestions = computed<Question[]>(() => {
  return searchResults.value.map(item => item.question)
})

function handleCategoryClick(catName: string) {
  emit('selectCategory', catName)
}

function handleFavoritesClick() {
  emit('viewFavorites')
}

function handleAddQuestionsClick() {
  emit('addQuestions')
}

const totalQuestionsCount = computed(() => {
  return store.overallProgress.totalQuestions
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
    <div class="flex-1 min-h-0 overflow-y-auto pr-1 select-none custom-scrollbar">
      <div class="mb-4 pr-24 md:pr-0">
        <p class="text-app-sm-cap font-mono text-app-muted uppercase tracking-widest">
          CodeMaster Interview Deck
        </p>
        <h2 class="text-xl font-bold text-app-heading tracking-tight flex items-center gap-1.5 mt-0.5">
          <span>题库概览</span>
          <span class="text-xs text-app-accent bg-app-accent-bg px-2 py-0.5 rounded-full font-mono border border-app-accent">
            {{ store.questionBank.length }} 分类
          </span>
        </h2>
      </div>

      <div class="space-y-3 mb-5">
        <div class="relative flex items-center">
          <Search class="absolute left-3.5 text-app-muted" :size="16" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索题目关键字或解析内容..."
            class="w-full bg-app-input border border-app text-app text-xs rounded-2xl pl-10 pr-4 py-3 placeholder:text-app-muted focus:outline-none focus:border-app-accent transition-colors"
          />
          <button
            v-if="searchKeyword"
            @click="searchKeyword = ''"
            class="absolute right-3.5 text-app-muted hover:text-app-heading text-xs bg-app-surface-hover rounded-full w-5 h-5 flex items-center justify-center font-mono leading-none"
          >
            ×
          </button>
        </div>

        <div class="flex flex-row gap-2">
          <button
            type="button"
            @click="handleFavoritesClick"
            class="flex-1 min-w-0 bg-app-muted hover:bg-app-surface border border-app rounded-2xl p-3 text-left flex items-center justify-between transition group cursor-pointer"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="bg-amber-500/10 text-amber-400 p-2 rounded-xl border border-amber-500/15 group-hover:scale-105 transition-transform shrink-0">
                <Star :size="14" fill="currentColor" />
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-app">我的收藏</div>
                <div class="text-app-xs text-app-muted truncate">
                  共收藏 {{ store.favorites.length }} 道面试题
                </div>
              </div>
            </div>
            <ChevronRight :size="14" class="text-app-faint group-hover:text-app-secondary transition shrink-0" />
          </button>

          <button
            type="button"
            @click="handleAddQuestionsClick"
            class="flex-1 min-w-0 bg-app-muted hover:bg-app-surface border border-app rounded-2xl p-3 text-left flex items-center justify-between transition group cursor-pointer"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="bg-app-accent-bg text-app-accent p-2 rounded-xl border border-app-accent group-hover:scale-105 transition-transform shrink-0">
                <PlusCircle :size="14" :stroke-width="2" />
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-app">添加题目</div>
                <div class="text-app-xs text-app-muted truncate">
                  自建题目并导出 Markdown
                </div>
              </div>
            </div>
            <ChevronRight :size="14" class="text-app-faint group-hover:text-app-secondary transition shrink-0" />
          </button>
        </div>
      </div>

      <div v-if="searchKeyword" class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <span class="text-app-xs text-app-muted uppercase tracking-widest font-mono">Search Matches</span>
          <span class="text-app-xs text-app-accent font-mono">找到 {{ searchResults.length }} 条结果</span>
        </div>

        <QuestionList
          v-if="searchResultsQuestions.length > 0"
          :questions="searchResultsQuestions"
          categoryName="搜索结果"
        />

        <div v-else class="text-center py-12 bg-app-muted rounded-2xl border border-app">
          <BookOpen class="mx-auto text-app-faint mb-2 stroke-[1.5]" :size="32" />
          <p class="text-app-muted text-xs">没有找到与其匹配的题目</p>
          <p class="text-app-faint text-app-xs mt-1.5">试着输入 “指针”, “内存” 或 “进程” 等核心词汇</p>
        </div>
      </div>

      <div v-else class="space-y-5">
        <div class="flex items-center justify-between px-1">
          <span class="text-app-xs text-app-muted uppercase tracking-widest font-mono">Technical Categories</span>
          <span class="text-app-sm-cap text-app-secondary font-mono">总题数: {{ totalQuestionsCount }}</span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-8">
          <div
            v-for="cat in store.questionBank"
            :key="cat.category"
            @click="handleCategoryClick(cat.category)"
            class="bg-app-muted hover:bg-app-surface border border-app hover:border-app-strong rounded-2xl p-4 flex flex-col justify-between gap-3 transition cursor-pointer select-none group relative overflow-hidden"
          >
            <div class="flex justify-between items-start">
              <span class="text-2xl group-hover:scale-110 transition duration-300">
                {{ getEmoji(cat.category) }}
              </span>
              <span
                v-if="store.categoryProgress(cat.category).percent === 100"
                class="bg-green-500/15 text-green-400 border border-green-500/25 text-app-2xs px-1.5 py-0.5 rounded-full font-bold uppercase"
              >
                已通关
              </span>
            </div>

            <div>
              <h3 class="font-bold text-xs text-app group-hover:text-app-accent transition-colors">
                {{ cat.category }}
              </h3>
              <div class="flex items-center gap-1 mt-1">
                <span class="text-app-xs text-app-muted font-mono">{{ cat.questions.length }} 题</span>
                <span class="text-app-2xs text-app-faint font-mono">•</span>
                <span class="text-app-2xs text-app-secondary font-mono">
                  已掌握 {{ store.categoryProgress(cat.category).masteredCount }}
                </span>
              </div>
            </div>

            <div class="w-full bg-app-inset rounded-full h-1 mt-1 overflow-hidden">
              <div
                class="h-full bg-app-accent-solid transition-all duration-300"
                :style="{ width: store.categoryProgress(cat.category).percent + '%' }"
              />
            </div>
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
</style>
