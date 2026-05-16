<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore, Question } from '../store'
import {
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Maximize2,
  Minimize2,
} from 'lucide-vue-next'
import QuestionFeedback from './QuestionFeedback.vue'

const props = defineProps<{
  questions: Question[]
  categoryName: string
}>()

/** Immersive flashcard: parent hides category chrome; toggled via corner control (tap), not long-press. */
const immersive = defineModel<boolean>('immersive', { default: false })

function toggleImmersive() {
  immersive.value = !immersive.value
}

const store = useAppStore()
const currentIndex = ref(0)
const isFlipped = ref(false)

const SWIPE_MIN_DELTA = 10
const SWIPE_AXIS_RATIO = 1.35
const SWIPE_COMMIT_THRESHOLD = 76
const SWIPE_DRAG_DAMPING = 0.42
const SWIPE_COOLDOWN_MS = 420
const SLIDE_EXIT_MS = 280
const SLIDE_ENTER_MS = 360
const SLIDE_EXIT_OFFSET = 118
const SLIDE_ENTER_OFFSET = 92
const SLIDE_SCALE_DELTA = 0.05 // scale 1 → ~0.95 at full travel

const dragOffsetX = ref(0)
const slideExitX = ref(0)
const slideEnterX = ref(0)
const slidePhase = ref<'idle' | 'exit' | 'enter'>('idle')
const slideDirection = ref<'next' | 'prev' | null>(null)
const isSwipeActive = ref(false)
const suppressFlipClick = ref(false)
const prefersReducedMotion = ref(false)

let reducedMotionMql: MediaQueryList | null = null

function syncReducedMotion() {
  prefersReducedMotion.value = reducedMotionMql?.matches ?? false
}

onMounted(() => {
  reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncReducedMotion()
  reducedMotionMql.addEventListener('change', syncReducedMotion)
})

onUnmounted(() => {
  reducedMotionMql?.removeEventListener('change', syncReducedMotion)
})

let touchStartX = 0
let touchStartY = 0
let rawDragX = 0
let gestureAxis: 'horizontal' | 'vertical' | null = null
let swipeCooldownUntil = 0

watch(() => props.questions, () => {
  currentIndex.value = 0
  isFlipped.value = false
  resetSwipeState()
}, { deep: true })

const currentQuestion = computed<Question | null>(() => {
  if (props.questions.length === 0) return null
  return props.questions[currentIndex.value]
})

function slideMotionFromProgress(progress: number) {
  const p = Math.min(Math.max(progress, 0), 1)
  return {
    scale: 1 - p * SLIDE_SCALE_DELTA,
    opacity: 1 - p,
  }
}

const cardMotionStyle = computed(() => {
  const x = slideExitX.value || slideEnterX.value || dragOffsetX.value
  if (!x && slidePhase.value === 'idle') return undefined

  let scale = 1
  let opacity = 1

  if (slidePhase.value === 'exit') {
    const progress = Math.min(Math.abs(slideExitX.value) / SLIDE_EXIT_OFFSET, 1)
    ;({ scale, opacity } = slideMotionFromProgress(progress))
  } else if (slidePhase.value === 'enter') {
    const progress = Math.min(Math.abs(slideEnterX.value) / SLIDE_ENTER_OFFSET, 1)
    ;({ scale, opacity } = slideMotionFromProgress(progress))
  } else if (dragOffsetX.value) {
    const progress = Math.min(Math.abs(dragOffsetX.value) / SWIPE_COMMIT_THRESHOLD, 1)
    scale = 1 - progress * 0.035
    opacity = 1 - progress * 0.12
  }

  return {
    transform: `translateX(${x}px) scale(${scale})`,
    opacity: String(opacity),
  }
})

const cardMotionClass = computed(() => ({
  'flashcard-card--dragging': isSwipeActive.value && !!dragOffsetX.value && slidePhase.value === 'idle',
  'flashcard-card--exiting': slidePhase.value === 'exit',
  'flashcard-card--entering': slidePhase.value === 'enter',
  'flashcard-card--reduced-motion': prefersReducedMotion.value,
}))

