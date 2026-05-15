import { ref, watch } from 'vue'

export type ThemeId = 'dark' | 'light'

const STORAGE_KEY = 'codemaster-theme'

const theme = ref<ThemeId>(readStoredTheme())

function readStoredTheme(): ThemeId {
  if (typeof localStorage === 'undefined') return 'dark'
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'light' ? 'light' : 'dark'
}

function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id)
  localStorage.setItem(STORAGE_KEY, id)
}

applyTheme(theme.value)

export function useTheme() {
  function setTheme(id: ThemeId) {
    theme.value = id
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watch(theme, (id) => applyTheme(id))

  return { theme, setTheme, toggleTheme }
}
