<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  options: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelTop = ref(0)
const panelLeft = ref(0)
const panelWidth = ref(0)

/** 单行选项视觉高度（与 max-h 联动）：约等于 py-2.5 + text-xs 一行 */
const ROW_REM = 2.625

function updatePanelRect() {
  const el = triggerRef.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const gap = 4
  panelLeft.value = r.left
  panelWidth.value = r.width
  let top = r.bottom + gap
  const panelMaxPx = ROW_REM * 3 * 16
  const viewport = window.visualViewport?.height ?? window.innerHeight
  if (top + panelMaxPx > viewport - 8) {
    top = Math.max(8, r.top - gap - panelMaxPx)
  }
  panelTop.value = top
}

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function pick(value: string) {
  emit('update:modelValue', value)
  close()
}

function onDocPointerDown(ev: PointerEvent) {
  const t = ev.target as Node
  if (triggerRef.value?.contains(t)) return
  if (panelRef.value?.contains(t)) return
  close()
}

function onKey(ev: KeyboardEvent) {
  if (ev.key === 'Escape') close()
}

watch(open, async (v) => {
  if (v) {
    await nextTick()
    updatePanelRect()
    window.addEventListener('scroll', updatePanelRect, true)
    window.addEventListener('resize', updatePanelRect)
    visualViewport?.addEventListener('resize', updatePanelRect)
    document.addEventListener('pointerdown', onDocPointerDown, true)
    document.addEventListener('keydown', onKey)
  } else {
    window.removeEventListener('scroll', updatePanelRect, true)
    window.removeEventListener('resize', updatePanelRect)
    visualViewport?.removeEventListener('resize', updatePanelRect)
    document.removeEventListener('pointerdown', onDocPointerDown, true)
    document.removeEventListener('keydown', onKey)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', updatePanelRect, true)
  window.removeEventListener('resize', updatePanelRect)
  visualViewport?.removeEventListener('resize', updatePanelRect)
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="triggerRef" class="relative w-full">
    <button
      type="button"
      class="w-full rounded-xl border border-app bg-app-input text-app text-xs px-3 py-2.5 focus:outline-none focus:border-app-accent cursor-pointer flex items-center gap-2 text-left"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click.stop="toggle()"
    >
      <span
        class="min-w-0 flex-1 truncate leading-snug"
        :class="!props.modelValue.trim() ? 'text-app-muted' : ''"
      >
        {{ props.modelValue.trim() ? props.modelValue : '请选择分类' }}
      </span>
      <ChevronDown
        :size="16"
        class="shrink-0 text-app-muted transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="panelRef"
        class="fixed z-[200] rounded-xl border border-app bg-app-input shadow-lg overflow-y-auto overscroll-contain custom-scrollbar py-1"
        :style="{
          top: `${panelTop}px`,
          left: `${panelLeft}px`,
          width: `${panelWidth}px`,
          maxHeight: `calc(3 * ${ROW_REM}rem)`,
        }"
        role="listbox"
        @click.stop
      >
        <button
          v-for="(opt, idx) in props.options"
          :key="`${opt}-${idx}`"
          type="button"
          role="option"
          class="w-full text-left px-3 py-2.5 text-xs leading-snug transition-colors truncate hover:bg-app-muted/80 focus:outline-none focus-visible:bg-app-muted"
          :class="
            opt === props.modelValue
              ? 'bg-app-accent-bg text-app-accent font-semibold'
              : 'text-app'
          "
          @click="pick(opt)"
        >
          {{ opt }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgb(148 163 184 / 0.35);
  border-radius: 999px;
}
.custom-scrollbar {
  scrollbar-width: thin;
}
</style>
