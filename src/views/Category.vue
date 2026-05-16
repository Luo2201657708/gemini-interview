<script setup lang="ts">
import { ref, computed, watch, onDeactivated } from 'vue'
import { useAppStore, Question } from '../store'
import { ArrowLeft, Sliders, LayoutList, BookOpen } from 'lucide-vue-next'
import QuestionList from '../components/QuestionList.vue'
import Flashcard from '../components/Flashcard.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import TextScaleToggle from '../components/TextScaleToggle.vue'

const props = defineProps<{
  categoryName: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'flashcardImmersive', value: boolean): void
}>()

const store = useAppStore()

const activeFilter = ref<'all' | '重点' | '必问' | '了解'>('all')
const studyMode = ref<'list' | 'flashcard'>('list')
/** Full-screen flashcard: hides category header + mode/filter toolbar (and App desktop header via emit). */
const flashcardImmersive = ref(false)

function syncFlashcardImmersiveToParent() {
  emit('flashcardImmersive', studyMode.value === 'flashcard' && flashcardImmersive.value)
}

function goBack() {
  flashcardImmersive.value = false
  emit('flashcardImmersive', false)
  emit('back')
}

const scrollContainerRef = ref<HTMLElement | null>(null)
const showScrollChrome = ref(true)
const lastScrollTop = ref(0)

const SCROLL_DELTA = 8
const TOP_SHOW_OFFSET = 24
const HIDE_ACCUM_THRESHOLD = 88
const SHOW_ACCUM_THRESHOLD = 48
const CHROME_TOGGLE_COOLDOWN_MS = 360

const scrollAccum = ref(0)
let chromeCooldownUntil = 0

function onListScroll() {
  if (studyMode.value !== 'list') return
  if (Date.now() < chromeCooldownUntil) return

  const el = scrollContainerRef.value
  if (!el) return

  const scrollTop = el.scrollTop

  if (scrollTop <= TOP_SHOW_OFFSET) {
    if (!showScrollChrome.value) {
      showScrollChrome.value = true
      chromeCooldownUntil = Date.now() + CHROME_TOGGLE_COOLDOWN_MS
    }
    scrollAccum.value = 0
    lastScrollTop.value = scrollTop
    return
  }

  const delta = scrollTop - lastScrollTop.value
  lastScrollTop.value = scrollTop
  if (Math.abs(delta) < SCROLL_DELTA) return

  if (delta > 0) {
    if (scrollAccum.value < 0) scrollAccum.value = 0
    scrollAccum.value += delta
    if (scrollAccum.value >= HIDE_ACCUM_THRESHOLD && showScrollChrome.value) {
      showScrollChrome.value = false
      scrollAccum.value = 0
      chromeCooldownUntil = Date.now() + CHROME_TOGGLE_COOLDOWN_MS
    }
  } else {
    if (scrollAccum.value > 0) scrollAccum.value = 0
    scrollAccum.value += delta
    if (scrollAccum.value <= -SHOW_ACCUM_THRESHOLD && !showScrollChrome.value) {
      showScrollChrome.value = true
      scrollAccum.value = 0
      chromeCooldownUntil = Date.now() + CHROME_TOGGLE_COOLDOWN_MS
    }
  }
}

watch(studyMode, () => {
  showScrollChrome.value = true
  scrollAccum.value = 0
  chromeCooldownUntil = 0
  lastScrollTop.value = scrollContainerRef.value?.scrollTop ?? 0
  if (studyMode.value !== 'flashcard') {
    flashcardImmersive.value = false
  }
  syncFlashcardImmersiveToParent()
})

watch(flashcardImmersive, () => {
  syncFlashcardImmersiveToParent()
})

