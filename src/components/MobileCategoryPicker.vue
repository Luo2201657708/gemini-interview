<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: string
  options: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/** 与「出题人」单行 input 相同的 box 类名，用于探测高度 */
const FIELD_BOX_CLASS =
  'w-full rounded-xl border border-app bg-app-input text-app text-xs px-3 py-2.5 box-border'

const probeRef = ref<HTMLInputElement | null>(null)
const fieldHeight = ref(0)

function measureFieldHeight() {
  const el = probeRef.value
  fieldHeight.value = el?.offsetHeight ? el.offsetHeight : 0
}

let probeRo: ResizeObserver | null = null

/** 每项高度 = 整张单行输入框高度（可视区域一行一项） */
const slotHeight = computed(() => Math.max(fieldHeight.value, 38))

const scroller = ref<HTMLElement | null>(null)
const programmatic = ref(false)
let raf = 0

const selectedIndex = computed(() => {
  const idx = props.options.indexOf(props.modelValue)
  return idx >= 0 ? idx : 0
})

function scrollToIndex(i: number, behavior: ScrollBehavior = 'auto') {
  const el = scroller.value
  if (!el || !props.options.length) return
  const h = slotHeight.value
  const clamped = Math.min(props.options.length - 1, Math.max(0, i))
  programmatic.value = true
  el.scrollTo({ top: clamped * h, behavior })
  window.setTimeout(() => {
    programmatic.value = false
  }, behavior === 'smooth' ? 320 : 0)
}

function syncFromScroll() {
  const el = scroller.value
  if (!el || !props.options.length || programmatic.value) return
  const h = slotHeight.value
  if (h <= 0) return
  const raw = Math.round(el.scrollTop / h)
  const i = Math.min(props.options.length - 1, Math.max(0, raw))
  const next = props.options[i]
  if (next !== props.modelValue) emit('update:modelValue', next)
}

function onScroll() {
  if (programmatic.value) return
  if (raf) cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    raf = 0
    syncFromScroll()
  })
}

function pick(i: number) {
  const opt = props.options[i]
  if (opt === undefined) return
  emit('update:modelValue', opt)
  scrollToIndex(i, 'smooth')
}

watch(
  () => props.options,
  (opts) => {
    if (!opts.length) return
    if (!props.modelValue.trim()) emit('update:modelValue', opts[0])
    else if (!opts.includes(props.modelValue)) emit('update:modelValue', opts[0])
  },
  { immediate: true }
)

watch(
  () => [props.modelValue, props.options, slotHeight.value] as const,
  async () => {
    await nextTick()
    scrollToIndex(selectedIndex.value, 'auto')
  },
  { flush: 'post' }
)

function onViewportResize() {
  measureFieldHeight()
}

onMounted(() => {
  measureFieldHeight()
  if (probeRef.value) {
    probeRo = new ResizeObserver(() => measureFieldHeight())
    probeRo.observe(probeRef.value)
  }
  window.addEventListener('resize', onViewportResize)
  nextTick(() => {
    measureFieldHeight()
    scrollToIndex(selectedIndex.value, 'auto')
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', onViewportResize)
  probeRo?.disconnect()
  probeRo = null
})
</script>

<template>
  <div class="relative w-full">
    <!-- 离屏探测：高度与 AddQuestions 中单行 input 一致 -->
    <div class="pointer-events-none absolute left-[-9999px] top-0 w-[min(100vw,24rem)] overflow-hidden opacity-0" aria-hidden="true">
      <input ref="probeRef" type="text" readonly tabindex="-1" :class="FIELD_BOX_CLASS" value="测" />
    </div>

    <p class="text-app-2xs text-app-muted -mt-0.5 mb-1.5">上下滑动选择分类，居中即为当前项</p>
    <div
      class="relative w-full rounded-xl border border-app bg-app-input text-app text-xs overflow-hidden"
      role="listbox"
      aria-label="分类选择"
      :style="{ height: `${slotHeight}px` }"
    >
      <div
        class="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 border-y border-app-accent/35 bg-app-accent-bg/15 box-border px-3"
        :style="{ height: `${slotHeight}px` }"
        aria-hidden="true"
      />
      <div
        ref="scroller"
        class="h-full overflow-y-auto overscroll-y-contain snap-y snap-mandatory touch-pan-y"
        style="-webkit-overflow-scrolling: touch"
        @scroll.passive="onScroll"
      >
        <button
          v-for="(opt, i) in options"
          :key="`${opt}-${i}`"
          type="button"
          role="option"
          :aria-selected="i === selectedIndex"
          class="w-full shrink-0 snap-center flex items-center px-3 box-border transition-colors max-w-full text-xs leading-snug"
          :style="{ height: `${slotHeight}px`, minHeight: `${slotHeight}px` }"
          :class="
            i === selectedIndex
              ? 'text-app-accent font-bold'
              : 'text-app-secondary font-medium active:bg-app-muted/40'
          "
          @click="pick(i)"
        >
          <span class="truncate text-center w-full">{{ opt }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
