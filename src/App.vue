<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from './store'
import { Terminal, Database, Cpu, CheckCircle2, Info } from 'lucide-vue-next'
import HomeView from './views/Home.vue'
import CategoryView from './views/Category.vue'
import AddQuestionsView from './views/AddQuestions.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import TextScaleToggle from './components/TextScaleToggle.vue'
import { CATEGORY_RIGHT_RAIL_MEDIA, TW_LG_MEDIA } from './constants/categoryRailMedia'

const store = useAppStore()

type MainView =
  | { kind: 'home' }
  | { kind: 'add-questions' }
  | { kind: 'category'; categoryName: string }

const mainView = ref<MainView>({ kind: 'home' })
/** Desktop/tablet header hidden while category flashcard is in immersive mode */
const categoryFlashcardImmersive = ref(false)

watch(mainView, () => {
  categoryFlashcardImmersive.value = false
})

function handleCategoryFlashcardImmersive(value: boolean) {
  categoryFlashcardImmersive.value = value
}

function handleSelectCategory(catName: string) {
  mainView.value = { kind: 'category', categoryName: catName }
}

function handleViewFavorites() {
  mainView.value = { kind: 'category', categoryName: '我的收藏' }
}

function handleAddQuestions() {
  mainView.value = { kind: 'add-questions' }
}

function handleBackToHome() {
  mainView.value = { kind: 'home' }
}

/** lg breakpoint aligned with Tailwind `lg` (1024px): pure layout + controls that stay lg-only */
const isLgUp = ref(false)
function syncIsLgUp() {
  isLgUp.value =
    typeof window !== 'undefined' && window.matchMedia(TW_LG_MEDIA).matches
}

/**
 * Pinia rail + `#category-toolbar-anchor`: same breakpoints as Category.vue teleport
 * (see CATEGORY_RIGHT_RAIL_MEDIA — avoids “rail visible but teleport off”).
 */
const rightRailVisible = ref(false)
function syncRightRailVisible() {
  rightRailVisible.value =
    typeof window !== 'undefined' && window.matchMedia(CATEGORY_RIGHT_RAIL_MEDIA).matches
}

let lgMq: MediaQueryList | null = null
let rightRailMq: MediaQueryList | null = null

onMounted(() => {
  syncIsLgUp()
  syncRightRailVisible()
  lgMq = window.matchMedia(TW_LG_MEDIA)
  lgMq.addEventListener('change', syncIsLgUp)
  rightRailMq = window.matchMedia(CATEGORY_RIGHT_RAIL_MEDIA)
  rightRailMq.addEventListener('change', syncRightRailVisible)
})

onUnmounted(() => {
  lgMq?.removeEventListener('change', syncIsLgUp)
  rightRailMq?.removeEventListener('change', syncRightRailVisible)
})

/** Side rails hidden; main column centered (phones/sm: unchanged — rails already absent). */
const pureLayoutActive = computed(() => store.pureMode && isLgUp.value)
</script>