onDeactivated(() => {
  flashcardImmersive.value = false
  emit('flashcardImmersive', false)
})

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
    <div
      class="category-immersive-target border-b border-app-subtle mb-3 pb-3 shrink-0"
      :class="{ 'category-immersive-target--hidden': studyMode === 'flashcard' && flashcardImmersive }"
    >
      <div class="flex items-center gap-2">
        <button
          @click="goBack"
          class="shrink-0 w-8 h-8 rounded-full bg-app-surface border border-app flex items-center justify-center text-app-secondary hover:text-app-heading transition-colors cursor-pointer"
        >
          <ArrowLeft :size="16" />
        </button>

        <div class="text-center flex-1 min-w-0 px-1">
          <h3 class="text-sm font-bold text-app-heading tracking-tight truncate">
            {{ props.categoryName }}
          </h3>
          <div class="flex items-center justify-center gap-1.5 mt-0.5 text-app-2xs font-mono text-app-muted">
            <span>攻克度</span>
            <span class="text-app-accent font-bold">
              {{ viewProgress.mastered }}/{{ viewProgress.total }}
            </span>
            <span>({{ viewProgress.percent }}%)</span>
          </div>
        </div>

        <div class="shrink-0 w-8" aria-hidden="true" />
      </div>
    </div>

    <div
      class="chrome-collapse-shell shrink-0"
      :class="{
        'chrome-collapse-shell--hidden':
          studyMode === 'list' && !showScrollChrome,
        'chrome-collapse-shell--pinned':
          studyMode === 'flashcard' && !flashcardImmersive,
        'chrome-collapse-shell--immersive-hidden':
          studyMode === 'flashcard' && flashcardImmersive,
      }"
    >
      <div class="chrome-collapse-track">
        <div class="flex items-center justify-between gap-3">
          <div class="bg-app-inset p-1 rounded-full flex border border-app shrink-0">
            <button
              @click="studyMode = 'list'"
              class="px-2.5 py-1 rounded-full text-app-2xs font-bold flex items-center gap-1 transition"
              :class="[
                studyMode === 'list'
                  ? 'bg-app-surface-hover text-app-accent font-extrabold shadow'
                  : 'text-app-muted hover:text-app-secondary',
              ]"
            >
              <LayoutList :size="10" />
              <span>列表</span>
            </button>
            <button
              @click="studyMode = 'flashcard'"
              class="px-2.5 py-1 rounded-full text-app-2xs font-bold flex items-center gap-1 transition"
              :class="[
                studyMode === 'flashcard'
                  ? 'bg-app-surface-hover text-app-accent font-extrabold shadow'
                  : 'text-app-muted hover:text-app-secondary',
              ]"
            >
              <BookOpen :size="10" />
              <span>闪卡</span>
            </button>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <TextScaleToggle />
            <ThemeToggle />
          </div>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2.5 invisible-scrollbar">
          <button
            v-for="filter in (['all', '重点', '必问', '了解'] as const)"
            :key="filter"
            @click="activeFilter = filter"
            class="px-3.5 py-1.5 rounded-xl border text-app-sm-cap font-semibold whitespace-nowrap transition-colors cursor-pointer"
            :class="[
              activeFilter === filter
                ? 'bg-app-accent-solid border-app-accent text-white font-extrabold shadow-sm'
                : 'bg-app-surface border-app text-app-secondary hover:text-app hover:border-app-strong',
            ]"
          >
            {{ filter === 'all' ? '全部' : filter }}
          </button>
        </div>
      </div>
    </div>

    <div
      ref="scrollContainerRef"
      class="flex-1 min-h-0 pr-1 select-none custom-scrollbar list-scroll-container"
      :class="
        studyMode === 'list'
          ? 'overflow-y-auto'
          : flashcardImmersive
            ? 'overflow-hidden pt-0'
            : 'overflow-hidden pt-1'
      "
      @scroll="onListScroll"
    >
      <div v-if="filteredQuestions.length > 0" class="h-full min-h-0">
        <QuestionList
          v-if="studyMode === 'list'"
          :questions="filteredQuestions"
          :categoryName="props.categoryName"
        />
        <Flashcard
          v-else
          v-model:immersive="flashcardImmersive"
          :questions="filteredQuestions"
          :categoryName="props.categoryName"
        />
      </div>

      <div v-else class="text-center py-20 bg-app-muted rounded-3xl border border-app mt-2 p-6">
        <Sliders class="mx-auto text-app-faint mb-2 stroke-[1.5]" :size="32" />
        <p class="text-app-muted text-xs font-medium">该筛选条件下暂无题目</p>
        <p class="text-app-faint text-app-xs mt-1.5 leading-relaxed">
          可以在主页收藏更多题目，或切换筛选过滤器查看。
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-immersive-target {
  overflow: hidden;
  max-height: 12rem;
  opacity: 1;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom-width: 1px;
  pointer-events: auto;
  will-change: max-height, opacity, margin-bottom, padding-bottom;
  transition:
    max-height 0.52s cubic-bezier(0.33, 1, 0.68, 1),
    opacity 0.42s cubic-bezier(0.4, 0, 0.2, 1),
    margin-bottom 0.52s cubic-bezier(0.33, 1, 0.68, 1),
    padding-bottom 0.52s cubic-bezier(0.33, 1, 0.68, 1),
    border-color 0.35s ease;
}

