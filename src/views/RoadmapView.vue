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

import RoadmapTaskCard from '@/components/roadmap/RoadmapTaskCard.vue'

import RoadmapTaskDialog from '@/components/roadmap/RoadmapTaskDialog.vue'

import { useAnalysisStore } from '@/stores/analysis'
import { useRoadmapStore } from '@/stores/roadmap'

import type {
  RoadmapTask,
  RoadmapTaskFormData,
  RoadmapTaskPriority,
  RoadmapTaskSource,
  RoadmapTaskStatus,
} from '@/types/roadmap'

const analysisStore = useAnalysisStore()
const roadmapStore = useRoadmapStore()

const statusColumns: Array<{
  key: RoadmapTaskStatus
  title: string
  description: string
}> = [
  {
    key: 'todo',
    title: '待开始',
    description: '尚未开始的学习任务',
  },
  {
    key: 'doing',
    title: '进行中',
    description: '当前正在学习的内容',
  },
  {
    key: 'done',
    title: '已完成',
    description: '已经完成的学习成果',
  },
]

const priorityRanking: Record<
  RoadmapTaskPriority,
  number
> = {
  high: 0,
  medium: 1,
  low: 2,
}

const searchKeyword = ref('')

const priorityFilter = ref<
  'all' | RoadmapTaskPriority
>('all')

const sourceFilter = ref<
  'all' | RoadmapTaskSource
>('all')

const dialogVisible = ref(false)

const editingTask =
  ref<RoadmapTask | null>(null)

const draggedTaskId =
  ref<string | null>(null)

const dragOverStatus =
  ref<RoadmapTaskStatus | null>(null)

function compareTasks(
  first: RoadmapTask,
  second: RoadmapTask,
): number {
  const priorityDifference =
    priorityRanking[first.priority] -
    priorityRanking[second.priority]

  if (priorityDifference !== 0) {
    return priorityDifference
  }

  const dateDifference =
    first.dueDate.localeCompare(
      second.dueDate,
    )

  if (dateDifference !== 0) {
    return dateDifference
  }

  return second.updatedAt.localeCompare(
    first.updatedAt,
  )
}

const filteredTasksByStatus = computed(() => {
  const groups: Record<
    RoadmapTaskStatus,
    RoadmapTask[]
  > = {
    todo: [],
    doing: [],
    done: [],
  }

  const keyword =
    searchKeyword.value
      .trim()
      .toLowerCase()

  for (const task of roadmapStore.tasks) {
    const searchableContent = [
      task.title,
      task.description,
      task.skillName,
      task.sourceCompany ?? '',
      task.sourceJobTitle ?? '',
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
      task.priority !==
        priorityFilter.value
    ) {
      continue
    }

    if (
      sourceFilter.value !== 'all' &&
      task.source !== sourceFilter.value
    ) {
      continue
    }

    groups[task.status].push(task)
  }

  groups.todo.sort(compareTasks)
  groups.doing.sort(compareTasks)
  groups.done.sort(compareTasks)

  return groups
})

const filteredCount = computed(() => {
  return (
    filteredTasksByStatus.value.todo.length +
    filteredTasksByStatus.value.doing
      .length +
    filteredTasksByStatus.value.done.length
  )
})

function openCreateDialog(): void {
  editingTask.value = null
  dialogVisible.value = true
}

function openEditDialog(
  task: RoadmapTask,
): void {
  editingTask.value = task
  dialogVisible.value = true
}

function handleSaveTask(
  data: RoadmapTaskFormData,
): void {
  if (editingTask.value) {
    roadmapStore.updateTask(
      editingTask.value.id,
      data,
    )

    ElMessage.success('任务已更新')
  } else {
    roadmapStore.addTask(data)
    ElMessage.success('任务已创建')
  }

  editingTask.value = null
}

function handleChangeStatus(
  taskId: string,
  status: RoadmapTaskStatus,
): void {
  roadmapStore.moveTask(taskId, status)
}

