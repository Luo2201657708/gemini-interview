<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from './store'
import { Terminal, Database, ShieldAlert, Cpu, Heart, CheckCircle2 } from 'lucide-vue-next'
import HomeView from './views/Home.vue'
import CategoryView from './views/Category.vue'

const store = useAppStore()

// State-driven view router
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

const activeComponentStack = computed(() => {
  if (currentCategoryName.value === null) {
    return [
      { name: 'Home.vue', active: true },
      { name: '- QuestionList.vue (Search)', active: false },
      { name: 'store/index.ts', active: true }
    ]
  } else if (currentCategoryName.value === '我的收藏') {
    return [
      { name: 'Category.vue (Favorites)', active: true },
      { name: '- Flashcard.vue / QuestionList.vue', active: true },
      { name: 'store/index.ts', active: true }
    ]
  } else {
    return [
      { name: `Category.vue (${currentCategoryName.value})`, active: true },
      { name: '- QuestionList.vue', active: true },
      { name: '- Flashcard.vue', active: true },
      { name: 'store/index.ts', active: true }
    ]
  }
})
</script>

<template>
  <div class="h-screen w-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden">
    
    <!-- DESKTOP SCREEN COMPANION CHROME (Hides on standard mobile widths) -->
    <div class="hidden lg:flex w-full bg-slate-950 border-b border-slate-900 py-3.5 px-6 shrink-0 justify-between items-center">
      <div class="flex items-center gap-2.5">
        <div class="bg-indigo-600 text-white p-2 rounded-xl scale-95 flex items-center justify-center">
          <Terminal :size="16" />
        </div>
        <div>
          <h1 class="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
            CodeMaster Pro <span class="font-mono text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">v3.0.0</span>
          </h1>
          <p class="text-[10px] text-slate-500 mt-0.5">程序员面试刷题与复习 (Mona-H5 Simulator)</p>
        </div>
      </div>

      <!-- Quick database sizing indicator badge -->
      <div class="bg-slate-900 border border-slate-800 rounded-full px-4 py-1 flex items-center gap-3">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Database Sizing</span>
        <div class="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
          <div class="w-[68%] h-full bg-indigo-500"></div>
        </div>
        <span class="text-[10px] font-mono font-bold text-slate-300">14.8 KB</span>
      </div>
    </div>

    <!-- MAIN GRID CONTAINER -->
    <div class="flex-1 w-full max-w-7xl mx-auto flex lg:flex-row flex-col justify-center items-center lg:p-6 overflow-hidden">
      
      <!-- DESKTOP LEFT INTRO INFO (hides on mobile) -->
      <div class="hidden xl:flex xl:w-[260px] flex-col gap-4 p-4 shrink-0 text-left self-stretch justify-center select-none">
        <div class="space-y-1">
          <h3 class="text-sm font-extrabold text-white">架构师复习法</h3>
          <p class="text-[11px] text-slate-400 leading-relaxed font-light">
            通过手风琴查看文字解答，或开启 3D 闪卡模式激活右脑图像记忆，高强度突击面试考点。
          </p>
        </div>

        <div class="bg-indigo-950/10 border border-indigo-500/10 rounded-2xl p-4 space-y-2">
          <div class="flex items-center gap-1.5 text-xs text-indigo-400 font-extrabold">
            <Cpu :size="14" />
            <span>AI 面试大师</span>
          </div>
          <p class="text-[10px] text-indigo-300 leading-relaxed font-light">
            任意题目下均支持点击 “AI 智能解析”，快速抽取底层考点及高频避坑指南！
          </p>
        </div>

        <div class="text-[10px] text-slate-600 font-mono mt-4 border-t border-slate-900 pt-3">
          PLATFORM: VUE_3 & PINIA<br/>
          RENDERER: MONA_CORE_V1<br/>
          HMR_DISABLE: TRUE
        </div>
      </div>

      <!-- MOBILE APP VIEWPORT / SMARTPHONE SCREEN CONTAINER -->
      <div class="flex-1 w-full flex justify-center items-center overflow-hidden h-full">
        <!-- The Simulator frame: standard smartphone outline on desktop, collapse seamlessly to full-viewport on mobile -->
        <div class="relative w-full h-[100dvh] lg:h-[580px] lg:w-[325px] bg-slate-950 lg:rounded-[36px] lg:border-[8px] lg:border-slate-900 lg:shadow-2xl flex flex-col overflow-hidden">
          
          <!-- Screen Notch (Desktop frame view only) -->
          <div class="hidden lg:block h-5 w-28 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-35 border-x border-b border-slate-800"></div>

          <!-- Pure App Screen Area -->
          <div class="flex-1 flex flex-col p-4 pt-4 lg:pt-8 bg-slate-950 h-full overflow-hidden">
            <!-- Fade slide view transitions -->
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

      <!-- DESKTOP RIGHT PANELS (hides on mobile) -->
      <div class="hidden lg:flex w-[265px] flex-col gap-4 p-4 shrink-0 text-left self-stretch justify-center">
        <!-- Live State (Pinia) -->
        <div class="bg-slate-900/60 rounded-2xl border border-slate-850 p-4.5">
          <div class="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-3">
            <Database :size="13" />
            <span class="uppercase tracking-widest">Pinia Active State</span>
          </div>
          <div class="space-y-2.5 font-mono text-[11px]">
            <div class="flex justify-between items-center py-1 border-b border-slate-850/50">
              <span class="text-slate-500">mastered (已掌握)</span>
              <span class="font-extrabold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/15">
                {{ store.mastered.length }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-slate-850/50">
              <span class="text-slate-500">favorites (收藏)</span>
              <span class="font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15">
                {{ store.favorites.length }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-slate-500">questions_all</span>
              <span class="font-extrabold text-indigo-400">
                {{ store.overallProgress.totalQuestions }}
              </span>
            </div>
          </div>
        </div>

        <!-- Rendering Component stack -->
        <div class="bg-slate-900/60 rounded-2xl border border-slate-850 p-4.5">
          <div class="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-3">
            <Cpu :size="13" />
            <span class="uppercase tracking-widest">Component Tree</span>
          </div>
          <div class="space-y-1.5 font-mono text-[10px]">
            <div 
              v-for="comp in activeComponentStack" 
              :key="comp.name"
              class="px-2 py-1.5 rounded transition"
              :class="[
                comp.active 
                  ? 'bg-slate-950 border border-slate-800 text-indigo-400' 
                  : 'text-slate-600'
              ]"
            >
              {{ comp.name }}
            </div>
          </div>
        </div>

        <!-- Persistence warning footer -->
        <div class="bg-green-500/10 p-3 rounded-2xl border border-green-500/15 flex gap-2.5 items-start">
          <CheckCircle2 class="text-green-400 shrink-0 mt-0.5" :size="12" />
          <p class="text-[9px] leading-relaxed text-slate-400">
            <strong>本地缓存已启用</strong>。收藏数据与掌握记录已被缓存在浏览器 LocalStorage 中，离线测试不丢失状态。
          </p>
        </div>
      </div>

    </div>

    <!-- DESKTOP FOOTER METADATA -->
    <div class="hidden lg:flex w-full bg-slate-950 border-t border-slate-900 py-2.5 px-6 shrink-0 justify-between items-center text-[10px] text-slate-600 font-mono">
      <div>DESIGN: ELEGANT_DARK_V1</div>
      <div>RESOLUTION: 320x568 (SIMULATION: IPHONE_SE_PREVIEW)</div>
      <div class="flex items-center gap-1">
        <span>Made with</span>
        <Heart class="text-rose-500 hover:scale-110 transition-transform" :size="9" fill="currentColor" />
        <span>for Interview Success</span>
      </div>
    </div>

  </div>
</template>

<style>
/* Reset and core scrollbar rules */
body {
  margin: 0;
  padding: 0;
  background-color: #020617;
  overflow: hidden;
}

/* Custom transitions or utilities */
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
