<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAppStore, Question } from '../store'
import { Star, Check, ChevronLeft, ChevronRight, RotateCw, CheckSquare } from 'lucide-vue-next'

const props = defineProps<{
  questions: Question[]
  categoryName: string
}>()

const store = useAppStore()

// Current selected question index inside this category pool
const currentIndex = ref(0)

// Card flipping state: false = front, true = back
const isFlipped = ref(false)

// Reset index and fold state when incoming questions list changes
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
      currentIndex.value = 0 // loop back
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
      currentIndex.value = props.questions.length - 1 // loop to end
    }
  }, 150)
}

// Level tag color styling classes
function getLevelBadgeClass(level: string) {
  switch (level) {
    case '必问':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    case '重点':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case '了解':
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700'
  }
}
</script>

<template>
  <div class="flex flex-col h-full justify-between gap-4">
    <!-- Main viewport containing card -->
    <div v-if="currentQuestion" class="flex-1 flex flex-col items-center justify-center">
      <!-- 3D Card Stage with perspective -->
      <div 
        class="w-full max-w-[310px] aspect-[4/5] perspective-1000 cursor-pointer select-none"
        @click="handleFlip"
      >
        <!-- Rotation Container -->
        <div 
          class="w-full h-full relative transition-transform duration-500 transform-style-3d card-inner"
          :class="{ 'rotate-y-180': isFlipped }"
        >
          <!-- CARD FRONT STATE (isFlipped = false) -->
          <div class="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800/80 p-6 flex flex-col items-center text-center shadow-xl justify-between">
            <div class="flex justify-between items-center w-full">
              <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Level Indicator
              </span>
              <span 
                v-if="currentQuestion.level"
                class="text-[10px] px-2.5 py-0.5 rounded-full font-bold border" 
                :class="getLevelBadgeClass(currentQuestion.level)"
              >
                {{ currentQuestion.level }}
              </span>
            </div>

            <!-- Central Question -->
            <div class="flex-1 flex flex-col justify-center py-4 w-full">
              <h3 class="text-base sm:text-lg font-medium text-slate-100 leading-relaxed px-2">
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

            <!-- Hint footer -->
            <div class="text-slate-500 text-[10px] flex items-center gap-1.5 py-1">
              <RotateCw :size="10" />
              <span>点击卡片翻转查看解答</span>
            </div>
          </div>

          <!-- CARD BACK STATE (isFlipped = true) -->
          <div class="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-slate-900 rounded-3xl border border-indigo-500/30 p-5 flex flex-col shadow-2xl justify-between">
            <div class="flex justify-between items-center pb-2 border-b border-slate-800/60 w-full">
              <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                Answer Key
              </span>
              <span 
                v-if="currentQuestion.level"
                class="text-[10px] px-2 py-0.5 rounded-full border" 
                :class="getLevelBadgeClass(currentQuestion.level)"
              >
                {{ currentQuestion.level }}
              </span>
            </div>

            <!-- Scrollable answer body on back face -->
            <div class="flex-1 my-3 overflow-y-auto pr-1 text-left custom-scrollbar" @click.stop>
              <p class="text-slate-300 text-xs leading-relaxed whitespace-pre-line antialiased">
                {{ currentQuestion.answer || '暂无详细文字回答，可以开启手风琴模式下的 AI 解析模块获得详细解说！' }}
              </p>
            </div>

            <!-- Hint to tap back -->
            <div class="text-slate-500 text-[9px] text-center pointer-events-none mt-1 py-1 border-t border-slate-800/60 flex items-center justify-center gap-1">
              <RotateCw :size="9" />
              <span>点击空白处可翻回正面</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Category Placeholder fallback -->
    <div v-else class="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-900/40 rounded-3xl border border-slate-800">
      <p class="text-slate-500 text-sm">该筛选条件下暂无面试题目</p>
    </div>

    <!-- Bottom controller area -->
    <div v-if="currentQuestion" class="w-full flex flex-col gap-3">
      <!-- Fast actions panel for currently displayed card -->
      <div class="flex items-center justify-center gap-3">
        <!-- Star toggle -->
        <button 
          @click="store.toggleFavorite(currentQuestion.id)"
          class="w-10 h-10 rounded-full border flex items-center justify-center transition"
          :class="[
            store.isFavorite(currentQuestion.id)
              ? 'border-amber-500/50 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10'
              : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800'
          ]"
          title="收藏题目"
        >
          <Star :size="16" :fill="store.isFavorite(currentQuestion.id) ? 'currentColor' : 'none'" />
        </button>

        <!-- Master status toggle -->
        <button 
          @click="store.toggleMastered(currentQuestion.id)"
          class="px-6 py-2.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-indigo-500/5"
          :class="[
            store.isMastered(currentQuestion.id)
              ? 'border-green-500/50 text-green-400 bg-green-500/5 hover:bg-green-500/10'
              : 'border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
          ]"
        >
          <Check :size="14" class="stroke-[3]" />
          <span>{{ store.isMastered(currentQuestion.id) ? '已掌握' : '标记掌握' }}</span>
        </button>
      </div>

      <!-- Arrow navigation -->
      <div class="flex justify-between items-center px-4 py-2 border-t border-slate-800/80 mt-1">
        <button 
          @click="handlePrev"
          class="w-10 h-10 rounded-full border border-slate-800 hover:border-slate-705 flex items-center justify-center text-slate-300 hover:bg-slate-850 transition"
        >
          <ChevronLeft :size="20" />
        </button>
        
        <div class="text-[11px] font-mono text-slate-500 tracking-wider">
          {{ currentIndex + 1 }} / {{ questions.length }}
        </div>

        <button 
          @click="handleNext"
          class="w-10 h-10 rounded-full border border-slate-800 hover:border-slate-705 flex items-center justify-center text-slate-300 hover:bg-slate-850 transition"
        >
          <ChevronRight :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Highly polished 3D transform animations */
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

/* Custom minimal scrollbar styling for card backs */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
