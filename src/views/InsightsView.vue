<script setup lang="ts">
import {
  computed,
  onMounted,
} from 'vue'

import BaseChart from '@/components/charts/BaseChart.vue'

import {
  APPLICATION_STATUS_OPTIONS,
} from '@/data/applicationOptions'

import { useAnalysisStore } from '@/stores/analysis'
import { useApplicationStore } from '@/stores/application'
import { useRoadmapStore } from '@/stores/roadmap'

import {
  buildSkillCategoryMetrics,
  buildWeeklyActivity,
} from '@/utils/insightMetrics'

import type {
  EChartsCoreOption,
} from '@/plugins/echarts'

import DataManagementCard from '@/components/common/DataManagementCard.vue'

interface ActionRecommendation {
  id: string
  level: 'high' | 'medium' | 'normal'
  title: string
  description: string
  route: string
  actionText: string
}

const analysisStore =
  useAnalysisStore()

const roadmapStore =
  useRoadmapStore()

const applicationStore =
  useApplicationStore()

onMounted(() => {
  analysisStore.hydrate()
  roadmapStore.hydrate()
  applicationStore.hydrate()
})

const latestAnalysis = computed(
  () => analysisStore.currentResult,
)

const skillMetrics = computed(() =>
  buildSkillCategoryMetrics(
    latestAnalysis.value,
  ),
)

const weeklyActivity = computed(() =>
  buildWeeklyActivity(
    analysisStore.history,
    roadmapStore.tasks,
    applicationStore.applications,
  ),
)

const hasSkillData = computed(
  () =>
    latestAnalysis.value !== null &&
    latestAnalysis.value.detectedSkills
      .length > 0,
)

const hasApplicationData = computed(
  () =>
    applicationStore.totalCount > 0,
)

const hasRoadmapData = computed(
  () => roadmapStore.totalCount > 0,
)

const hasActivityData = computed(() =>
  weeklyActivity.value.some(
    (point) =>
      point.analyses > 0 ||
      point.roadmap > 0 ||
      point.applications > 0,
  ),
)

const summaryCards = computed(() => [
  {
    label: '岗位分析次数',

    value: String(
      analysisStore.totalCount,
    ),

    description:
      analysisStore.totalCount > 0
        ? `平均匹配度 ${analysisStore.averageScore}%`
        : '还没有分析岗位',

    tone: 'purple',
  },
  {
    label: '学习任务完成率',

    value: `${roadmapStore.completionRate}%`,

    description:
      roadmapStore.activeCount > 0
        ? `还有 ${roadmapStore.activeCount} 个任务未完成`
        : '当前没有未完成任务',

    tone: 'orange',
  },
  {
    label: '投递推进率',

    value: `${applicationStore.interviewRate}%`,

    description:
      applicationStore.submittedCount > 0
        ? `已经投递 ${applicationStore.submittedCount} 个岗位`
        : '还没有正式投递',

    tone: 'blue',
  },
  {
    label: '获得 Offer',

    value: String(
      applicationStore.offerCount,
    ),

    description:
      applicationStore.offerCount > 0
        ? '继续比较岗位与团队'
        : '保持学习和投递节奏',

    tone: 'green',
  },
])

const skillRadarOption =
  computed<EChartsCoreOption>(() => ({
    aria: {
      enabled: true,
    },

    tooltip: {
      trigger: 'item',
    },

    radar: {
      radius: '65%',

      splitNumber: 4,

      indicator:
        skillMetrics.value.map(
          (metric) => ({
            name: metric.label,
            max: 100,
          }),
        ),

      axisName: {
        color: '#667085',
        fontSize: 12,
      },

      axisLine: {
        lineStyle: {
          color: '#e4e7ec',
        },
      },

      splitLine: {
        lineStyle: {
          color: '#e4e7ec',
        },
      },

      splitArea: {
        areaStyle: {
          color: [
            '#ffffff',
            '#fafaff',
          ],
        },
      },
    },

    series: [
      {
        name: '技能掌握度',
        type: 'radar',

        data: [
          {
            name: '当前掌握度',

            value:
              skillMetrics.value.map(
                (metric) =>
                  metric.score,
              ),

            lineStyle: {
              color: '#635bff',
              width: 2,
            },

            itemStyle: {
              color: '#635bff',
            },

            areaStyle: {
              color:
                'rgba(99, 91, 255, 0.22)',
            },
          },
        ],
      },
    ],
  }))

