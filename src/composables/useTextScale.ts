import { ref, watch } from 'vue'

export type TextScaleId = 'compact' | 'normal' | 'comfortable'

const STORAGE_KEY = 'codemaster-text-scale'

const textScale = ref<TextScaleId>(readStoredScale())

const ORDER: TextScaleId[] = ['compact', 'normal', 'comfortable']

export const TEXT_SCALE_LABELS: Record<TextScaleId, string> = {
  compact: '紧凑',
  normal: '标准',
  comfortable: '舒适',
}

function readStoredScale(): TextScaleId {
  if (typeof localStorage === 'undefined') return 'normal'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'compact' || saved === 'comfortable') return saved
  return 'normal'
}

function applyTextScale(id: TextScaleId) {
  document.documentElement.setAttribute('data-text-scale', id)
  localStorage.setItem(STORAGE_KEY, id)
}

applyTextScale(textScale.value)

export function useTextScale() {
  function setTextScale(id: TextScaleId) {
    textScale.value = id
  }

  function cycleTextScale() {
    const idx = ORDER.indexOf(textScale.value)
    textScale.value = ORDER[(idx + 1) % ORDER.length]
  }

  watch(textScale, (id) => applyTextScale(id))

  return { textScale, setTextScale, cycleTextScale, TEXT_SCALE_LABELS }
}
