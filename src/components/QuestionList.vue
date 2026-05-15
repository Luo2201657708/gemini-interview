<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore, Question } from '../store'
import { Star, Check, ChevronDown, ChevronUp } from 'lucide-vue-next'

defineProps<{
  questions: Question[]
  categoryName: string
}>()

const store = useAppStore()
const expandedId = ref<string | null>(null)

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function getLevelBadgeClass(level: string) {
  switch (level) {
    case '必问':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    case '重点':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case '了解':
    default:
      return 'bg-app-surface-hover text-app-muted border-app'
  }
}
</script>

<template>
  <div class="space-y-3 pb-8">
    <div 
      v-for="q in questions" 
      :key="q.id"
      :id="'q-row-' + q.id"
      class="bg-app-muted rounded-2xl border transition-all duration-200"
      :class="[
        expandedId === q.id 
          ? 'border-app-accent shadow-xl shadow-app-accent bg-app-surface' 
          : 'border-app hover:border-app-strong hover:bg-app-surface'
      ]"
    >
      <div 
        class="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
        @click="toggleExpand(q.id)"
      >
        <div class="flex-1 flex flex-col gap-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span 
              v-if="q.level"
              class="text-[10px] px-2 py-0.5 rounded-full font-bold border" 
              :class="getLevelBadgeClass(q.level)"
            >
              {{ q.level }}
            </span>
            <span 
              v-if="store.isMastered(q.id)" 
              class="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold"
            >
              已掌握
            </span>
          </div>
          <h4 class="text-sm font-medium text-app leading-snug mt-1">
            {{ q.question }}
          </h4>
        </div>
        
        <div class="text-app-muted">
          <ChevronUp v-if="expandedId === q.id" :size="18" />
          <ChevronDown v-else :size="18" />
        </div>
      </div>

      <div 
        v-if="expandedId === q.id" 
        class="border-t border-app p-4 bg-app-inset/40 rounded-b-2xl transition-all"
      >
        <div class="text-app-secondary text-xs leading-relaxed whitespace-pre-line font-light">
          <div v-if="q.answer">
            {{ q.answer }}
          </div>
          <div v-else class="text-app-muted italic">
            暂无详细参考答案，后续会持续补充完善。
          </div>
          <p class="mt-3 text-[11px] text-app-muted">
            当前为离线数据版本，后续开发会持续完善内容与分析能力。
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-app flex justify-between items-center">
          <div class="text-[10px] font-mono text-app-muted">
            ID: {{ q.id }}
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click.stop="store.toggleFavorite(q.id)"
              class="px-2.5 py-1 rounded-xl border text-[11px] font-medium flex items-center gap-1 transition"
              :class="[
                store.isFavorite(q.id)
                  ? 'border-amber-500/50 hover:bg-amber-500/10 text-amber-400 bg-amber-500/5'
                  : 'border-app text-app-secondary hover:border-app-strong hover:bg-app-surface-hover'
              ]"
            >
              <Star :size="12" :fill="store.isFavorite(q.id) ? 'currentColor' : 'none'" />
              <span>{{ store.isFavorite(q.id) ? '已收藏' : '收藏' }}</span>
            </button>

            <button 
              @click.stop="store.toggleMastered(q.id)"
              class="px-2.5 py-1 rounded-xl border text-[11px] font-semibold flex items-center gap-1 transition"
              :class="[
                store.isMastered(q.id)
                  ? 'border-green-500/50 hover:bg-green-500/10 text-green-400 bg-green-500/5'
                  : 'border-app text-app-secondary hover:border-app-strong hover:bg-app-surface-hover'
              ]"
            >
              <Check :size="12" class="stroke-[3]" />
              <span>{{ store.isMastered(q.id) ? '已掌握' : '标为掌握' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
