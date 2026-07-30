<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  ElMessage,
  ElMessageBox,
} from 'element-plus'

import ApplicationCard from '@/components/application/ApplicationCard.vue'

import ApplicationDetailDrawer from '@/components/application/ApplicationDetailDrawer.vue'

import ApplicationDialog from '@/components/application/ApplicationDialog.vue'

import {
  APPLICATION_STATUS_OPTIONS,
} from '@/data/applicationOptions'

import { useAnalysisStore } from '@/stores/analysis'

import { useApplicationStore } from '@/stores/application'

import type {
  ApplicationFormData,
  ApplicationPriority,
  ApplicationSource,
  ApplicationStatus,
  JobApplication,
} from '@/types/application'

const analysisStore = useAnalysisStore()

const applicationStore =
  useApplicationStore()

const searchKeyword = ref('')

const priorityFilter = ref<
  'all' | ApplicationPriority
>('all')

const sourceFilter = ref<
  'all' | ApplicationSource
>('all')

const dialogVisible = ref(false)
const detailVisible = ref(false)

const editingApplication =
  ref<JobApplication | null>(null)

const selectedApplication =
  ref<JobApplication | null>(null)

const draggedApplicationId =
  ref<string | null>(null)

const dragOverStatus =
  ref<ApplicationStatus | null>(null)

const priorityRanking:
  Record<ApplicationPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  }

function compareApplications(
  first: JobApplication,
  second: JobApplication,
): number {
  const priorityDifference =
    priorityRanking[first.priority] -
    priorityRanking[second.priority]

  if (priorityDifference !== 0) {
    return priorityDifference
  }

  if (
    first.nextActionAt &&
    second.nextActionAt
  ) {
    const dateDifference =
      first.nextActionAt.localeCompare(
        second.nextActionAt,
      )

    if (dateDifference !== 0) {
      return dateDifference
    }
  }

  if (first.nextActionAt) {
    return -1
  }

  if (second.nextActionAt) {
    return 1
  }

  return second.updatedAt.localeCompare(
    first.updatedAt,
  )
}

