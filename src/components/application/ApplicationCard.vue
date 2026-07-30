<script setup lang="ts">
import { computed } from 'vue'

import {
  APPLICATION_PRIORITY_LABELS,
  APPLICATION_STATUS_OPTIONS,
} from '@/data/applicationOptions'

import type {
  ApplicationStatus,
  JobApplication,
} from '@/types/application'

const props = defineProps<{
  application: JobApplication
}>()

const emit = defineEmits<{
  edit: []
  view: []
  remove: []

  'change-status': [
    status: ApplicationStatus,
  ]

  'drag-start': [id: string]
  'drag-end': []
}>()

const isTerminal = computed(
  () =>
    props.application.status ===
      'offer' ||
    props.application.status ===
      'rejected',
)

const isOverdue = computed(() => {
  if (
    isTerminal.value ||
    !props.application.nextActionAt
  ) {
    return false
  }

  const actionTime = new Date(
    `${props.application.nextActionAt}T23:59:59`,
  ).getTime()

  return actionTime < Date.now()
})

const formattedNextAction = computed(() => {
  if (!props.application.nextActionAt) {
    return ''
  }

  return new Intl.DateTimeFormat(
    'zh-CN',
    {
      month: 'short',
      day: 'numeric',
    },
  ).format(
    new Date(
      `${props.application.nextActionAt}T00:00:00`,
    ),
  )
})

function handleStatusChange(
  status: ApplicationStatus,
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
      props.application.id,
    )
  }

  emit(
    'drag-start',
    props.application.id,
  )
}
</script>

<template>
  <article
    class="application-card"
    :class="{
      overdue: isOverdue,
      terminal: isTerminal,
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="$emit('drag-end')"
  >
    <header class="card-header">
      <div class="tag-row">
        <span
          class="priority-tag"
          :class="application.priority"
        >
          {{
            APPLICATION_PRIORITY_LABELS[
              application.priority
            ]
          }}
        </span>

        <el-tag
          v-if="
            application.matchScore !== null
          "
          size="small"
          effect="plain"
          type="primary"
        >
          匹配度
          {{ application.matchScore }}%
        </el-tag>
      </div>

      <button
        type="button"
        class="remove-button"
        aria-label="删除投递记录"
        @click.stop="$emit('remove')"
      >
        ×
      </button>
    </header>

    <div class="company-info">
      <span>
        {{ application.companyName }}
      </span>

      <h4>
        {{ application.jobTitle }}
      </h4>

      <p>
        {{
          [
            application.location,
            application.salaryRange,
          ]
            .filter(Boolean)
            .join(' · ') ||
          '暂未填写地点和薪资'
        }}
      </p>
    </div>

    <div
      v-if="application.tags.length"
      class="skill-tags"
    >
      <span
        v-for="tag in application.tags.slice(
          0,
          4,
        )"
        :key="tag"
      >
        {{ tag }}
      </span>
    </div>

    <div class="application-meta">
      <span>
        {{
          application.recruitmentChannel ||
          '未填写渠道'
        }}
      </span>

      <span
        v-if="application.nextActionAt"
        :class="{ danger: isOverdue }"
      >
        {{
          isOverdue
            ? '下一步已逾期'
            : '下一步'
        }}
        {{ formattedNextAction }}
      </span>
    </div>

    <a
      v-if="application.jobUrl"
      :href="application.jobUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="job-link"
      @click.stop
      @mousedown.stop
    >
      查看招聘页面
    </a>

    <footer
      class="card-footer"
      @mousedown.stop
    >
      <el-select
        :model-value="
          application.status
        "
        size="small"
        @change="handleStatusChange"
      >
        <el-option
          v-for="option in APPLICATION_STATUS_OPTIONS"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>

      <div>
        <el-button
          link
          @click.stop="$emit('view')"
        >
          详情
        </el-button>

        <el-button
          link
          type="primary"
          @click.stop="$emit('edit')"
        >
          编辑
        </el-button>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.application-card {
  padding: 17px;

  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 14px;

  box-shadow:
    0 8px 20px rgba(16, 24, 40, 0.04);

  cursor: grab;

  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
}

.application-card:hover {
  border-color: #c9c6ff;

  box-shadow:
    0 13px 30px rgba(16, 24, 40, 0.08);

  transform: translateY(-2px);
}

.application-card:active {
  cursor: grabbing;
}

.application-card.overdue {
  border-color: #fda29b;
}

.application-card.terminal {
  opacity: 0.78;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.tag-row {
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

.company-info {
  margin-top: 16px;
}

.company-info > span {
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 800;
}

.company-info h4 {
  margin: 6px 0 7px;
  font-size: 16px;
  line-height: 1.45;
}

.company-info p {
  margin: 0;

  color: var(--text-secondary);
  font-size: 12px;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  margin-top: 14px;
}

.skill-tags span {
  padding: 4px 8px;

  color: var(--primary-color);
  font-size: 10px;

  background: var(--primary-light);
  border-radius: 999px;
}

.application-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 7px 12px;

  margin-top: 15px;

  color: var(--text-light);
  font-size: 11px;
}

.application-meta .danger {
  color: var(--danger);
  font-weight: 700;
}

.job-link {
  display: inline-block;
  margin-top: 12px;

  color: var(--primary-color);
  font-size: 11px;
  font-weight: 700;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  margin-top: 17px;
  padding-top: 15px;

  border-top: 1px solid var(--border);
}

.card-footer :deep(.el-select) {
  width: 116px;
}
</style>