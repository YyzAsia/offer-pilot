<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import { useRoute } from 'vue-router'
import {
  DataAnalysis,
  DocumentChecked,
  List,
  Menu as MenuIcon,
  Promotion,
  TrendCharts,
} from '@element-plus/icons-vue'
import { useRoadmapStore } from '@/stores/roadmap'

const route = useRoute()
const roadmapStore = useRoadmapStore()
const drawerVisible = ref(false)
const learningProgress = computed(
  () => roadmapStore.averageProgress,
)

onMounted(() => {
  roadmapStore.hydrate()
})

const navigationItems = [
  {
    label: '数据总览',
    path: '/dashboard',
    icon: DataAnalysis,
  },
  {
    label: '数据洞察',
    path: '/insights',
    icon: TrendCharts,
  },
  {
    label: 'JD 智能分析',
    path: '/analyzer',
    icon: DocumentChecked,
  },
  {
    label: '学习路线',
    path: '/roadmap',
    icon: List,
  },
  {
    label: '投递管理',
    path: '/applications',
    icon: Promotion,
  },
]

const currentTitle = computed(() => {
  return typeof route.meta.title === 'string' ? route.meta.title : 'OfferPilot'
})

const currentDate = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
}).format(new Date())

function closeDrawer() {
  drawerVisible.value = false
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">O</div>

        <div>
          <strong>OfferPilot</strong>
          <span>实习求职作战台</span>
        </div>
      </div>

      <nav class="navigation" aria-label="主导航">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="navigation-item"
          :class="{ active: route.path === item.path }"
        >
          <el-icon :size="20">
            <component :is="item.icon" />
          </el-icon>

          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-tip">
        <span class="tip-label">
            学习路线
        </span>

        <strong>
            {{
            roadmapStore.activeCount > 0
                ? `还有 ${roadmapStore.activeCount} 个任务未完成`
                : '创建你的第一个学习任务'
            }}
        </strong>

        <div class="tip-progress">
            <span
            :style="{
                width: `${learningProgress}%`,
            }"
            ></span>
        </div>

        <small>
            平均进度 {{ learningProgress }}%
        </small>
      </div>
    </aside>

    <section class="main-panel">
      <header class="topbar">
        <button
          class="mobile-menu-button"
          type="button"
          aria-label="打开导航菜单"
          @click="drawerVisible = true"
        >
          <el-icon :size="22">
            <MenuIcon />
          </el-icon>
        </button>

        <div class="page-heading">
          <span>{{ currentDate }}</span>
          <h1>{{ currentTitle }}</h1>
        </div>

        <div class="user-chip">
          <div class="user-avatar">同</div>

          <div>
            <strong>演示用户</strong>
            <span>前端实习冲刺中</span>
          </div>
        </div>
      </header>

      <main class="page-content">
        <RouterView />
      </main>
    </section>

    <el-drawer
      v-model="drawerVisible"
      title="OfferPilot"
      direction="ltr"
      size="280px"
    >
      <nav class="drawer-navigation">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="navigation-item"
          :class="{ active: route.path === item.path }"
          @click="closeDrawer"
        >
          <el-icon :size="20">
            <component :is="item.icon" />
          </el-icon>

          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </el-drawer>
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar {
  position: sticky;
  top: 0;

  display: flex;
  flex-direction: column;

  height: 100vh;
  padding: 28px 20px;

  color: #ffffff;
  background:
    radial-gradient(circle at 20% 10%, rgba(124, 117, 255, 0.8), transparent 28%),
    linear-gradient(180deg, #252244 0%, #19172e 100%);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 38px;
}

.brand-mark {
  display: grid;
  place-items: center;

  width: 42px;
  height: 42px;

  font-size: 22px;
  font-weight: 800;

  background: linear-gradient(135deg, #8b83ff, #635bff);
  border-radius: 13px;
  box-shadow: 0 10px 24px rgba(99, 91, 255, 0.38);
}

.brand strong,
.brand span {
  display: block;
}

.brand strong {
  font-size: 17px;
}

.brand span {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
}

.navigation,
.drawer-navigation {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.navigation-item {
  display: flex;
  align-items: center;
  gap: 12px;

  min-height: 46px;
  padding: 0 14px;

  color: rgba(255, 255, 255, 0.68);
  font-size: 14px;
  font-weight: 600;

  border-radius: 12px;
  transition:
    color 0.2s,
    background-color 0.2s,
    transform 0.2s;
}

.navigation-item:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(2px);
}

.navigation-item.active {
  color: #ffffff;
  background: rgba(126, 118, 255, 0.25);
}

.sidebar-tip {
  margin-top: auto;
  padding: 18px;

  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.sidebar-tip strong,
.sidebar-tip small {
  display: block;
}

.tip-label {
  color: #aaa5ff;
  font-size: 12px;
  font-weight: 700;
}

.sidebar-tip strong {
  margin-top: 7px;
  font-size: 14px;
  line-height: 1.5;
}

.tip-progress {
  height: 7px;
  margin: 16px 0 9px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}

.tip-progress span {
  display: block;
  width: 18%;
  height: 100%;
  background: #8b83ff;
  border-radius: inherit;
}

.sidebar-tip small {
  color: rgba(255, 255, 255, 0.52);
}

.main-panel {
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 20px;

  min-height: 88px;
  padding: 16px 32px;

  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
}

.page-heading {
  flex: 1;
}

.page-heading span {
  color: var(--text-light);
  font-size: 12px;
}

.page-heading h1 {
  margin: 3px 0 0;
  font-size: 23px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  display: grid;
  place-items: center;

  width: 39px;
  height: 39px;

  color: var(--primary-color);
  font-weight: 800;

  background: var(--primary-light);
  border-radius: 12px;
}

.user-chip strong,
.user-chip span {
  display: block;
}

.user-chip strong {
  font-size: 13px;
}

.user-chip span {
  margin-top: 2px;
  color: var(--text-light);
  font-size: 11px;
}

.mobile-menu-button {
  display: none;
  align-items: center;
  justify-content: center;

  width: 42px;
  height: 42px;

  color: var(--text-main);
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 11px;
  cursor: pointer;
}

.page-content {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px;
}

.drawer-navigation .navigation-item {
  color: var(--text-secondary);
}

.drawer-navigation .navigation-item:hover,
.drawer-navigation .navigation-item.active {
  color: var(--primary-color);
  background: var(--primary-light);
}

@media (max-width: 900px) {
  .app-shell {
    display: block;
  }

  .sidebar {
    display: none;
  }

  .mobile-menu-button {
    display: inline-flex;
  }

  .topbar {
    padding: 14px 20px;
  }

  .page-content {
    padding: 22px 18px;
  }
}

@media (max-width: 560px) {
  .user-chip > div:last-child {
    display: none;
  }

  .page-heading h1 {
    font-size: 20px;
  }
}
</style>