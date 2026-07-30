<script setup lang="ts">
import { computed } from 'vue'

import type {
  RoadmapTask,
  RoadmapTaskStatus,
} from '@/types/roadmap'

const props = defineProps<{
  task: RoadmapTask
}>()

const emit = defineEmits<{
  edit: []
  remove: []
  'change-status': [
    status: RoadmapTaskStatus,
  ]
  'drag-start': [id: string]
  'drag-end': []
}>()

const priorityLabels = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级',
}

const statusOptions: Array<{
  label: string
  value: RoadmapTaskStatus
}> = [
  {
    label: '待开始',
    value: 'todo',
  },
  {
    label: '进行中',
    value: 'doing',
  },
  {
    label: '已完成',
    value: 'done',
  },
]

const isOverdue = computed(() => {
  if (
    props.task.status === 'done' ||
    !props.task.dueDate
  ) {
    return false
  }

  const dueTime = new Date(
    `${props.task.dueDate}T23:59:59`,
  ).getTime()

  return dueTime < Date.now()
})

const formattedDueDate = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
  }).format(
    new Date(
      `${props.task.dueDate}T00:00:00`,
    ),
  )
})

function handleStatusChange(
  status: RoadmapTaskStatus,
): void {
  emit('change-status', status)
}

function handleDragStart(
  event: DragEvent,
): void {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed =
      'move'

    event.dataTransfer.setData(
      'text/plain',
      props.task.id,
    )
  }

  emit('drag-start', props.task.id)
}
</script>

<template>
  <article
    class="task-card"
    :class="{
      overdue: isOverdue,
      completed: task.status === 'done',
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="$emit('drag-end')"
  >
    <header class="task-header">
      <div class="tag-list">
        <span
          class="priority-tag"
          :class="task.priority"
        >
          {{ priorityLabels[task.priority] }}
        </span>

        <el-tag
          size="small"
          effect="plain"
          :type="
            task.source === 'analysis'
              ? 'primary'
              : 'info'
          "
        >
          {{
            task.source === 'analysis'
              ? 'JD 生成'
              : '手动创建'
          }}
        </el-tag>
      </div>

      <button
        class="remove-button"
        type="button"
        aria-label="删除任务"
        @click.stop="$emit('remove')"
      >
        ×
      </button>
    </header>

    <div class="task-content">
      <span class="skill-name">
        {{ task.skillName }}
      </span>

      <h4>{{ task.title }}</h4>

      <p>
        {{
          task.description ||
          '暂未填写任务说明'
        }}
      </p>
    </div>

    <div
      v-if="task.sourceCompany"
      class="source-info"
    >
      来自：
      {{ task.sourceCompany }} ·
      {{ task.sourceJobTitle }}
    </div>

    <div class="task-meta">
      <span
        :class="{
          danger: isOverdue,
        }"
      >
        {{
          isOverdue
            ? '已逾期'
            : '截止'
        }}
        {{ formattedDueDate }}
      </span>

      <span>
        预计 {{ task.estimatedHours }} 小时
      </span>
    </div>

    <div class="progress-section">
      <div>
        <span>学习进度</span>
        <strong>
          {{ task.progress }}%
        </strong>
      </div>

      <el-progress
        :percentage="task.progress"
        :show-text="false"
        :stroke-width="7"
      />
    </div>

    <footer
      class="task-footer"
      @mousedown.stop
    >
      <el-select
        :model-value="task.status"
        size="small"
        @change="handleStatusChange"
      >
        <el-option
          v-for="option in statusOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>

      <el-button
        link
        type="primary"
        @click.stop="$emit('edit')"
      >
        编辑
      </el-button>
    </footer>
  </article>
</template>

<style scoped>
.task-card {
  padding: 17px;

  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 14px;

  box-shadow:
    0 8px 20px rgba(16, 24, 40, 0.04);

  cursor: grab;

  transition:
    border-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
}

.task-card:hover {
  border-color: #c9c6ff;

  box-shadow:
    0 12px 28px rgba(16, 24, 40, 0.08);

  transform: translateY(-2px);
}

.task-card:active {
  cursor: grabbing;
}

.task-card.overdue {
  border-color: #fda29b;
}

.task-card.completed {
  opacity: 0.76;
}

.task-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.priority-tag {
  display: inline-flex;
  align-items: center;

  min-height: 24px;
  padding: 0 9px;

  font-size: 11px;
  font-weight: 700;

  border-radius: 999px;
}

.priority-tag.high {
  color: #b42318;
  background: #fee4e2;
}

.priority-tag.medium {
  color: #b54708;
  background: #fef0c7;
}

.priority-tag.low {
  color: #026aa2;
  background: #e0f2fe;
}

.remove-button {
  display: grid;
  place-items: center;

  width: 28px;
  height: 28px;

  color: var(--text-light);
  font-size: 20px;

  background: transparent;
  border-radius: 8px;
  cursor: pointer;
}

.remove-button:hover {
  color: var(--danger);
  background: #fff1f0;
}

.task-content {
  margin-top: 17px;
}

.skill-name {
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 800;
}

.task-content h4 {
  margin: 6px 0 8px;

  font-size: 15px;
  line-height: 1.5;
}

.task-content p {
  display: -webkit-box;
  overflow: hidden;

  margin: 0;

  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.65;

  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.source-info {
  margin-top: 13px;
  padding: 9px 10px;

  color: var(--text-secondary);
  font-size: 11px;

  background: #f8f9fc;
  border-radius: 8px;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;

  margin-top: 15px;

  color: var(--text-light);
  font-size: 11px;
}

.task-meta .danger {
  color: var(--danger);
  font-weight: 700;
}

.progress-section {
  margin-top: 17px;
}

.progress-section > div {
  display: flex;
  justify-content: space-between;

  margin-bottom: 7px;

  color: var(--text-secondary);
  font-size: 11px;
}

.progress-section strong {
  color: var(--primary-color);
}

.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  margin-top: 17px;
  padding-top: 15px;

  border-top: 1px solid var(--border);
}

.task-footer :deep(.el-select) {
  width: 112px;
}
</style>