const filteredApplicationsByStatus =
  computed(() => {
    const groups: Record<
      ApplicationStatus,
      JobApplication[]
    > = {
      wishlist: [],
      applied: [],
      'written-test': [],
      'interview-1': [],
      'interview-2': [],
      offer: [],
      rejected: [],
    }

    const keyword =
      searchKeyword.value
        .trim()
        .toLowerCase()

    for (
      const application of
      applicationStore.applications
    ) {
      const searchableContent = [
        application.companyName,
        application.jobTitle,
        application.location,
        application.salaryRange,
        application.recruitmentChannel,
        application.contactName,
        application.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()

      if (
        keyword &&
        !searchableContent.includes(keyword)
      ) {
        continue
      }

      if (
        priorityFilter.value !== 'all' &&
        application.priority !==
          priorityFilter.value
      ) {
        continue
      }

      if (
        sourceFilter.value !== 'all' &&
        application.source !==
          sourceFilter.value
      ) {
        continue
      }

      groups[application.status].push(
        application,
      )
    }

    for (
      const option of
      APPLICATION_STATUS_OPTIONS
    ) {
      groups[option.value].sort(
        compareApplications,
      )
    }

    return groups
  })

const filteredCount = computed(() =>
  APPLICATION_STATUS_OPTIONS.reduce(
    (total, option) =>
      total +
      filteredApplicationsByStatus.value[
        option.value
      ].length,
    0,
  ),
)

function openCreateDialog(): void {
  editingApplication.value = null
  dialogVisible.value = true
}

function openEditDialog(
  application: JobApplication,
): void {
  editingApplication.value = application
  dialogVisible.value = true
}

function openDetailDrawer(
  application: JobApplication,
): void {
  selectedApplication.value = application
  detailVisible.value = true
}

function editSelectedApplication(): void {
  if (!selectedApplication.value) {
    return
  }

  const application =
    selectedApplication.value

  detailVisible.value = false

  openEditDialog(application)
}

function handleSaveApplication(
  data: ApplicationFormData,
): void {
  if (editingApplication.value) {
    const updatedApplication =
      applicationStore.updateApplication(
        editingApplication.value.id,
        data,
      )

    if (!updatedApplication) {
      ElMessage.warning(
        '相同公司和岗位的投递记录已存在',
      )

      return
    }

    selectedApplication.value =
      updatedApplication

    ElMessage.success('投递记录已更新')
  } else {
    const createdApplication =
      applicationStore.addApplication(data)

    if (!createdApplication) {
      ElMessage.warning(
        '相同公司和岗位的投递记录已存在',
      )

      return
    }

    ElMessage.success('投递记录已创建')
  }

  editingApplication.value = null
}

function changeStatus(
  id: string,
  status: ApplicationStatus,
): void {
  applicationStore.moveApplication(
    id,
    status,
  )
}

function handleDragStart(id: string): void {
  draggedApplicationId.value = id
}

function handleDragEnd(): void {
  draggedApplicationId.value = null
  dragOverStatus.value = null
}

function handleDrop(
  status: ApplicationStatus,
  event: DragEvent,
): void {
  const applicationId =
    draggedApplicationId.value ||
    event.dataTransfer?.getData(
      'text/plain',
    )

  if (!applicationId) {
    return
  }

  applicationStore.moveApplication(
    applicationId,
    status,
  )

  draggedApplicationId.value = null
  dragOverStatus.value = null
}

async function removeApplication(
  application: JobApplication,
): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除“${application.companyName} · ${application.jobTitle}”吗？`,
      '删除投递记录',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    applicationStore.removeApplication(
      application.id,
    )

    if (
      selectedApplication.value?.id ===
      application.id
    ) {
      detailVisible.value = false
      selectedApplication.value = null
    }

    ElMessage.success('投递记录已删除')
  } catch {
    // 用户取消时不处理
  }
}

function importLatestAnalysis(): void {
  const latestResult =
    analysisStore.currentResult

  if (!latestResult) {
    ElMessage.warning(
      '请先完成一次 JD 分析',
    )

    return
  }

  const application =
    applicationStore.createFromAnalysis(
      latestResult,
    )

  if (!application) {
    ElMessage.info(
      '最新分析对应的投递记录已存在',
    )

    return
  }

  ElMessage.success(
    '已根据最新 JD 分析创建投递记录',
  )
}

async function clearRejected(): Promise<void> {
  if (
    applicationStore.rejectedCount === 0
  ) {
    ElMessage.info('当前没有未通过记录')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认删除全部 ${applicationStore.rejectedCount} 条未通过记录吗？`,
      '清理未通过记录',
      {
        confirmButtonText: '确认清理',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const clearedCount =
      applicationStore.clearRejected()

    ElMessage.success(
      `已清理 ${clearedCount} 条记录`,
    )
  } catch {
    // 用户取消时不处理
  }
}

function resetFilters(): void {
  searchKeyword.value = ''
  priorityFilter.value = 'all'
  sourceFilter.value = 'all'
}

onMounted(() => {
  analysisStore.hydrate()
  applicationStore.hydrate()
})
</script>

