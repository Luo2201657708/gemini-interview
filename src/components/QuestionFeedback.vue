<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { Question } from '../store'
import { MessageSquareWarning, X, Copy, Check } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    question: Question
    categoryName: string
    /** 列表内文字按钮 | 闪卡底部圆形图标按钮 */
    variant?: 'inline' | 'iconOnly'
  }>(),
  { variant: 'inline' }
)

const REASONS = [
  { value: 'wrong_question', label: '题目有误' },
  { value: 'wrong_answer', label: '答案有误' },
  { value: 'ui_style', label: 'App 样式问题' },
  { value: 'other', label: '其他问题' },
] as const

type ReasonValue = (typeof REASONS)[number]['value']

const open = ref(false)
const reason = ref<ReasonValue>('wrong_question')
const detail = ref('')

watch(open, (isOpen) => {
  if (isOpen) {
    reason.value = 'wrong_question'
    detail.value = ''
    window.addEventListener('keydown', onEscape)
  } else {
    window.removeEventListener('keydown', onEscape)
  }
})

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onUnmounted(() => {
  window.removeEventListener('keydown', onEscape)
})

const typeLabel = computed(
  () => REASONS.find((r) => r.value === reason.value)?.label ?? reason.value
)

const payload = computed(() => ({
  schemaVersion: 1,
  kind: 'question_feedback',
  submittedAt: new Date().toISOString(),
  app: {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    language: typeof navigator !== 'undefined' ? navigator.language : '',
  },
  location: {
    category: props.categoryName,
    questionId: props.question.id,
    level: props.question.level ?? null,
  },
  issue: {
    type: reason.value,
    typeLabel: typeLabel.value,
    userComment: detail.value.trim() || null,
  },
  snapshot: {
    question: props.question.question,
    answer: props.question.answer ?? '',
  },
}))

const markdownReport = computed(() => {
  const p = payload.value
  return [
    '## CodeMaster Pro 题目反馈',
    '',
    `- **提交时间**: ${p.submittedAt}`,
    `- **分类**: ${p.location.category}`,
    `- **题目 ID**: \`${p.location.questionId}\``,
    `- **难度标签**: ${p.location.level ?? '—'}`,
    `- **问题类型**: ${p.issue.typeLabel} (\`${p.issue.type}\`)`,
    '',
    '### 用户补充说明',
    p.issue.userComment ?? '_（未填写）_',
    '',
    '### 题目原文',
    '```text',
    p.snapshot.question,
    '```',
    '',
    '### 当前数据中的答案 / 解析',
    '```text',
    p.snapshot.answer || '（空）',
    '```',
    '',
    '<details><summary>环境信息</summary>',
    '',
    '```',
    `UA: ${p.app.userAgent}`,
    `Lang: ${p.app.language}`,
    '```',
    '',
    '</details>',
  ].join('\n')
})

const copied = ref<'json' | 'md' | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | null = null

async function copyPayload(kind: 'json' | 'md') {
  const text = kind === 'json' ? JSON.stringify(payload.value, null, 2) : markdownReport.value
  try {
    await navigator.clipboard.writeText(text)
    copied.value = kind
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = null
    }, 2000)
  } catch {
    // 剪贴板 API 不可用时忽略
  }
}

</script>

