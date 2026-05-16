<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../store'
import { ArrowLeft, Plus, Trash2, Download, FileText, Copy, Check } from 'lucide-vue-next'
import MobileCategoryPicker from '../components/MobileCategoryPicker.vue'
import DesktopCategorySelect from '../components/DesktopCategorySelect.vue'

const STORE_LEVELS = ['必问', '重点', '了解'] as const
type Level = (typeof STORE_LEVELS)[number]

interface DraftRow {
  category: string
  author: string
  question: string
  answer: string
  level: Level
}

const emit = defineEmits<{
  (e: 'back'): void
}>()

const store = useAppStore()

const categoryOptions = computed(() => store.questionBank.map((c) => c.category))

const isMobile = ref(false)
let mq: MediaQueryList | null = null
function syncMobileFlag() {
  isMobile.value = mq?.matches ?? false
}

onMounted(() => {
  mq = window.matchMedia('(max-width: 639px)')
  syncMobileFlag()
  mq.addEventListener('change', syncMobileFlag)
})

onUnmounted(() => {
  mq?.removeEventListener('change', syncMobileFlag)
})

function emptyRow(): DraftRow {
  return { category: '', author: '', question: '', answer: '', level: '重点' }
}

const rows = ref<DraftRow[]>([emptyRow()])

function addRow() {
  rows.value.push(emptyRow())
}

function removeRow(i: number) {
  if (rows.value.length <= 1) {
    rows.value = [emptyRow()]
    return
  }
  rows.value.splice(i, 1)
}

function rowValid(r: DraftRow): boolean {
  return (
    r.category.trim().length > 0 &&
    r.author.trim().length > 0 &&
    r.question.trim().length > 0 &&
    r.answer.trim().length > 0 &&
    STORE_LEVELS.includes(r.level)
  )
}

const validRows = computed(() => rows.value.filter(rowValid))

const validationErrors = computed(() => {
  const errs: Record<number, string> = {}
  rows.value.forEach((r, i) => {
    if (rowValid(r)) return
    const missing: string[] = []
    if (!r.category.trim()) missing.push('分类')
    if (!r.author.trim()) missing.push('出题人')
    if (!r.question.trim()) missing.push('题目')
    if (!r.answer.trim()) missing.push('答案')
    errs[i] = `请填写：${missing.join('、')}`
  })
  return errs
})

function buildMarkdown(): string {
  const ts = new Date().toISOString()
  const lines: string[] = [
    '# 自建题库导出',
    '',
    `> 导出时间（UTC）：${ts}`,
    `> 共 ${validRows.value.length} 题`,
    '',
  ]

  validRows.value.forEach((r, i) => {
    lines.push(`## ${i + 1}. ${r.category.trim()}`, '')
    lines.push(`- **出题人**：${r.author.trim()}`)
    lines.push(`- **掌握程度**：${r.level}`)
    lines.push('- **题目**')
    lines.push('')
    lines.push('```text')
    lines.push(r.question.trim())
    lines.push('```')
    lines.push('')
    lines.push('- **答案**')
    lines.push('')
    lines.push('```text')
    lines.push(r.answer.trim())
    lines.push('```')
    lines.push('')
    lines.push('---')
    lines.push('')
  })

  return lines.join('\n').replace(/\n---\n\n$/, '\n')
}

const mdText = computed(() =>
  validRows.value.length ? buildMarkdown() : ''
)

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

async function copyMd() {
  if (!mdText.value) return
  try {
    await navigator.clipboard.writeText(mdText.value)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    /* ignore */
  }
}

