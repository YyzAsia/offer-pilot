<script setup lang="ts">
const statistics = [
  {
    label: '已分析岗位',
    value: '12',
    change: '本周新增 3 个',
    type: 'purple',
  },
  {
    label: '平均匹配度',
    value: '68%',
    change: '较上周提升 6%',
    type: 'green',
  },
  {
    label: '进行中任务',
    value: '8',
    change: '3 个将在本周到期',
    type: 'orange',
  },
  {
    label: '已投递岗位',
    value: '16',
    change: '获得 4 次面试',
    type: 'blue',
  },
]

const focusTasks = [
  {
    title: '完成 Vue Router 权限控制',
    category: 'Vue 3',
    progress: 70,
  },
  {
    title: '整理 JavaScript 事件循环笔记',
    category: 'JavaScript',
    progress: 45,
  },
  {
    title: '完成 OfferPilot JD 分析页面',
    category: '项目开发',
    progress: 25,
  },
]

const applicationStages = [
  {
    label: '准备投递',
    count: 5,
  },
  {
    label: '已投递',
    count: 7,
  },
  {
    label: '笔试',
    count: 2,
  },
  {
    label: '面试',
    count: 4,
  },
  {
    label: 'Offer',
    count: 1,
  },
]
</script>

<template>
  <div class="dashboard">
    <section class="hero-card">
      <div>
        <span class="hero-label">PROJECT-DRIVEN LEARNING</span>

        <h2>
          早上好，今天继续向
          <em>前端实习</em>
          前进。
        </h2>

        <p>
          将岗位要求转化为清晰的技能差距、学习任务和投递计划，
          不再盲目刷课程。
        </p>

        <RouterLink
          to="/analyzer"
          class="hero-action"
        >
          开始分析新岗位
        </RouterLink>
      </div>

      <div class="score-card">
        <span>当前综合准备度</span>

        <strong>68</strong>

        <div class="score-bar">
          <span></span>
        </div>

        <small>距离推荐投递线还差 7 分</small>
      </div>
    </section>

    <section class="statistics-grid">
      <article
        v-for="item in statistics"
        :key="item.label"
        class="statistic-card"
        :class="item.type"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.change }}</small>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="panel">
        <header class="panel-header">
          <div>
            <span>LEARNING PLAN</span>
            <h3>今日重点任务</h3>
          </div>

          <RouterLink to="/roadmap">查看全部</RouterLink>
        </header>

        <div class="task-list">
          <div
            v-for="task in focusTasks"
            :key="task.title"
            class="task-item"
          >
            <div class="task-main">
              <span>{{ task.category }}</span>
              <strong>{{ task.title }}</strong>
            </div>

            <div class="task-progress">
              <span>{{ task.progress }}%</span>

              <div>
                <i :style="{ width: `${task.progress}%` }"></i>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="panel">
        <header class="panel-header">
          <div>
            <span>APPLICATION PIPELINE</span>
            <h3>求职进度</h3>
          </div>

          <RouterLink to="/applications">管理投递</RouterLink>
        </header>

        <div class="pipeline">
          <div
            v-for="stage in applicationStages"
            :key="stage.label"
            class="pipeline-row"
          >
            <span>{{ stage.label }}</span>

            <div class="pipeline-bar">
              <i
                :style="{
                  width: `${Math.max(stage.count * 12, 8)}%`,
                }"
              ></i>
            </div>

            <strong>{{ stage.count }}</strong>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 40px;
  align-items: center;

  padding: 40px;

  color: #ffffff;
  background:
    radial-gradient(circle at 84% 14%, rgba(166, 160, 255, 0.55), transparent 28%),
    linear-gradient(125deg, #302b63 0%, #5b54d6 55%, #736cff 100%);

  border-radius: var(--radius-large);
  box-shadow: 0 20px 50px rgba(68, 61, 165, 0.2);
}

.hero-label {
  display: inline-block;
  margin-bottom: 16px;

  color: #c5c1ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.hero-card h2 {
  max-width: 720px;
  margin-bottom: 15px;

  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.2;
}

