import { ref, watch } from 'vue'

export type TextScaleId = 'compact' | 'normal' | 'comfortable' | 'large' | 'xlarge'

const STORAGE_KEY = 'codemaster-text-scale'
const WIDE_VIEWPORT_MQ = '(min-width: 768px)'

const textScale = ref<TextScaleId>(readStoredScale())
const isWideViewport = ref(false)

const MOBILE_ORDER: TextScaleId[] = ['compact', 'normal', 'comfortable']
const DESKTOP_ORDER: TextScaleId[] = ['compact', 'normal', 'comfortable', 'large', 'xlarge']

export const TEXT_SCALE_LABELS: Record<TextScaleId, string> = {
  compact: '紧凑',
  normal: '标准',
  comfortable: '舒适',
  large: '较大',
  xlarge: '超大',
}

export const TEXT_SCALE_SHORTS: Record<TextScaleId, string> = {
  compact: '小',
  normal: '中',
  comfortable: '大',
  large: '特',
  xlarge: '超',
}

export const MOBILE_SCALE_OPTIONS: TextScaleId[] = [...MOBILE_ORDER]
export const DESKTOP_SCALE_OPTIONS: TextScaleId[] = [...DESKTOP_ORDER]

function readStoredScale(): TextScaleId {
  if (typeof localStorage === 'undefined') return 'normal'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (
    saved === 'compact' ||
    saved === 'comfortable' ||
    saved === 'large' ||
    saved === 'xlarge'
  ) {
    return saved
  }
  return 'normal'
}

function applyTextScale(id: TextScaleId) {
  document.documentElement.setAttribute('data-text-scale', id)
  localStorage.setItem(STORAGE_KEY, id)
}

/** On mobile, large/xlarge map to the top (comfortable) tier for UI and CSS. */
export function mobileEffectiveScale(id: TextScaleId): TextScaleId {
  if (id === 'large' || id === 'xlarge') return 'comfortable'
  return id
}

export function isScaleOptionActive(
  current: TextScaleId,
  optionId: TextScaleId,
  wide: boolean
): boolean {
  if (wide) return current === optionId
  return mobileEffectiveScale(current) === optionId
}

function syncViewport(matches: boolean) {
  isWideViewport.value = matches
}

if (typeof window !== 'undefined') {
  const mql = window.matchMedia(WIDE_VIEWPORT_MQ)
  syncViewport(mql.matches)
  mql.addEventListener('change', (e) => syncViewport(e.matches))
}

applyTextScale(textScale.value)

export function useTextScale() {
  function setTextScale(id: TextScaleId) {
    textScale.value = id
  }

  function cycleTextScale() {
    const order = isWideViewport.value ? DESKTOP_ORDER : MOBILE_ORDER
    const idx = order.indexOf(
      isWideViewport.value ? textScale.value : mobileEffectiveScale(textScale.value)
    )
    const next = order[(idx + 1) % order.length]
    textScale.value = next
  }

  watch(textScale, (id) => applyTextScale(id))

  return {
    textScale,
    isWideViewport,
    setTextScale,
    cycleTextScale,
    TEXT_SCALE_LABELS,
    TEXT_SCALE_SHORTS,
    MOBILE_SCALE_OPTIONS,
    DESKTOP_SCALE_OPTIONS,
    isScaleOptionActive,
    mobileEffectiveScale,
  }
}