<template>
  <div class="h-screen w-screen bg-app text-app font-sans flex flex-col overflow-hidden">
    
    <!-- TABLET / DESKTOP HEADER -->
    <div
      class="hidden md:flex w-full shrink-0 justify-between items-center overflow-hidden bg-app transition-[max-height,opacity,padding,border-width] duration-[520ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
      :class="
        categoryFlashcardImmersive
          ? 'max-h-0 border-b-0 opacity-0 py-0 pointer-events-none'
          : 'max-h-[5.5rem] border-b border-app-subtle opacity-100 py-3.5 px-6'
      "
    >
      <div class="flex items-center gap-2.5">
        <div class="bg-app-accent-solid text-white p-2 rounded-xl scale-95 flex items-center justify-center">
          <Terminal :size="16" />
        </div>
        <div>
          <h1 class="text-sm font-bold text-app-heading tracking-tight flex items-center gap-1.5 leading-none">
            CodeMaster Pro <span class="font-mono text-[9px] bg-app-chrome-badge text-app-accent px-1.5 py-0.5 rounded border border-app-accent">v3.0.0</span>
          </h1>
          <p class="text-[10px] text-app-muted mt-0.5">程序员面试刷题与复习</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="hidden lg:inline-flex items-center rounded-xl border px-3 py-1.5 text-app-2xs font-bold tracking-tight transition cursor-pointer select-none"
          :class="
            store.pureMode
              ? 'border-app-accent bg-app-accent-bg text-app-accent'
              : 'border-app text-app-secondary hover:border-app-strong hover:text-app-heading bg-app-surface'
          "
          :aria-pressed="store.pureMode"
          title="隐藏左右侧栏，居中主学习区（≥1024px 有效）"
          @click="store.togglePureMode()"
        >
          纯净模式
        </button>
        <TextScaleToggle />
        <ThemeToggle />
      </div>
    </div>

    <!-- MOBILE: toggles on home (category page has its own toolbar) -->
    <div
      v-if="mainView.kind === 'home' || mainView.kind === 'add-questions'"
      class="md:hidden fixed top-3 right-3 z-50 flex items-center gap-2"
    >
      <TextScaleToggle />
      <ThemeToggle />
    </div>

    <div
      class="flex-1 w-full mx-auto flex justify-stretch items-stretch min-h-0 overflow-hidden"
      :class="[
        rightRailVisible
          ? 'flex-row gap-4 px-5 py-4'
          : 'flex-col md:px-3 md:py-2 lg:gap-4 lg:px-5 lg:py-4',
        pureLayoutActive ? 'max-w-5xl xl:max-w-6xl' : 'max-w-[90rem]',
      ]"
    >
      
      <div
        class="flex-col gap-4 p-3 shrink-0 text-left self-start justify-start select-none pt-2 xl:w-[240px] 2xl:w-[260px] order-1"
        :class="pureLayoutActive ? 'hidden' : 'hidden xl:flex'"
      >
        <div class="space-y-1">
          <h3 class="text-sm font-extrabold text-app-heading">架构师复习法</h3>
          <p class="text-[11px] text-app-secondary leading-relaxed font-light">
            通过手风琴查看文字解答，或开启 3D 闪卡模式激活右脑图像记忆，高强度突击面试考点。
          </p>
        </div>

        <div class="bg-app-info border border-app-info rounded-2xl p-4 space-y-2">
          <div class="flex items-center gap-1.5 text-xs text-app-accent font-extrabold">
            <Cpu :size="14" />
            <span>AI 面试大师</span>
          </div>
          <p class="text-[10px] text-app-info leading-relaxed font-light">
            任意题目下均支持点击 “AI 智能解析”，快速抽取底层考点及高频避坑指南！
          </p>
        </div>

        <div class="text-[10px] text-app-faint font-mono mt-4 border-t border-app-subtle pt-3">
          PLATFORM: VUE_3 & PINIA<br/>
          RENDERER: MONA_CORE_V1<br/>
          HMR_DISABLE: TRUE
        </div>
      </div>

      <!-- DOM before main column so #category-toolbar-anchor exists when CategoryView enables Teleport -->
      <div
        class="flex-col gap-4 p-3 xl:p-4 shrink-0 text-left self-start justify-start pt-2 w-[220px] xl:w-[265px] order-3"
        :class="
          pureLayoutActive || !rightRailVisible
            ? 'hidden'
            : 'flex flex-col'
        "
      >
        <!-- Landscape lg+: Category.vue teleports mode/filter toolbar here (above Pinia). -->
        <div
          v-if="mainView.kind === 'category'"
          id="category-toolbar-anchor"
          class="min-w-0 w-full shrink-0 flex flex-col"
        />

        <div class="bg-app-panel rounded-2xl border border-app p-4.5">
          <div class="flex items-center gap-1.5 text-app-secondary text-xs font-bold mb-3">
            <Database :size="13" />
            <span class="uppercase tracking-widest">Pinia 当前状态</span>
          </div>
          <div class="space-y-2.5 font-mono text-[11px]">
            <div class="flex justify-between items-center py-1 border-b border-app/50">
              <span class="text-app-muted">mastered (已掌握)</span>
              <span class="font-extrabold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/15">
                {{ store.mastered.length }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-app/50">
              <span class="text-app-muted">favorites (收藏)</span>
              <span class="font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15">
                {{ store.favorites.length }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-app-muted">questions_all</span>
              <span class="font-extrabold text-app-accent">
                {{ store.overallProgress.totalQuestions }}
              </span>
            </div>
          </div>
        </div>

        <div
          class="bg-app-panel rounded-2xl border border-app-accent p-3.5 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1.5 items-start"
        >
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-app-accent-bg text-app-accent row-start-1"
          >
            <Info :size="15" :stroke-width="2" />
          </div>
          <p class="text-app-xs font-bold text-app-heading tracking-tight leading-tight min-w-0 pt-1">
            数据说明
          </p>
          <p
            class="col-span-2 text-app-xs leading-[1.65] text-app-secondary antialiased [text-wrap:pretty]"
          >
            本站题目与解析均为个人整理，仅供参考，不保证完全准确，疏漏在所难免。若你发现错漏，或有好的题目与解析愿意分享，欢迎纠错与补充，非常感谢。
          </p>
        </div>

        <div class="bg-green-500/10 p-3 rounded-2xl border border-green-500/15 flex gap-2.5 items-start">
          <CheckCircle2 class="text-green-400 shrink-0 mt-0.5" :size="12" />
          <p class="text-[9px] leading-relaxed text-app-secondary">
            <strong>本地缓存已启用</strong>。收藏数据与掌握记录已被缓存在浏览器 LocalStorage 中，离线测试不丢失状态。
          </p>
        </div>
      </div>

      <div
        class="flex-1 w-full min-w-0 flex items-stretch overflow-hidden h-full min-h-0 order-2"
        :class="pureLayoutActive ? 'max-w-4xl xl:max-w-5xl 2xl:max-w-[56rem] mx-auto' : ''"
      >
        <div class="app-main relative w-full h-[100dvh] md:h-full md:min-h-0 bg-app flex flex-col overflow-hidden">
          <div
            class="app-main-inner flex-1 flex flex-col bg-app h-full overflow-hidden min-h-0 transition-[padding] duration-[520ms] ease-[cubic-bezier(0.33,1,0.68,1)] p-4 md:p-4 lg:p-5"
            :class="
              categoryFlashcardImmersive
                ? 'pt-2 md:pt-2 lg:pt-3'
                : 'pt-4 md:pt-4 lg:pt-5'
            "
          >
            <KeepAlive>
              <HomeView
                v-if="mainView.kind === 'home'"
                @select-category="handleSelectCategory"
                @view-favorites="handleViewFavorites"
                @add-questions="handleAddQuestions"
              />
              <AddQuestionsView
                v-else-if="mainView.kind === 'add-questions'"
                @back="handleBackToHome"
              />
              <CategoryView
                v-else
                :category-name="mainView.categoryName"
                @back="handleBackToHome"
                @flashcard-immersive="handleCategoryFlashcardImmersive"
              />
            </KeepAlive>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<style>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