function handleDragStart(
  taskId: string,
): void {
  draggedTaskId.value = taskId
}

function handleDragEnd(): void {
  draggedTaskId.value = null
  dragOverStatus.value = null
}

function handleDrop(
  status: RoadmapTaskStatus,
  event: DragEvent,
): void {
  const taskId =
    draggedTaskId.value ||
    event.dataTransfer?.getData(
      'text/plain',
    )

  if (!taskId) {
    return
  }

  roadmapStore.moveTask(taskId, status)

  draggedTaskId.value = null
  dragOverStatus.value = null
}

async function removeTask(
  task: RoadmapTask,
): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除任务“${task.title}”吗？`,
      '删除学习任务',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    roadmapStore.removeTask(task.id)

    ElMessage.success('任务已删除')
  } catch {
    // 用户取消删除时不做处理
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

  const createdCount =
    roadmapStore.importFromAnalysis(
      latestResult,
    )

  if (createdCount === 0) {
    ElMessage.info(
      '最新分析中的技能已经存在',
    )

    return
  }

  ElMessage.success(
    `已导入 ${createdCount} 个任务`,
  )
}

async function clearCompleted(): Promise<void> {
  if (roadmapStore.completedCount === 0) {
    ElMessage.info('当前没有已完成任务')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认删除全部 ${roadmapStore.completedCount} 个已完成任务吗？`,
      '清理已完成任务',
      {
        confirmButtonText: '确认清理',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const clearedCount =
      roadmapStore.clearCompleted()

    ElMessage.success(
      `已清理 ${clearedCount} 个任务`,
    )
  } catch {
    // 用户取消时不做处理
  }
}

function resetFilters(): void {
  searchKeyword.value = ''
  priorityFilter.value = 'all'
  sourceFilter.value = 'all'
}

onMounted(() => {
  roadmapStore.hydrate()
  analysisStore.hydrate()
})
</script>

