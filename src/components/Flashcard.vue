<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAppStore, Question } from '../store'
import { Star, Check, ChevronLeft, ChevronRight, RotateCw } from 'lucide-vue-next'

const props = defineProps<{
  questions: Question[]
  categoryName: string
}>()

const store = useAppStore()
const currentIndex = ref(0)
const isFlipped = ref(false)

watch(() => props.questions, () => {
  currentIndex.value = 0
  isFlipped.value = false
}, { deep: true })

const currentQuestion = computed<Question | null>(() => {
  if (props.questions.length === 0) return null
  return props.questions[currentIndex.value]
})

function handleFlip() {
  isFlipped.value = !isFlipped.value
}

function handleNext() {
  if (props.questions.length === 0) return
  isFlipped.value = false
  setTimeout(() => {
    if (currentIndex.value < props.questions.length - 1) {
      currentIndex.value++
    } else {
      currentIndex.value = 0
    }
  }, 150)
}

function handlePrev() {
  if (props.questions.length === 0) return
  isFlipped.value = false
  setTimeout(() => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    } else {
      currentIndex.value = props.questions.length - 1
    }
  }, 150)
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
  <div class="flex flex-col h-full min-h-0 justify-between gap-3 sm:gap-4">
    <div v-if="currentQuestion" class="flex-1 min-h-0 w-full flex flex-col items-center justify-center px-0.5">
      <div
        class="flashcard-card perspective-1000 cursor-pointer select-none shrink-0"
        @click="handleFlip"
      >
        <div 
          class="w-full h-full relative transition-transform duration-500 transform-style-3d card-inner"
          :class="{ 'rotate-y-180': isFlipped }"
        >
          <div class="absolute inset-0 w-full h-full backface-hidden bg-app-card-front rounded-3xl border border-app p-4 sm:p-6 flex flex-col items-center text-center shadow-xl justify-between">
            <div class="flex justify-between items-center w-full gap-2">
              <span class="text-app-xs font-mono text-app-muted uppercase tracking-widest">
                Level Indicator
              </span>
              <span 
                v-if="currentQuestion.level"
                class="text-app-xs px-2.5 py-0.5 rounded-full font-bold border shrink-0" 
                :class="getLevelBadgeClass(currentQuestion.level)"
              >
                {{ currentQuestion.level }}
              </span>
            </div>

            <div class="flex-1 flex flex-col justify-center py-4 w-full">
              <h3 class="text-sm sm:text-base font-medium text-app leading-relaxed px-1 sm:px-2">
                {{ currentQuestion.question }}
              </h3>
              
              <div 
                v-if="store.isMastered(currentQuestion.id)"
                class="mt-3 flex items-center justify-center gap-1 text-green-400 text-xs font-semibold"
              >
                <Check :size="14" class="stroke-[3]" />
                <span>已掌握此题</span>
              </div>
            </div>

            <div class="text-app-muted text-app-xs flex items-center gap-1.5 py-1 shrink-0">
              <RotateCw :size="10" />
              <span>点击卡片翻转查看解答</span>
            </div>
          </div>

          <div class="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-app-card-back rounded-3xl border border-app-accent p-4 sm:p-5 flex flex-col shadow-2xl justify-between min-h-0">
            <div class="flex justify-between items-center pb-2 border-b border-app w-full gap-2 shrink-0">
              <span class="text-app-xs font-bold text-app-accent uppercase tracking-widest">
                Answer Key
              </span>
              <span 
                v-if="currentQuestion.level"
                class="text-app-xs px-2 py-0.5 rounded-full border shrink-0" 
                :class="getLevelBadgeClass(currentQuestion.level)"
              >
                {{ currentQuestion.level }}
              </span>
            </div>

            <div class="flex-1 min-h-0 my-2 sm:my-3 overflow-y-auto pr-1 text-left custom-scrollbar" @click.stop>
              <p class="text-app-secondary text-app-xs sm:text-xs leading-relaxed whitespace-pre-line antialiased">
                {{ currentQuestion.answer || '暂无详细文字回答，可以开启手风琴模式下的 AI 解析模块获得详细解说！' }}
              </p>
            </div>

            <div class="text-app-muted text-app-2xs text-center pointer-events-none mt-1 py-1 border-t border-app flex items-center justify-center gap-1 shrink-0">
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

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}
</style>