function resetSwipeState() {
  dragOffsetX.value = 0
  slideExitX.value = 0
  slideEnterX.value = 0
  slidePhase.value = 'idle'
  slideDirection.value = null
  isSwipeActive.value = false
  gestureAxis = null
  rawDragX = 0
}

function handleFlip() {
  if (suppressFlipClick.value) {
    suppressFlipClick.value = false
    return
  }
  isFlipped.value = !isFlipped.value
}

function advanceIndex(direction: 'next' | 'prev') {
  if (direction === 'next') {
    if (currentIndex.value < props.questions.length - 1) {
      currentIndex.value++
    } else {
      currentIndex.value = 0
    }
  } else if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = props.questions.length - 1
  }
}

function navigateAnimated(direction: 'next' | 'prev', fromSwipe = false) {
  if (props.questions.length === 0 || Date.now() < swipeCooldownUntil) return
  if (slidePhase.value !== 'idle') return

  isFlipped.value = false
  swipeCooldownUntil = Date.now() + SWIPE_COOLDOWN_MS
  if (fromSwipe) suppressFlipClick.value = true

  if (prefersReducedMotion.value) {
    advanceIndex(direction)
    resetSwipeState()
    return
  }

  slideDirection.value = direction
  slidePhase.value = 'exit'
  dragOffsetX.value = 0
  isSwipeActive.value = false

  const exitX = direction === 'next' ? -SLIDE_EXIT_OFFSET : SLIDE_EXIT_OFFSET
  slideExitX.value = 0
  slideEnterX.value = 0

  requestAnimationFrame(() => {
    slideExitX.value = exitX
  })

  window.setTimeout(() => {
    advanceIndex(direction)
    slideExitX.value = 0
    slidePhase.value = 'enter'
    slideEnterX.value = direction === 'next' ? SLIDE_ENTER_OFFSET : -SLIDE_ENTER_OFFSET

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slideEnterX.value = 0
      })
    })

    window.setTimeout(() => {
      slidePhase.value = 'idle'
      slideDirection.value = null
    }, SLIDE_ENTER_MS)
  }, SLIDE_EXIT_MS)
}

function navigateBySwipe(direction: 'next' | 'prev') {
  navigateAnimated(direction, true)
}

function handleNext() {
  navigateAnimated('next')
}

function handlePrev() {
  navigateAnimated('prev')
}

let touchMoveTarget: HTMLElement | null = null

function detachTouchMove() {
  touchMoveTarget?.removeEventListener('touchmove', onTouchMove)
  touchMoveTarget = null
}

function onTouchStart(e: TouchEvent) {
  if (Date.now() < swipeCooldownUntil || slidePhase.value !== 'idle') return

  const touch = e.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  rawDragX = 0
  gestureAxis = null
  dragOffsetX.value = 0
  isSwipeActive.value = true

  touchMoveTarget = e.currentTarget as HTMLElement
  touchMoveTarget.addEventListener('touchmove', onTouchMove, { passive: false })
}

function onTouchMove(e: TouchEvent) {
  if (!isSwipeActive.value || Date.now() < swipeCooldownUntil || slidePhase.value !== 'idle') return

  const touch = e.touches[0]
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY

  if (!gestureAxis) {
    if (Math.abs(dx) < SWIPE_MIN_DELTA && Math.abs(dy) < SWIPE_MIN_DELTA) return

    if (Math.abs(dx) > Math.abs(dy) * SWIPE_AXIS_RATIO) {
      gestureAxis = 'horizontal'
    } else if (Math.abs(dy) > Math.abs(dx) * SWIPE_AXIS_RATIO) {
      gestureAxis = 'vertical'
      isSwipeActive.value = false
      return
    } else {
      return
    }
  }

  if (gestureAxis !== 'horizontal') return

  e.preventDefault()
  rawDragX = dx
  dragOffsetX.value = dx * SWIPE_DRAG_DAMPING
}