const pipelineOption =
  computed<EChartsCoreOption>(() => {
    const labels =
      APPLICATION_STATUS_OPTIONS.map(
        (option) => option.label,
      )

    const values =
      APPLICATION_STATUS_OPTIONS.map(
        (option) =>
          applicationStore.statusCounts[
            option.value
          ],
      )

    return {
      aria: {
        enabled: true,
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },

      grid: {
        top: 10,
        left: 74,
        right: 20,
        bottom: 24,
      },

      xAxis: {
        type: 'value',
        minInterval: 1,

        axisLine: {
          show: false,
        },

        splitLine: {
          lineStyle: {
            color: '#eef0f4',
          },
        },
      },

      yAxis: {
        type: 'category',
        data: labels,

        axisLine: {
          show: false,
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: '#667085',
        },
      },

      series: [
        {
          name: '岗位数量',
          type: 'bar',
          data: values,
          barWidth: 15,

          itemStyle: {
            color: '#635bff',
            borderRadius: [
              0,
              8,
              8,
              0,
            ],
          },

          label: {
            show: true,
            position: 'right',
            color: '#667085',
          },
        },
      ],
    }
  })

const roadmapOption =
  computed<EChartsCoreOption>(() => ({
    aria: {
      enabled: true,
    },

    tooltip: {
      trigger: 'item',
    },

    legend: {
      bottom: 0,
      icon: 'circle',

      textStyle: {
        color: '#667085',
      },
    },

    series: [
      {
        name: '学习任务',
        type: 'pie',

        radius: [
          '52%',
          '72%',
        ],

        center: [
          '50%',
          '43%',
        ],

        avoidLabelOverlap: true,

        label: {
          formatter: '{b}\n{c} 个',
          color: '#667085',
        },

        data: [
          {
            name: '待开始',
            value:
              roadmapStore.todoCount,

            itemStyle: {
              color: '#98a2b3',
            },
          },
          {
            name: '进行中',
            value:
              roadmapStore.doingCount,

            itemStyle: {
              color: '#f79009',
            },
          },
          {
            name: '已完成',
            value:
              roadmapStore.completedCount,

            itemStyle: {
              color: '#12b76a',
            },
          },
        ],
      },
    ],
  }))

const activityOption =
  computed<EChartsCoreOption>(() => {
    const labels =
      weeklyActivity.value.map(
        (point) => point.label,
      )

    return {
      aria: {
        enabled: true,
      },

      tooltip: {
        trigger: 'axis',
      },

      legend: {
        top: 0,

        textStyle: {
          color: '#667085',
        },
      },

      grid: {
        top: 46,
        left: 38,
        right: 20,
        bottom: 30,
      },

      xAxis: {
        type: 'category',
        data: labels,

        boundaryGap: false,

        axisLine: {
          lineStyle: {
            color: '#e4e7ec',
          },
        },

        axisLabel: {
          color: '#98a2b3',
        },
      },

      yAxis: {
        type: 'value',
        minInterval: 1,

        axisLine: {
          show: false,
        },

        splitLine: {
          lineStyle: {
            color: '#eef0f4',
          },
        },

        axisLabel: {
          color: '#98a2b3',
        },
      },

      series: [
        {
          name: 'JD 分析',
          type: 'line',
          smooth: true,

          data:
            weeklyActivity.value.map(
              (point) =>
                point.analyses,
            ),

          itemStyle: {
            color: '#635bff',
          },

          lineStyle: {
            color: '#635bff',
          },
        },
        {
          name: '学习活动',
          type: 'line',
          smooth: true,

          data:
            weeklyActivity.value.map(
              (point) =>
                point.roadmap,
            ),

          itemStyle: {
            color: '#f79009',
          },

          lineStyle: {
            color: '#f79009',
          },
        },
        {
          name: '投递活动',
          type: 'line',
          smooth: true,

          data:
            weeklyActivity.value.map(
              (point) =>
                point.applications,
            ),

          itemStyle: {
            color: '#12b76a',
          },

          lineStyle: {
            color: '#12b76a',
          },
        },
      ],
    }
  })