.category-immersive-target--hidden {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
  padding-bottom: 0;
  padding-top: 0;
  border-bottom-width: 0;
  border-color: transparent;
  pointer-events: none;
  transition:
    max-height 0.56s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1) 0.05s,
    margin-bottom 0.52s cubic-bezier(0.33, 1, 0.68, 1),
    padding-bottom 0.52s cubic-bezier(0.33, 1, 0.68, 1),
    border-color 0.25s ease;
}

.chrome-collapse-shell {
  overflow: hidden;
  max-height: calc(7.5rem * var(--app-scale));
  margin-bottom: 1rem;
  opacity: 1;
  pointer-events: auto;
  will-change: max-height, opacity, margin-bottom;
  transition:
    max-height 0.52s cubic-bezier(0.33, 1, 0.68, 1),
    margin-bottom 0.52s cubic-bezier(0.33, 1, 0.68, 1),
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chrome-collapse-shell--hidden {
  max-height: 0;
  margin-bottom: 0;
  opacity: 0;
  pointer-events: none;
  transition:
    max-height 0.58s cubic-bezier(0.32, 0.72, 0, 1),
    margin-bottom 0.58s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.06s;
}

.chrome-collapse-shell--pinned {
  max-height: none;
  overflow: visible;
  margin-bottom: 0.5rem;
  opacity: 1;
  pointer-events: auto;
}

.chrome-collapse-shell--immersive-hidden {
  max-height: 0 !important;
  margin-bottom: 0 !important;
  opacity: 0;
  pointer-events: none;
  overflow: hidden !important;
  transition:
    max-height 0.56s cubic-bezier(0.32, 0.72, 0, 1),
    margin-bottom 0.52s cubic-bezier(0.33, 1, 0.68, 1),
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;
}

@media (min-width: 768px) {
  .chrome-collapse-shell--pinned {
    margin-bottom: 0.375rem;
  }
}

.chrome-collapse-track {
  transform: translateY(0) scale(1);
  opacity: 1;
  transform-origin: top center;
  transition:
    transform 0.52s cubic-bezier(0.33, 1, 0.68, 1),
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chrome-collapse-shell--hidden .chrome-collapse-track {
  transform: translateY(-0.625rem) scale(0.98);
  opacity: 0;
  transition:
    transform 0.58s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1) 0.04s;
}

.chrome-collapse-shell--immersive-hidden .chrome-collapse-track {
  transform: translateY(-0.5rem) scale(0.985);
  opacity: 0;
  transition:
    transform 0.54s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;
}

.list-scroll-container {
  overflow-anchor: none;
}

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