function downloadMd() {
  if (!mdText.value) return
  const blob = new Blob([mdText.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safe = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  a.href = url
  a.download = `interview-notes-${safe}.md`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
    <div class="shrink-0 border-b border-app-subtle mb-3 pb-3 flex items-center gap-2">
      <button
        type="button"
        class="shrink-0 w-8 h-8 rounded-full bg-app-surface border border-app flex items-center justify-center text-app-secondary hover:text-app-heading transition-colors cursor-pointer"
        aria-label="返回首页"
        @click="emit('back')"
      >
        <ArrowLeft :size="16" />
      </button>
      <div class="min-w-0 flex-1">
        <h2 class="text-sm font-bold text-app-heading tracking-tight truncate">添加题目</h2>
        <p class="text-app-2xs text-app-muted mt-0.5">
          必填：分类、出题人、题目、答案、掌握程度（横向滑动或点选）。可追加多题后导出 Markdown。
        </p>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar space-y-4 pb-8">
      <div
        v-for="(row, i) in rows"
        :key="i"
        class="rounded-2xl border border-app bg-app-muted/50 p-4 space-y-3"
        :class="validationErrors[i] ? 'border-rose-400/40' : ''"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-app-xs font-mono text-app-muted">题目 #{{ i + 1 }}</span>
          <button
            type="button"
            class="p-1.5 rounded-lg text-app-muted hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
            :title="rows.length > 1 ? '删除本题' : '清空本题'"
            @click="removeRow(i)"
          >
            <Trash2 :size="14" />
          </button>
        </div>

        <p v-if="validationErrors[i]" class="text-app-2xs text-rose-400 font-medium">
          {{ validationErrors[i] }}
        </p>

        <div class="space-y-2">
          <label class="block text-app-2xs font-bold text-app-secondary uppercase tracking-wide"
            >分类 <span class="text-rose-400">*</span></label
          >
          <MobileCategoryPicker
            v-if="isMobile && categoryOptions.length"
            v-model="row.category"
            :options="categoryOptions"
          />
          <template v-else>
            <DesktopCategorySelect
              v-if="categoryOptions.length"
              v-model="row.category"
              :options="categoryOptions"
            />
            <input
              v-else
              v-model="row.category"
              type="text"
              class="w-full rounded-xl border border-app bg-app-input text-app text-xs px-3 py-2.5 focus:outline-none focus:border-app-accent"
              placeholder="输入分类名称"
            />
          </template>
        </div>

        <div class="space-y-2">
          <label class="block text-app-2xs font-bold text-app-secondary uppercase tracking-wide"
            >出题人 <span class="text-rose-400">*</span></label
          >
          <input
            v-model="row.author"
            type="text"
            autocomplete="name"
            class="w-full rounded-xl border border-app bg-app-input text-app text-xs px-3 py-2.5 focus:outline-none focus:border-app-accent"
            placeholder="昵称或署名"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-app-2xs font-bold text-app-secondary uppercase tracking-wide"
            >掌握程度 <span class="text-rose-400">*</span></label
          >
          <p class="text-app-2xs text-app-muted -mt-0.5 mb-0.5">左右滑动选择，或直接点按</p>
          <div
            class="level-swiper flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1 scroll-smooth touch-pan-x"
            style="-webkit-overflow-scrolling: touch"
          >
            <button
              v-for="lv in STORE_LEVELS"
              :key="lv"
              type="button"
              class="snap-center shrink-0 min-w-[30%] max-w-[11rem] rounded-xl border px-3 py-2.5 text-center text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent"
              :class="
                row.level === lv
                  ? 'border-app-accent bg-app-accent-bg text-app-accent shadow-sm'
                  : 'border-app bg-app-surface text-app-secondary active:scale-[0.98]'
              "
              @click="row.level = lv"
            >
              {{ lv }}
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-app-2xs font-bold text-app-secondary uppercase tracking-wide"
            >题目 <span class="text-rose-400">*</span></label
          >
          <textarea
            v-model="row.question"
            rows="3"
            class="w-full resize-y rounded-xl border border-app bg-app-input text-app text-xs px-3 py-2.5 focus:outline-none focus:border-app-accent whitespace-pre-wrap"
            placeholder="题干内容"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-app-2xs font-bold text-app-secondary uppercase tracking-wide"
            >答案 <span class="text-rose-400">*</span></label
          >
          <textarea
            v-model="row.answer"
            rows="5"
            class="w-full resize-y rounded-xl border border-app bg-app-input text-app text-xs px-3 py-2.5 focus:outline-none focus:border-app-accent whitespace-pre-wrap"
            placeholder="参考答案或解析"
          />
        </div>
      </div>

      <button
        type="button"
        class="w-full py-3 rounded-2xl border border-dashed border-app-strong text-app-secondary hover:text-app-accent hover:border-app-accent hover:bg-app-accent-bg/30 flex items-center justify-center gap-2 text-app-xs font-bold transition"
        @click="addRow"
      >
        <Plus :size="16" />
        再添加一题
      </button>

      <div class="rounded-2xl border border-app-accent bg-app-accent-bg/40 p-4 space-y-3">
        <div class="flex items-center gap-2 text-app-xs font-bold text-app-heading">
          <FileText :size="14" class="text-app-accent" />
          导出 Markdown
        </div>
        <p class="text-app-2xs text-app-muted leading-relaxed">
          仅导出入已通过必填校验的
          <span class="font-mono text-app-accent">{{ validRows.length }}</span>
          道题。可复制到剪贴板或下载 .md 文件，便于你合并进仓库或笔记。
        </p>
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-app-accent-solid text-white text-app-xs font-bold disabled:opacity-40 disabled:pointer-events-none"
            :disabled="!validRows.length"
            @click="copyMd"
          >
            <Check v-if="copied" :size="14" />
            <Copy v-else :size="14" />
            {{ copied ? '已复制' : '复制 Markdown' }}
          </button>
          <button
            type="button"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-app bg-app-surface text-app-secondary text-app-xs font-bold hover:bg-app-surface-hover disabled:opacity-40 disabled:pointer-events-none"
            :disabled="!validRows.length"
            @click="downloadMd"
          >
            <Download :size="14" />
            下载 .md
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.level-swiper {
  scrollbar-width: none;
}
.level-swiper::-webkit-scrollbar {
  display: none;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>
