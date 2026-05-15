<script setup lang="ts">
import { computed } from 'vue'
import { Type } from 'lucide-vue-next'
import {
  useTextScale,
  type TextScaleId,
  TEXT_SCALE_LABELS,
  TEXT_SCALE_SHORTS,
} from '../composables/useTextScale'

const {
  textScale,
  isWideViewport,
  setTextScale,
  MOBILE_SCALE_OPTIONS,
  DESKTOP_SCALE_OPTIONS,
  isScaleOptionActive,
} = useTextScale()

const options = computed(() => {
  const ids = isWideViewport.value ? DESKTOP_SCALE_OPTIONS : MOBILE_SCALE_OPTIONS
  return ids.map((id: TextScaleId) => ({
    id,
    short: TEXT_SCALE_SHORTS[id],
  }))
})

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
      :aria-pressed="isScaleOptionActive(textScale, opt.id, isWideViewport)"
      @click="setTextScale(opt.id)"
      class="text-scale-toggle__btn relative py-1 rounded-lg text-app-2xs font-bold transition-colors cursor-pointer"
      :class="[
        isWideViewport ? 'px-1.5 min-w-[1.5rem]' : 'px-2 min-w-[1.75rem]',
        isScaleOptionActive(textScale, opt.id, isWideViewport)
          ? 'text-scale-toggle__btn--active'
          : '',
      ]"
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