const recommendations = computed<
  ActionRecommendation[]
>(() => {
  const items:
    ActionRecommendation[] = []

  if (!analysisStore.currentResult) {
    items.push({
      id: 'create-analysis',
      level: 'high',
      title: '完成第一次岗位分析',
      description:
        '粘贴一个目标岗位 JD，识别技能要求并生成学习计划。',
      route: '/analyzer',
      actionText: '开始分析',
    })
  } else if (
    analysisStore.currentResult.score < 60
  ) {
    const missingSkill =
      analysisStore.currentResult
        .missingSkills[0]

    items.push({
      id: 'improve-readiness',
      level: 'high',
      title: '优先补齐核心技能',
      description: missingSkill
        ? `当前匹配度为 ${analysisStore.currentResult.score}%，建议先学习 ${missingSkill.name}。`
        : `当前匹配度为 ${analysisStore.currentResult.score}%，建议继续补充岗位技能。`,
      route: '/roadmap',
      actionText: '查看学习路线',
    })
  }

  if (roadmapStore.overdueCount > 0) {
    items.push({
      id: 'overdue-tasks',
      level: 'high',
      title: '处理逾期学习任务',
      description: `当前有 ${roadmapStore.overdueCount} 个任务已经逾期，建议重新安排截止时间。`,
      route: '/roadmap',
      actionText: '处理任务',
    })
  } else if (
    roadmapStore.activeCount > 3
  ) {
    items.push({
      id: 'reduce-work-in-progress',
      level: 'medium',
      title: '减少同时进行的任务',
      description:
        '当前未完成任务较多，建议优先完成高优先级任务。',
      route: '/roadmap',
      actionText: '整理任务',
    })
  }

  if (
    applicationStore.totalCount === 0
  ) {
    items.push({
      id: 'first-application',
      level: 'medium',
      title: '创建第一条投递记录',
      description:
        '将目标岗位加入投递管理，记录投递时间和下一步行动。',
      route: '/applications',
      actionText: '创建记录',
    })
  } else if (
    applicationStore.submittedCount >= 3 &&
    applicationStore.interviewCount ===
      0 &&
    applicationStore.offerCount === 0
  ) {
    items.push({
      id: 'improve-application',
      level: 'medium',
      title: '检查简历与岗位匹配',
      description:
        '已有多次投递但尚未进入面试，可以重新检查项目描述和岗位关键词。',
      route: '/applications',
      actionText: '查看投递',
    })
  }

  if (
    applicationStore.interviewCount > 0
  ) {
    items.push({
      id: 'prepare-interview',
      level: 'normal',
      title: '准备当前面试流程',
      description: `目前有 ${applicationStore.interviewCount} 个岗位处于面试阶段，优先复习项目和高频问题。`,
      route: '/applications',
      actionText: '查看面试岗位',
    })
  }

  if (items.length === 0) {
    items.push({
      id: 'keep-progress',
      level: 'normal',
      title: '当前节奏良好',
      description:
        '继续保持学习、投递和复盘，定期更新任务进度。',
      route: '/dashboard',
      actionText: '返回总览',
    })
  }

  return items.slice(0, 4)
})
</script>

