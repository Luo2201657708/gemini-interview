<script setup lang="ts">
import { computed } from 'vue'
import { Type } from 'lucide-vue-next'
import { useTextScale, type TextScaleId, TEXT_SCALE_LABELS } from '../composables/useTextScale'

const { textScale, setTextScale } = useTextScale()

const options: { id: TextScaleId; short: string }[] = [
  { id: 'compact', short: '小' },
  { id: 'normal', short: '中' },
  { id: 'comfortable', short: '大' },
]

const groupLabel = computed(
  () => `字号：${TEXT_SCALE_LABELS[textScale.value]}，点击切换`
)
</script>

<template>
  <div
    role="group"
    :aria-label="groupLabel"
    class="text-scale-toggle shrink-0 flex items-center rounded-xl border p-0.5 gap-0.5"
    :title="groupLabel"
  >
    <button
      v-for="opt in options"
      :key="opt.id"
      type="button"
      :aria-label="`字号${TEXT_SCALE_LABELS[opt.id]}`"
      :aria-pressed="textScale === opt.id"
      @click="setTextScale(opt.id)"
      class="text-scale-toggle__btn relative px-2 py-1 rounded-lg text-app-2xs font-bold transition-colors cursor-pointer min-w-[1.75rem]"
      :class="textScale === opt.id ? 'text-scale-toggle__btn--active' : ''"
    >
      <span class="relative z-10">{{ opt.short }}</span>
    </button>
    <Type
      :size="11"
      class="text-app-muted shrink-0 mx-0.5 hidden min-[360px]:block"
      aria-hidden="true"
    />
  </div>
</template>