<template>
  <div class="inline-flex shrink-0">
    <button
      v-if="variant === 'inline'"
      type="button"
      class="px-2.5 py-1 rounded-xl border text-app-sm-cap font-medium flex items-center gap-1 transition border-app text-app-secondary hover:border-app-strong hover:bg-app-surface-hover"
      title="反馈本题问题"
      @click.stop="open = true"
    >
      <MessageSquareWarning :size="12" />
      <span>反馈</span>
    </button>

    <button
      v-else
      type="button"
      class="w-10 h-10 rounded-full border flex items-center justify-center transition border-app text-app-secondary hover:border-app-strong hover:bg-app-surface-hover"
      title="反馈本题问题"
      @click="open = true"
    >
      <MessageSquareWarning :size="16" />
    </button>

    <Teleport to="body">
      <div
        v-show="open"
        class="fixed inset-0 z-[200] flex items-center justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-[max(1.5rem,env(safe-area-inset-top,0px))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-dialog-title"
        @click.self="open = false"
      >
        <div
          class="absolute inset-0 bg-app-heading/40 backdrop-blur-[2px]"
          @click="open = false"
        />
        <div
          class="relative w-full max-w-lg min-h-0 max-h-[calc(100dvh-max(0.75rem,env(safe-area-inset-top,0px))-max(0.75rem,env(safe-area-inset-bottom,0px)))] sm:max-h-[calc(100dvh-max(1.5rem,env(safe-area-inset-top,0px))-max(1.5rem,env(safe-area-inset-bottom,0px)))] overflow-hidden flex flex-col rounded-2xl border border-app bg-app-surface shadow-2xl text-app"
          @click.stop
        >
          <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-app shrink-0">
            <h2 id="feedback-dialog-title" class="text-sm font-bold text-app-heading">
              题目反馈
            </h2>
            <button
              type="button"
              class="p-1.5 rounded-lg text-app-muted hover:text-app-heading hover:bg-app-surface-hover transition"
              aria-label="关闭"
              @click="open = false"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="overflow-y-auto custom-scrollbar px-4 py-3 space-y-4 flex-1 min-h-0">
            <p class="text-app-xs text-app-secondary leading-relaxed">
              请选择问题类型；若有补充说明请填写下方文本框。生成内容可一键复制，发给维护者或粘贴到
              GitHub Issue / 工单。
            </p>

            <div class="space-y-2">
              <p class="text-app-xs font-semibold text-app-heading">问题原因</p>
              <label
                v-for="opt in REASONS"
                :key="opt.value"
                class="flex items-start gap-2.5 cursor-pointer rounded-xl border px-3 py-2 transition"
                :class="[
                  reason === opt.value
                    ? 'border-app-accent bg-app-accent-bg'
                    : 'border-app hover:border-app-strong bg-app-muted/50',
                ]"
              >
                <input
                  v-model="reason"
                  type="radio"
                  name="feedback-reason"
                  :value="opt.value"
                  class="mt-0.5 accent-[var(--app-accent-solid)]"
                />
                <span class="text-app-xs text-app leading-snug">{{ opt.label }}</span>
              </label>
            </div>

            <div class="space-y-1.5">
              <label class="text-app-xs font-semibold text-app-heading" for="feedback-detail">
                补充说明
                <span class="font-normal text-app-muted">（选填；选择「其他问题」时建议填写）</span>
              </label>
              <textarea
                id="feedback-detail"
                v-model="detail"
                rows="4"
                class="w-full resize-y min-h-[5rem] rounded-xl border border-app bg-app-input text-app text-app-xs px-3 py-2 placeholder:text-app-muted focus:outline-none focus:border-app-accent transition"
                placeholder="例如：期望的正确表述、参考链接、复现步骤等"
              />
            </div>

            <div class="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-app-accent bg-app-accent-bg text-app-accent text-app-xs font-semibold hover:bg-app-accent-bg/80 transition"
                @click="copyPayload('json')"
              >
                <Check v-if="copied === 'json'" :size="14" />
                <Copy v-else :size="14" />
                {{ copied === 'json' ? '已复制 JSON' : '复制 JSON' }}
              </button>
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-app text-app-secondary text-app-xs font-semibold hover:bg-app-surface-hover transition"
                @click="copyPayload('md')"
              >
                <Check v-if="copied === 'md'" :size="14" />
                <Copy v-else :size="14" />
                {{ copied === 'md' ? '已复制 Markdown' : '复制 Markdown' }}
              </button>
            </div>

            <details class="rounded-xl border border-app-subtle bg-app-muted/40">
              <summary
                class="cursor-pointer text-app-xs font-medium text-app-muted px-3 py-2 list-none [&::-webkit-details-marker]:hidden"
              >
                预览 JSON（只读）
              </summary>
              <pre
                class="text-[10px] leading-relaxed font-mono text-app-secondary p-3 pt-0 max-h-40 overflow-auto custom-scrollbar whitespace-pre-wrap break-words"
              >{{ JSON.stringify(payload, null, 2) }}</pre>
            </details>
          </div>

          <div class="px-4 py-3 border-t border-app shrink-0">
            <button
              type="button"
              class="w-full py-2.5 rounded-xl bg-app-accent-solid text-white text-app-xs font-bold hover:opacity-95 transition"
              @click="open = false"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--app-scrollbar);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--app-scrollbar-hover);
}
</style>