<template>
  <div class="insights-page">
    <section class="insights-hero">
      <div>
        <span>CAREER DATA INSIGHTS</span>

        <h2>
          用真实数据检查你的
          <em>求职准备度</em>
        </h2>

        <p>
          综合 JD 分析、学习任务和投递进度，
          找到当前最应该执行的下一步。
        </p>
      </div>

      <div class="readiness-card">
        <span>最新岗位匹配度</span>

        <strong>
          {{
            latestAnalysis?.score ?? 0
          }}%
        </strong>

        <small>
          {{
            latestAnalysis
              ? latestAnalysis.readinessLabel
              : '完成 JD 分析后生成'
          }}
        </small>
      </div>
    </section>

    <section class="summary-grid">
      <article
        v-for="item in summaryCards"
        :key="item.label"
        class="summary-card"
        :class="item.tone"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>
          {{ item.description }}
        </small>
      </article>
    </section>

    <section class="charts-grid">
      <article class="chart-card">
        <header>
          <div>
            <span>SKILL PROFILE</span>
            <h3>岗位技能雷达图</h3>
          </div>

          <RouterLink to="/analyzer">
            更新分析
          </RouterLink>
        </header>

        <BaseChart
          :option="skillRadarOption"
          :empty="!hasSkillData"
          empty-text="完成一次 JD 分析后生成技能雷达图"
          aria-label="岗位技能掌握度雷达图"
          height="340px"
        />
      </article>

      <article class="chart-card">
        <header>
          <div>
            <span>APPLICATION FUNNEL</span>
            <h3>求职流程分布</h3>
          </div>

          <RouterLink to="/applications">
            管理投递
          </RouterLink>
        </header>

        <BaseChart
          :option="pipelineOption"
          :empty="!hasApplicationData"
          empty-text="创建投递记录后生成流程分布"
          aria-label="求职投递流程柱状图"
          height="340px"
        />
      </article>

      <article class="chart-card">
        <header>
          <div>
            <span>LEARNING PROGRESS</span>
            <h3>学习任务状态</h3>
          </div>

          <RouterLink to="/roadmap">
            查看路线
          </RouterLink>
        </header>

        <BaseChart
          :option="roadmapOption"
          :empty="!hasRoadmapData"
          empty-text="创建学习任务后生成任务状态图"
          aria-label="学习任务状态环形图"
          height="340px"
        />
      </article>

      <article class="chart-card">
        <header>
          <div>
            <span>ACTIVITY TREND</span>
            <h3>最近 7 天活动</h3>
          </div>
        </header>

        <BaseChart
          :option="activityOption"
          :empty="!hasActivityData"
          empty-text="最近 7 天还没有项目操作记录"
          aria-label="最近七天项目活动折线图"
          height="340px"
        />
      </article>
    </section>

    <section class="recommendation-section">
      <header>
        <span>NEXT BEST ACTION</span>
        <h3>建议下一步行动</h3>
        <p>
          根据当前技能、任务和投递数据自动生成。
        </p>
      </header>

      <div class="recommendation-grid">
        <article
          v-for="item in recommendations"
          :key="item.id"
          class="recommendation-card"
          :class="item.level"
        >
          <span class="level-dot"></span>

          <div>
            <h4>{{ item.title }}</h4>
            <p>{{ item.description }}</p>

            <RouterLink :to="item.route">
              {{ item.actionText }}
            </RouterLink>
          </div>
        </article>
      </div>
    </section>
    <DataManagementCard />
  </div>
</template>

<style scoped>
.insights-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.insights-hero {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) 250px;
  gap: 34px;
  align-items: center;

  padding: 36px;

  color: #ffffff;

  background:
    radial-gradient(
      circle at 88% 8%,
      rgba(188, 184, 255, 0.46),
      transparent 32%
    ),
    linear-gradient(
      125deg,
      #242044,
      #5750ca
    );

  border-radius: var(--radius-large);
}

.insights-hero > div:first-child > span {
  color: #bdb8ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.insights-hero h2 {
  margin: 9px 0 11px;

  font-size:
    clamp(28px, 4vw, 42px);

  line-height: 1.2;
}

