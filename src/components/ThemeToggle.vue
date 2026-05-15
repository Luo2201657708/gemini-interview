<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'

const { theme, toggleTheme } = useTheme()

const label = computed(() =>
  theme.value === 'dark' ? '切换浅色主题' : '切换深色主题'
)
</script>

<template>
  <button
    type="button"
    :title="label"
    :aria-label="label"
    @click="toggleTheme"
    class="theme-toggle shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer"
  >
    <Sun v-if="theme === 'dark'" :size="16" class="text-amber-400" />
    <Moon v-else :size="16" class="text-sky-600" />
  </button>
</template>
