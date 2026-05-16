<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from './store'
import { Terminal, Database, Cpu, CheckCircle2, Info } from 'lucide-vue-next'
import HomeView from './views/Home.vue'
import CategoryView from './views/Category.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import TextScaleToggle from './components/TextScaleToggle.vue'

const store = useAppStore()

const currentCategoryName = ref<string | null>(null)

function handleSelectCategory(catName: string) {
  currentCategoryName.value = catName
}

function handleViewFavorites() {
  currentCategoryName.value = '我的收藏'
}

function handleBackToHome() {
  currentCategoryName.value = null
}
</script>

<template>
  <div class="h-screen w-screen bg-app text-app font-sans flex flex-col overflow-hidden">
    
    <!-- TABLET / DESKTOP HEADER -->
    <div class="hidden md:flex w-full bg-app border-b border-app-subtle py-3.5 px-6 shrink-0 justify-between items-center">
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
        <TextScaleToggle />
        <ThemeToggle />
      </div>
    </div>

    <!-- MOBILE: toggles on home (category page has its own toolbar) -->
    <div
      v-if="currentCategoryName === null"
      class="md:hidden fixed top-3 right-3 z-50 flex items-center gap-2"
    >
      <TextScaleToggle />
      <ThemeToggle />
    </div>

    <div class="flex-1 w-full max-w-[90rem] mx-auto flex lg:flex-row flex-col justify-stretch items-stretch min-h-0 overflow-hidden md:px-3 md:py-2 lg:gap-4 lg:px-5 lg:py-4">
      
      <div class="hidden xl:flex xl:w-[240px] 2xl:w-[260px] flex-col gap-4 p-3 shrink-0 text-left self-start justify-start select-none pt-2">
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

      <div class="flex-1 w-full min-w-0 flex items-stretch overflow-hidden h-full min-h-0">
        <div class="app-main relative w-full h-[100dvh] md:h-full md:min-h-0 bg-app flex flex-col overflow-hidden">
          <div class="app-main-inner flex-1 flex flex-col p-4 pt-4 md:p-4 md:pt-4 lg:p-5 lg:pt-5 bg-app h-full overflow-hidden min-h-0">
            <KeepAlive>
              <HomeView 
                v-if="currentCategoryName === null"
                @selectCategory="handleSelectCategory"
                @viewFavorites="handleViewFavorites"
              />
              <CategoryView 
                v-else
                :categoryName="currentCategoryName"
                @back="handleBackToHome"
              />
            </KeepAlive>
          </div>
        </div>
      </div>

      <div class="hidden lg:flex lg:w-[220px] xl:w-[265px] flex-col gap-4 p-3 xl:p-4 shrink-0 text-left self-start justify-start pt-2">
        <div class="bg-app-panel rounded-2xl border border-app p-4.5">
          <div class="flex items-center gap-1.5 text-app-secondary text-xs font-bold mb-3">
            <Database :size="13" />
            <span class="uppercase tracking-widest">Pinia Active State</span>
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