function onTouchEnd() {
  detachTouchMove()

  if (!isSwipeActive.value || gestureAxis !== 'horizontal') {
    resetSwipeState()
    return
  }

  const shouldGoNext = rawDragX <= -SWIPE_COMMIT_THRESHOLD
  const shouldGoPrev = rawDragX >= SWIPE_COMMIT_THRESHOLD

  if (shouldGoNext) {
    navigateBySwipe('next')
    return
  }

  if (shouldGoPrev) {
    navigateBySwipe('prev')
    return
  }

  dragOffsetX.value = 0
  isSwipeActive.value = false
  gestureAxis = null
  rawDragX = 0
}

function getLevelBadgeClass(level: string) {
  switch (level) {
    case '必问':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    case '重点':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case '了解':
    default:
      return 'bg-app-surface-hover text-app-muted border-app'
  }
}
</script>

<template>
  <div class="relative flex flex-col h-full min-h-0 justify-between gap-2 sm:gap-3 md:gap-3">
    <div v-if="currentQuestion" class="flashcard-stage flex-1 min-h-0 w-full flex flex-col items-center justify-center px-0.5 py-1 md:py-1 overflow-hidden">
      <div
        class="flashcard-card perspective-1000 cursor-pointer select-none touch-pan-y"
        :class="cardMotionClass"
        :style="cardMotionStyle"
        @touchstart.passive="onTouchStart"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
        @click="handleFlip"
      >
        <div 
          class="w-full h-full relative transition-transform duration-500 transform-style-3d card-inner"
          :class="{ 'rotate-y-180': isFlipped }"
        >
          <div class="absolute inset-0 w-full h-full backface-hidden bg-app-card-front rounded-3xl border border-app p-4 sm:p-6 flex flex-col items-center text-center shadow-xl justify-between">
            <div class="flex w-full min-w-0 items-center justify-between gap-2">
              <div class="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-1 md:justify-start">
                <span class="text-app-xs md:text-xs font-mono text-app-muted uppercase tracking-widest">
                  Level Indicator
                </span>
                <span 
                  v-if="currentQuestion.level"
                  class="text-app-xs md:text-xs px-2.5 py-0.5 rounded-full font-bold border shrink-0" 
                  :class="getLevelBadgeClass(currentQuestion.level)"
                >
                  {{ currentQuestion.level }}
                </span>
              </div>
              <button
                v-if="questions.length > 0"
                type="button"
                class="flex size-9 shrink-0 items-center justify-center rounded-full border border-app bg-app-surface/95 text-app-secondary shadow-md backdrop-blur-sm transition hover:border-app-strong hover:text-app-heading pointer-events-auto"
                :aria-pressed="immersive"
                :title="immersive ? '退出沉浸式' : '沉浸式闪卡'"
                @click.stop="toggleImmersive"
              >
                <Minimize2 v-if="immersive" :size="16" aria-hidden="true" />
                <Maximize2 v-else :size="16" aria-hidden="true" />
              </button>
            </div>

            <div class="flex-1 flex flex-col justify-center py-4 w-full">
              <h3 class="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-app leading-relaxed px-1 sm:px-2">
                {{ currentQuestion.question }}
              </h3>
              
              <div 
                v-if="store.isMastered(currentQuestion.id)"
                class="mt-3 flex items-center justify-center gap-1 text-green-400 text-xs md:text-sm font-semibold"
              >
                <Check :size="14" class="stroke-[3]" />
                <span>已掌握此题</span>
              </div>
            </div>

            <div class="text-app-muted text-app-xs md:text-xs flex items-center gap-1.5 py-1 shrink-0">
              <RotateCw :size="10" />
              <span>点击卡片翻转查看解答</span>
            </div>
          </div>

          <div class="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-app-card-back rounded-3xl border border-app-accent p-4 sm:p-5 flex flex-col shadow-2xl justify-between min-h-0">
            <div class="flex w-full min-w-0 items-center justify-between gap-2 pb-2 border-b border-app shrink-0">
              <div class="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                <span class="text-app-xs md:text-xs font-bold text-app-accent uppercase tracking-widest">
                  Answer Key
                </span>
                <span 
                  v-if="currentQuestion.level"
                  class="text-app-xs md:text-xs px-2 py-0.5 rounded-full border shrink-0" 
                  :class="getLevelBadgeClass(currentQuestion.level)"
                >
                  {{ currentQuestion.level }}
                </span>
              </div>
              <button
                v-if="questions.length > 0"
                type="button"
                class="flex size-9 shrink-0 items-center justify-center rounded-full border border-app bg-app-surface/95 text-app-secondary shadow-md backdrop-blur-sm transition hover:border-app-strong hover:text-app-heading pointer-events-auto"
                :aria-pressed="immersive"
                :title="immersive ? '退出沉浸式' : '沉浸式闪卡'"
                @click.stop="toggleImmersive"
              >
                <Minimize2 v-if="immersive" :size="16" aria-hidden="true" />
                <Maximize2 v-else :size="16" aria-hidden="true" />
              </button>
            </div>

            <div class="flex-1 min-h-0 my-2 sm:my-3 overflow-y-auto px-1 custom-scrollbar flex flex-col items-center justify-center" @click.stop>
              <p class="text-app-secondary text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-relaxed whitespace-pre-line antialiased w-full text-center">
                {{ currentQuestion.answer || '暂无详细文字回答，可以开启手风琴模式下的 AI 解析模块获得详细解说！' }}
              </p>
            </div>

            <div class="text-app-muted text-app-2xs md:text-app-xs text-center pointer-events-none mt-1 py-1 border-t border-app flex items-center justify-center gap-1 shrink-0">
              <RotateCw :size="9" />
              <span>点击空白处可翻回正面</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col items-center justify-center text-center p-8 bg-app-muted rounded-3xl border border-app">
      <p class="text-app-muted text-sm">该筛选条件下暂无面试题目</p>
    </div>

    <div v-if="currentQuestion" class="w-full flex flex-col gap-2 sm:gap-3 shrink-0">
      <div class="flex items-center justify-center gap-3">
        <button 
          @click="store.toggleFavorite(currentQuestion.id)"
          class="w-10 h-10 rounded-full border flex items-center justify-center transition"
          :class="[
            store.isFavorite(currentQuestion.id)
              ? 'border-amber-500/50 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10'
              : 'border-app text-app-secondary hover:border-app-strong hover:bg-app-surface-hover'
          ]"
          title="收藏题目"
        >
          <Star :size="16" :fill="store.isFavorite(currentQuestion.id) ? 'currentColor' : 'none'" />
        </button>

        <button 
          @click="store.toggleMastered(currentQuestion.id)"
          class="px-6 py-2.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-app-accent"
          :class="[
            store.isMastered(currentQuestion.id)
              ? 'border-green-500/50 text-green-400 bg-green-500/5 hover:bg-green-500/10'
              : 'border-app text-app hover:border-app-strong hover:bg-app-surface-hover'
          ]"
        >
          <Check :size="14" class="stroke-[3]" />
          <span>{{ store.isMastered(currentQuestion.id) ? '已掌握' : '标记掌握' }}</span>
        </button>

        <QuestionFeedback
          :question="currentQuestion"
          :category-name="categoryName"
          variant="iconOnly"
        />
      </div>

      <div class="flex justify-between items-center px-4 py-2 border-t border-app mt-1">
        <button 
          @click="handlePrev"
          class="w-10 h-10 rounded-full border border-app hover:border-app-strong flex items-center justify-center text-app-secondary hover:bg-app-surface-hover transition"
        >
          <ChevronLeft :size="20" />
        </button>
        
        <div class="text-app-sm-cap font-mono text-app-muted tracking-wider">
          {{ currentIndex + 1 }} / {{ questions.length }}
        </div>

        <button 
          @click="handleNext"
          class="w-10 h-10 rounded-full border border-app hover:border-app-strong flex items-center justify-center text-app-secondary hover:bg-app-surface-hover transition"
        >
          <ChevronRight :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}

.card-inner {
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.flashcard-card {
  will-change: transform, opacity;
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.flashcard-card--dragging {
  transition: none;
}

.flashcard-card--exiting {
  transition:
    transform 0.28s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.24s cubic-bezier(0.4, 0, 1, 1);
}

.flashcard-card--entering {
  transition:
    transform 0.36s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s cubic-bezier(0, 0, 0.2, 1);
}

.flashcard-card--reduced-motion {
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .flashcard-card {
    transition: none !important;
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}
</style>