<template>
  <div class="roadmap-page">
    <section class="roadmap-hero">
      <div>
        <span>PERSONAL LEARNING ROADMAP</span>

        <h2>
          把技能差距变成
          <em>可以完成的任务</em>
        </h2>

        <p>
          学习任务可以来自 JD 分析，也可以手动创建。
          按照优先级、截止日期和进度逐步完成。
        </p>
      </div>

      <div class="hero-actions">
        <el-button
          @click="importLatestAnalysis"
        >
          导入最新分析任务
        </el-button>

        <el-button
          type="primary"
          @click="openCreateDialog"
        >
          新建学习任务
        </el-button>
      </div>
    </section>

    <section class="statistics-grid">
      <article>
        <span>全部任务</span>
        <strong>
          {{ roadmapStore.totalCount }}
        </strong>
        <small>
          当前还有
          {{ roadmapStore.activeCount }}
          个未完成
        </small>
      </article>

      <article>
        <span>正在进行</span>
        <strong>
          {{ roadmapStore.doingCount }}
        </strong>
        <small>
          建议同时进行不超过 3 个
        </small>
      </article>

      <article>
        <span>任务完成率</span>
        <strong>
          {{ roadmapStore.completionRate }}%
        </strong>
        <small>
          平均进度
          {{ roadmapStore.averageProgress }}%
        </small>
      </article>

      <article
        :class="{
          danger:
            roadmapStore.overdueCount > 0,
        }"
      >
        <span>逾期任务</span>
        <strong>
          {{ roadmapStore.overdueCount }}
        </strong>
        <small>
          {{
            roadmapStore.overdueCount > 0
              ? '请优先处理逾期内容'
              : '当前没有逾期任务'
          }}
        </small>
      </article>
    </section>

    <section class="toolbar-card">
      <div class="filter-controls">
        <el-input
          v-model="searchKeyword"
          clearable
          placeholder="搜索任务、技能或公司"
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
          placeholder="任务来源"
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
          当前显示 {{ filteredCount }} 个任务
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
          @click="clearCompleted"
        >
          清理已完成
        </el-button>
      </div>
    </section>

    <section class="roadmap-board">
      <article
        v-for="column in statusColumns"
        :key="column.key"
        class="board-column"
        :class="{
          'drop-active':
            dragOverStatus === column.key,
        }"
        @dragover.prevent="
          dragOverStatus = column.key
        "
        @drop="
          handleDrop(column.key, $event)
        "
      >
        <header class="column-header">
          <div>
            <h3>{{ column.title }}</h3>
            <p>{{ column.description }}</p>
          </div>

          <strong>
            {{
              filteredTasksByStatus[
                column.key
              ].length
            }}
          </strong>
        </header>

        <div
          v-if="
            filteredTasksByStatus[
              column.key
            ].length
          "
          class="column-tasks"
        >
          <RoadmapTaskCard
            v-for="task in filteredTasksByStatus[
              column.key
            ]"
            :key="task.id"
            :task="task"
            @edit="openEditDialog(task)"
            @remove="removeTask(task)"
            @change-status="
              handleChangeStatus(
                task.id,
                $event,
              )
            "
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
          />
        </div>

        <div
          v-else
          class="column-empty"
        >
          <span>＋</span>

          <p>
            {{
              column.key === 'todo'
                ? '还没有待开始任务'
                : column.key === 'doing'
                  ? '暂时没有进行中的任务'
                  : '还没有完成任务'
            }}
          </p>
        </div>
      </article>
    </section>

    <section class="usage-tip">
      <strong>操作提示</strong>

      <p>
        电脑端可以将任务卡片拖动到其他列；
        手机端可以使用卡片底部的状态选择框。
        点击“编辑”可以填写实际进度和学习笔记。
      </p>
    </section>

    <RoadmapTaskDialog
      v-model="dialogVisible"
      :task="editingTask"
      @submit="handleSaveTask"
    />
  </div>
</template>

<style scoped>
.roadmap-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.roadmap-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;

  padding: 34px;

  color: #ffffff;

  background:
    radial-gradient(
      circle at 88% 8%,
      rgba(188, 184, 255, 0.45),
      transparent 31%
    ),
    linear-gradient(
      125deg,
      #242044,
      #5750ca
    );

  border-radius: var(--radius-large);
}

.roadmap-hero > div:first-child > span {
  color: #bdb8ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.roadmap-hero h2 {
  margin: 9px 0 10px;
  font-size: clamp(27px, 4vw, 40px);
}

.roadmap-hero h2 em {
  color: #c8ffde;
  font-style: normal;
}

.roadmap-hero p {
  max-width: 680px;
  margin: 0;

  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
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

.statistics-grid article.danger {
  border-color: #fda29b;
  background: #fffafa;
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

.statistics-grid .danger strong {
  color: var(--danger);
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
    minmax(220px, 1fr)
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

.roadmap-board {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(280px, 1fr));

  gap: 16px;
  align-items: start;
}

.board-column {
  min-height: 520px;
  padding: 15px;

  background: #f0f2f7;
  border: 2px solid transparent;
  border-radius: var(--radius-medium);

  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.board-column.drop-active {
  background: #eeedff;
  border-color: #918aff;
}

.column-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  margin-bottom: 14px;
  padding: 5px 4px 10px;
}

.column-header h3 {
  margin: 0;
  font-size: 16px;
}

.column-header p {
  margin: 5px 0 0;

  color: var(--text-light);
  font-size: 11px;
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

.column-tasks {
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

@media (max-width: 1200px) {
  .roadmap-board {
    grid-template-columns: 1fr;
  }

  .board-column {
    min-height: auto;
  }
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
  .roadmap-hero {
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
}

@media (max-width: 520px) {
  .roadmap-hero {
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
}
</style>