.hero-card h2 em {
  color: #c8ffde;
  font-style: normal;
}

.hero-card p {
  max-width: 650px;
  margin-bottom: 25px;

  color: rgba(255, 255, 255, 0.72);
  line-height: 1.75;
}

.hero-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 44px;
  padding: 0 18px;

  color: #4f46e5;
  font-size: 14px;
  font-weight: 800;

  background: #ffffff;
  border-radius: 11px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.hero-action:hover {
  box-shadow: 0 12px 28px rgba(21, 18, 70, 0.28);
  transform: translateY(-2px);
}

.score-card {
  padding: 25px;
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  backdrop-filter: blur(10px);
}

.score-card > span,
.score-card small {
  display: block;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
}

.score-card strong {
  display: block;
  margin: 8px 0;
  font-size: 55px;
  line-height: 1;
}

.score-bar {
  height: 8px;
  margin: 20px 0 11px;
  overflow: hidden;

  background: rgba(255, 255, 255, 0.14);
  border-radius: 999px;
}

.score-bar span {
  display: block;
  width: 68%;
  height: 100%;
  background: #c8ffde;
  border-radius: inherit;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.statistic-card {
  position: relative;
  overflow: hidden;

  padding: 23px;

  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-medium);
}

.statistic-card::after {
  position: absolute;
  top: -22px;
  right: -22px;

  width: 80px;
  height: 80px;

  background: currentColor;
  border-radius: 50%;
  opacity: 0.08;

  content: "";
}

.statistic-card > span,
.statistic-card small,
.statistic-card strong {
  display: block;
}

.statistic-card > span {
  color: var(--text-secondary);
  font-size: 13px;
}

.statistic-card strong {
  margin: 8px 0;
  color: var(--text-main);
  font-size: 31px;
}

.statistic-card small {
  color: var(--text-light);
}

.statistic-card.purple {
  color: #635bff;
}

.statistic-card.green {
  color: #12b76a;
}

.statistic-card.orange {
  color: #f79009;
}

.statistic-card.blue {
  color: #2e90fa;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 20px;
}

.panel {
  padding: 26px;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-medium);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 23px;
}

.panel-header span {
  color: var(--primary-color);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.panel-header h3 {
  margin: 4px 0 0;
  font-size: 19px;
}

.panel-header a {
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 700;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  padding: 17px;
  background: #f8f9fc;
  border-radius: 13px;
}

.task-main span,
.task-main strong {
  display: block;
}

.task-main span {
  margin-bottom: 5px;
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 700;
}

.task-main strong {
  font-size: 14px;
}

.task-progress {
  flex: 0 0 115px;
}

.task-progress > span {
  display: block;
  margin-bottom: 7px;

  color: var(--text-light);
  font-size: 11px;
  text-align: right;
}

.task-progress > div {
  height: 6px;
  overflow: hidden;
  background: #e5e7f0;
  border-radius: 999px;
}

.task-progress i {
  display: block;
  height: 100%;

  background: linear-gradient(90deg, #635bff, #928cff);
  border-radius: inherit;
}

.pipeline {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.pipeline-row {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr) 24px;
  gap: 12px;
  align-items: center;
}

.pipeline-row > span {
  color: var(--text-secondary);
  font-size: 12px;
}

.pipeline-row > strong {
  font-size: 13px;
  text-align: right;
}

.pipeline-bar {
  height: 8px;
  overflow: hidden;
  background: #edf0f5;
  border-radius: 999px;
}

.pipeline-bar i {
  display: block;
  max-width: 100%;
  height: 100%;

  background: linear-gradient(90deg, #635bff, #9a94ff);
  border-radius: inherit;
}

@media (max-width: 1100px) {
  .statistics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .hero-card {
    grid-template-columns: 1fr;
    padding: 29px;
  }

  .score-card {
    max-width: 340px;
  }
}

@media (max-width: 520px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .hero-card,
  .panel {
    padding: 22px;
  }

  .task-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .task-progress {
    width: 100%;
    flex-basis: auto;
  }
}
</style>