.insights-hero h2 em {
  color: #c8ffde;
  font-style: normal;
}

.insights-hero p {
  max-width: 680px;
  margin: 0;

  color:
    rgba(255, 255, 255, 0.7);

  line-height: 1.7;
}

.readiness-card {
  padding: 24px;

  background:
    rgba(255, 255, 255, 0.12);

  border:
    1px solid
    rgba(255, 255, 255, 0.15);

  border-radius: 18px;
}

.readiness-card span,
.readiness-card strong,
.readiness-card small {
  display: block;
}

.readiness-card span {
  color:
    rgba(255, 255, 255, 0.66);

  font-size: 12px;
}

.readiness-card strong {
  margin: 8px 0;

  font-size: 45px;
  line-height: 1.1;
}

.readiness-card small {
  color:
    rgba(255, 255, 255, 0.7);

  line-height: 1.6;
}

.summary-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 14px;
}

.summary-card {
  position: relative;
  overflow: hidden;

  padding: 22px;

  background: #ffffff;

  border:
    1px solid var(--border);

  border-radius:
    var(--radius-medium);
}

.summary-card::after {
  position: absolute;
  top: -24px;
  right: -24px;

  width: 84px;
  height: 84px;

  background: currentColor;
  border-radius: 50%;
  opacity: 0.08;

  content: "";
}

.summary-card span,
.summary-card strong,
.summary-card small {
  display: block;
}

.summary-card span {
  color: var(--text-secondary);
  font-size: 12px;
}

.summary-card strong {
  margin: 8px 0;

  color: var(--text-main);
  font-size: 29px;
}

.summary-card small {
  color: var(--text-light);
}

.summary-card.purple {
  color: #635bff;
}

.summary-card.orange {
  color: #f79009;
}

.summary-card.blue {
  color: #2e90fa;
}

.summary-card.green {
  color: #12b76a;
}

.charts-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 18px;
}

.chart-card {
  min-width: 0;
  padding: 24px;

  background: #ffffff;

  border:
    1px solid var(--border);

  border-radius:
    var(--radius-medium);
}

.chart-card > header {
  display: flex;
  justify-content: space-between;
  gap: 18px;

  margin-bottom: 14px;
}

.chart-card header span,
.recommendation-section > header > span {
  color: var(--primary-color);

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.chart-card h3 {
  margin: 4px 0 0;
  font-size: 18px;
}

.chart-card header a {
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 700;
}

.recommendation-section {
  padding: 26px;

  background: #ffffff;

  border:
    1px solid var(--border);

  border-radius:
    var(--radius-medium);
}

.recommendation-section > header h3 {
  margin: 4px 0 6px;
  font-size: 20px;
}

.recommendation-section > header p {
  margin: 0;

  color: var(--text-secondary);
  font-size: 12px;
}

.recommendation-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 13px;

  margin-top: 20px;
}

.recommendation-card {
  display: flex;
  gap: 13px;

  padding: 18px;

  background: #f8f9fc;
  border: 1px solid transparent;
  border-radius: 13px;
}

.level-dot {
  flex: 0 0 auto;

  width: 10px;
  height: 10px;

  margin-top: 6px;

  background: #2e90fa;
  border-radius: 50%;
}

.recommendation-card.high {
  border-color: #fda29b;
}

.recommendation-card.high .level-dot {
  background: #f04438;
}

.recommendation-card.medium .level-dot {
  background: #f79009;
}

.recommendation-card h4 {
  margin: 0 0 7px;
}

.recommendation-card p {
  margin: 0 0 12px;

  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.7;
}

.recommendation-card a {
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1050px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .insights-hero {
    grid-template-columns: 1fr;
  }

  .readiness-card {
    max-width: 350px;
  }

  .recommendation-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .insights-hero,
  .chart-card,
  .recommendation-section {
    padding: 21px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>