<template>
  <div class="applications-page">
    <section class="applications-hero">
      <div>
        <span>
          APPLICATION PIPELINE
        </span>

        <h2>
          让每一次投递都有
          <em>记录和下一步</em>
        </h2>

        <p>
          管理准备投递、笔试、面试和 Offer，
          并记录每一次流程变化。
        </p>
      </div>

      <div class="hero-actions">
        <el-button
          @click="importLatestAnalysis"
        >
          从最新分析创建
        </el-button>

        <el-button
          type="primary"
          @click="openCreateDialog"
        >
          新增投递记录
        </el-button>
      </div>
    </section>

    <section class="statistics-grid">
      <article>
        <span>全部岗位</span>
        <strong>
          {{ applicationStore.totalCount }}
        </strong>
        <small>
          当前进行中
          {{ applicationStore.activeCount }}
          个
        </small>
      </article>

      <article>
        <span>已经投递</span>
        <strong>
          {{
            applicationStore.submittedCount
          }}
        </strong>
        <small>
          不包含准备投递
        </small>
      </article>

      <article>
        <span>当前面试</span>
        <strong>
          {{
            applicationStore.interviewCount
          }}
        </strong>
        <small>
          一面和二面阶段
        </small>
      </article>

      <article class="offer-stat">
        <span>获得 Offer</span>
        <strong>
          {{ applicationStore.offerCount }}
        </strong>
        <small>
          流程转化率
          {{
            applicationStore.interviewRate
          }}%
        </small>
      </article>
    </section>

    <section class="toolbar-card">
      <div class="filter-controls">
        <el-input
          v-model="searchKeyword"
          clearable
          placeholder="搜索公司、岗位、地点或标签"
        />

        <el-select
          v-model="priorityFilter"
          placeholder="优先级"
        >
          <el-option
            label="全部优先级"
            value="all"
          />

          <el-option
            label="高优先级"
            value="high"
          />

          <el-option
            label="中优先级"
            value="medium"
          />

          <el-option
            label="低优先级"
            value="low"
          />
        </el-select>

        <el-select
          v-model="sourceFilter"
          placeholder="记录来源"
        >
          <el-option
            label="全部来源"
            value="all"
          />

          <el-option
            label="JD 分析生成"
            value="analysis"
          />

          <el-option
            label="手动创建"
            value="manual"
          />
        </el-select>
      </div>

      <div class="toolbar-actions">
        <span>
          当前显示 {{ filteredCount }} 条
        </span>

        <el-button
          link
          @click="resetFilters"
        >
          重置筛选
        </el-button>

        <el-button
          link
          type="danger"
          @click="clearRejected"
        >
          清理未通过
        </el-button>
      </div>
    </section>

    <section class="pipeline-wrapper">
      <div class="pipeline-board">
        <article
          v-for="column in APPLICATION_STATUS_OPTIONS"
          :key="column.value"
          class="pipeline-column"
          :class="{
            'drop-active':
              dragOverStatus ===
              column.value,
          }"
          @dragover.prevent="
            dragOverStatus = column.value
          "
          @dragleave="
            dragOverStatus = null
          "
          @drop="
            handleDrop(
              column.value,
              $event,
            )
          "
        >
          <header class="column-header">
            <div>
              <h3>{{ column.label }}</h3>
              <p>
                {{ column.description }}
              </p>
            </div>

            <strong>
              {{
                filteredApplicationsByStatus[
                  column.value
                ].length
              }}
            </strong>
          </header>

          <div
            v-if="
              filteredApplicationsByStatus[
                column.value
              ].length
            "
            class="column-applications"
          >
            <ApplicationCard
              v-for="application in filteredApplicationsByStatus[
                column.value
              ]"
              :key="application.id"
              :application="application"
              @view="
                openDetailDrawer(
                  application,
                )
              "
              @edit="
                openEditDialog(
                  application,
                )
              "
              @remove="
                removeApplication(
                  application,
                )
              "
              @change-status="
                changeStatus(
                  application.id,
                  $event,
                )
              "
              @drag-start="
                handleDragStart
              "
              @drag-end="
                handleDragEnd
              "
            />
          </div>

          <div
            v-else
            class="column-empty"
          >
            <span>＋</span>
            <p>该阶段暂无记录</p>
          </div>
        </article>
      </div>
    </section>

    <section class="usage-tip">
      <strong>操作提示</strong>

      <p>
        电脑端可直接拖动投递卡片；
        手机端可使用卡片底部的状态选择框。
        点击“详情”可以查看完整流程历史和原始 JD。
      </p>
    </section>

    <ApplicationDialog
      v-model="dialogVisible"
      :application="editingApplication"
      @submit="handleSaveApplication"
    />

    <ApplicationDetailDrawer
      v-model="detailVisible"
      :application="selectedApplication"
      @edit="editSelectedApplication"
    />
  </div>
</template>

