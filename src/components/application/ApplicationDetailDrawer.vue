<script setup lang="ts">
import { computed } from 'vue'

import {
  APPLICATION_PRIORITY_LABELS,
  APPLICATION_STATUS_LABELS,
} from '@/data/applicationOptions'

import type {
  JobApplication,
} from '@/types/application'

const props = defineProps<{
  modelValue: boolean
  application: JobApplication | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  edit: []
}>()

const visible = computed({
  get: () => props.modelValue,

  set: (value: boolean) => {
    emit('update:modelValue', value)
  },
})

function formatDateTime(
  value: string,
): string {
  if (!value) {
    return '未填写'
  }

  return new Intl.DateTimeFormat(
    'zh-CN',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(new Date(value))
}

function formatDate(value: string): string {
  if (!value) {
    return '未填写'
  }

  return new Intl.DateTimeFormat(
    'zh-CN',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  ).format(
    new Date(`${value}T00:00:00`),
  )
}
</script>

<template>
  <el-drawer
    v-model="visible"
    title="投递详情"
    size="min(620px, 94vw)"
  >
    <div
      v-if="application"
      class="detail-content"
    >
      <header class="detail-header">
        <span>
          {{ application.companyName }}
        </span>

        <h2>
          {{ application.jobTitle }}
        </h2>

        <div>
          <el-tag type="primary">
            {{
              APPLICATION_STATUS_LABELS[
                application.status
              ]
            }}
          </el-tag>

          <el-tag effect="plain">
            {{
              APPLICATION_PRIORITY_LABELS[
                application.priority
              ]
            }}
          </el-tag>

          <el-tag
            v-if="
              application.matchScore !== null
            "
            type="success"
            effect="plain"
          >
            JD 匹配度
            {{ application.matchScore }}%
          </el-tag>
        </div>
      </header>

      <section class="detail-section">
        <h3>岗位信息</h3>

        <dl>
          <dt>工作地点</dt>
          <dd>
            {{
              application.location ||
              '未填写'
            }}
          </dd>

          <dt>薪资范围</dt>
          <dd>
            {{
              application.salaryRange ||
              '未填写'
            }}
          </dd>

          <dt>招聘渠道</dt>
          <dd>
            {{
              application
                .recruitmentChannel ||
              '未填写'
            }}
          </dd>

          <dt>投递日期</dt>
          <dd>
            {{
              formatDate(
                application.appliedAt,
              )
            }}
          </dd>

          <dt>下一步日期</dt>
          <dd>
            {{
              formatDate(
                application.nextActionAt,
              )
            }}
          </dd>

          <dt>联系人</dt>
          <dd>
            {{
              application.contactName ||
              '未填写'
            }}
          </dd>

          <dt>联系方式</dt>
          <dd>
            {{
              application.contactInfo ||
              '未填写'
            }}
          </dd>
        </dl>

        <a
          v-if="application.jobUrl"
          :href="application.jobUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          打开招聘页面
        </a>
      </section>

      <section
        v-if="application.tags.length"
        class="detail-section"
      >
        <h3>岗位标签</h3>

        <div class="tag-list">
          <el-tag
            v-for="tag in application.tags"
            :key="tag"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>
      </section>

      <section class="detail-section">
        <h3>备注</h3>

        <p class="notes">
          {{
            application.notes ||
            '暂未填写备注'
          }}
        </p>
      </section>

      <section class="detail-section">
        <h3>流程记录</h3>

        <el-timeline>
          <el-timeline-item
            v-for="item in [
              ...application.history,
            ].reverse()"
            :key="item.id"
            :timestamp="
              formatDateTime(item.createdAt)
            "
            placement="top"
          >
            <strong>
              {{
                APPLICATION_STATUS_LABELS[
                  item.status
                ]
              }}
            </strong>

            <p>{{ item.note }}</p>
          </el-timeline-item>
        </el-timeline>
      </section>

      <section
        v-if="application.jdSnapshot"
        class="detail-section"
      >
        <h3>原始招聘 JD</h3>

        <pre class="jd-snapshot">{{
          application.jdSnapshot
        }}</pre>
      </section>
    </div>

    <template #footer>
      <el-button
        type="primary"
        :disabled="!application"
        @click="$emit('edit')"
      >
        编辑投递记录
      </el-button>
    </template>
  </el-drawer>
</template>

<style scoped>
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-header {
  padding: 24px;

  color: #ffffff;

  background:
    radial-gradient(
      circle at 90% 5%,
      rgba(255, 255, 255, 0.2),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #302b63,
      #635bff
    );

  border-radius: 18px;
}

.detail-header > span {
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
}

.detail-header h2 {
  margin: 7px 0 15px;
}

.detail-header > div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-section {
  padding: 20px;

  background: #f8f9fc;
  border-radius: 14px;
}

.detail-section h3 {
  margin-bottom: 16px;
  font-size: 16px;
}

.detail-section dl {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 12px 16px;

  margin: 0 0 16px;
}

.detail-section dt {
  color: var(--text-light);
  font-size: 12px;
}

.detail-section dd {
  margin: 0;
  color: var(--text-main);
  font-size: 13px;
}

.detail-section > a {
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 700;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.notes {
  margin: 0;

  color: var(--text-secondary);
  line-height: 1.75;

  white-space: pre-wrap;
}

:deep(.el-timeline-item__content p) {
  margin: 5px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.jd-snapshot {
  max-height: 360px;
  overflow: auto;

  margin: 0;
  padding: 16px;

  color: var(--text-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 1.7;

  white-space: pre-wrap;

  background: #ffffff;
  border-radius: 10px;
}

@media (max-width: 480px) {
  .detail-section dl {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .detail-section dd {
    margin-bottom: 10px;
  }
}
</style>