<style scoped>
.applications-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.applications-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;

  padding: 34px;

  color: #ffffff;

  background:
    radial-gradient(
      circle at 88% 8%,
      rgba(188, 184, 255, 0.46),
      transparent 31%
    ),
    linear-gradient(
      125deg,
      #242044,
      #5750ca
    );

  border-radius: var(--radius-large);
}

.applications-hero > div:first-child > span {
  color: #bdb8ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.applications-hero h2 {
  margin: 9px 0 10px;
  font-size: clamp(27px, 4vw, 40px);
}

.applications-hero h2 em {
  color: #c8ffde;
  font-style: normal;
}

.applications-hero p {
  max-width: 680px;
  margin: 0;

  color: rgba(255, 255, 255, 0.7);
}

.hero-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 10px;
}

.statistics-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.statistics-grid article {
  padding: 22px;

  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-medium);
}

.statistics-grid article.offer-stat {
  background:
    linear-gradient(
      135deg,
      #f2fff7,
      #ffffff
    );

  border-color: #abefc6;
}

.statistics-grid span,
.statistics-grid strong,
.statistics-grid small {
  display: block;
}

.statistics-grid span {
  color: var(--text-secondary);
  font-size: 12px;
}

.statistics-grid strong {
  margin: 8px 0;
  font-size: 29px;
}

.statistics-grid small {
  color: var(--text-light);
}

.offer-stat strong {
  color: var(--success);
}

.toolbar-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  padding: 18px 20px;

  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-medium);
}

.filter-controls {
  display: grid;
  grid-template-columns:
    minmax(230px, 1fr)
    150px
    150px;

  gap: 10px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-actions > span {
  color: var(--text-light);
  font-size: 11px;
}

.pipeline-wrapper {
  max-width: 100%;
  overflow: hidden;
}

.pipeline-board {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns:
    minmax(285px, 1fr);

  gap: 14px;

  overflow-x: auto;
  padding-bottom: 12px;

  scroll-snap-type: x proximity;
}

.pipeline-column {
  min-height: 570px;
  padding: 14px;

  background: #f0f2f7;
  border: 2px solid transparent;
  border-radius: var(--radius-medium);

  scroll-snap-align: start;

  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.pipeline-column.drop-active {
  background: #eeedff;
  border-color: #918aff;
}

.column-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;

  min-height: 70px;
  padding: 5px 4px 12px;
}

.column-header h3 {
  margin: 0;
  font-size: 15px;
}

.column-header p {
  max-width: 200px;
  margin: 5px 0 0;

  color: var(--text-light);
  font-size: 10px;
  line-height: 1.5;
}

.column-header strong {
  display: grid;
  place-items: center;

  min-width: 30px;
  height: 30px;

  color: var(--primary-color);
  font-size: 12px;

  background: #ffffff;
  border-radius: 9px;
}

.column-applications {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-empty {
  display: grid;
  place-items: center;
  align-content: center;

  min-height: 220px;
  padding: 30px;

  color: var(--text-light);
  text-align: center;

  border: 1px dashed #cdd1da;
  border-radius: 13px;
}

.column-empty span {
  font-size: 28px;
}

.column-empty p {
  margin: 8px 0 0;
  font-size: 12px;
}

.usage-tip {
  padding: 18px 20px;

  background: var(--primary-light);
  border: 1px solid #d9d6ff;
  border-radius: var(--radius-medium);
}

.usage-tip strong {
  color: var(--primary-color);
  font-size: 12px;
}

.usage-tip p {
  margin: 6px 0 0;

  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 1050px) {
  .statistics-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .toolbar-card {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 760px) {
  .applications-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-actions :deep(.el-button) {
    flex: 1;
    margin-left: 0;
  }

  .filter-controls {
    grid-template-columns: 1fr;
  }

  .pipeline-board {
    grid-auto-columns:
      minmax(280px, calc(100vw - 76px));
  }
}

@media (max-width: 520px) {
  .applications-hero {
    padding: 23px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .pipeline-board {
    grid-auto-columns:
      calc(100vw - 64px);
  }
}
</style>