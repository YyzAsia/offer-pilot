<script setup lang="ts">
import { computed } from 'vue'

import { SKILL_CATEGORY_LABELS } from '@/data/skillDictionary'

import type {
  AnalysisResult,
  DetectedSkill,
} from '@/types/analyzer'

const props = defineProps<{
  result: AnalysisResult
}>()

defineEmits<{
  reanalyze: []
}>()

const scoreColor = computed(() => {
  if (props.result.score >= 80) {
    return '#12b76a'
  }

  if (props.result.score >= 60) {
    return '#635bff'
  }

  if (props.result.score >= 40) {
    return '#f79009'
  }

  return '#f04438'
})

function getSkillType(
  skill: DetectedSkill,
): 'success' | 'warning' | 'info' {
  if (skill.mastered) {
    return 'success'
  }

  if (skill.importance === 'bonus') {
    return 'info'
  }

  return 'warning'
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
</script>

<template>
  <section class="result-card">
    <header class="result-header">
      <div>
        <span class="eyebrow">
          ANALYSIS RESULT
        </span>

        <h2>
          {{ result.companyName }} ·
          {{ result.jobTitle }}
        </h2>

        <p>
          分析时间：
          {{ formatDate(result.createdAt) }}
        </p>
      </div>

      <el-button @click="$emit('reanalyze')">
        重新填写
      </el-button>
    </header>

    <section class="score-section">
      <div class="score-number">
        <strong>{{ result.score }}</strong>
        <span>岗位匹配度</span>
      </div>

      <div class="score-content">
        <h3>{{ result.readinessLabel }}</h3>
        <p>{{ result.summary }}</p>

        <el-progress
          :percentage="result.score"
          :stroke-width="12"
          :color="scoreColor"
        />
      </div>
    </section>

    <section class="summary-grid">
      <article>
        <span>识别技能</span>
        <strong>
          {{ result.detectedSkills.length }}
        </strong>
      </article>

      <article>
        <span>已掌握</span>
        <strong>
          {{ result.masteredSkills.length }}
        </strong>
      </article>

      <article>
        <span>待补技能</span>
        <strong>
          {{ result.missingSkills.length }}
        </strong>
      </article>

      <article>
        <span>命中关键词</span>
        <strong>
          {{ result.keywordCount }}
        </strong>
      </article>
    </section>

    <section class="result-section">
      <header>
        <div>
          <span>SKILL REQUIREMENTS</span>
          <h3>岗位技能要求</h3>
        </div>
      </header>

      <div
        v-if="result.detectedSkills.length"
        class="skill-grid"
      >
        <article
          v-for="skill in result.detectedSkills"
          :key="skill.id"
          class="skill-card"
        >
          <div class="skill-card-header">
            <div>
              <strong>{{ skill.name }}</strong>
              <small>
                {{
                  SKILL_CATEGORY_LABELS[
                    skill.category
                  ]
                }}
              </small>
            </div>

            <el-tag
              :type="getSkillType(skill)"
              effect="light"
            >
              {{
                skill.mastered
                  ? '已掌握'
                  : skill.importance === 'bonus'
                    ? '加分项'
                    : '待补充'
              }}
            </el-tag>
          </div>

          <div class="keyword-list">
            <span
              v-for="keyword in skill.matchedKeywords"
              :key="keyword"
            >
              {{ keyword }}
            </span>
          </div>

          <p v-if="skill.matchedSentences[0]">
            “{{ skill.matchedSentences[0] }}”
          </p>
        </article>
      </div>

      <el-empty
        v-else
        description="没有识别到技能要求"
      />
    </section>

    <section class="result-section">
      <header>
        <div>
          <span>LEARNING TASKS</span>
          <h3>推荐学习任务</h3>
        </div>
      </header>

      <div
        v-if="result.learningTasks.length"
        class="task-list"
      >
        <article
          v-for="task in result.learningTasks"
          :key="task.id"
          class="task-card"
        >
          <div class="task-priority">
            <span
              :class="{
                high: task.priority === 'high',
              }"
            ></span>

            {{
              task.priority === 'high'
                ? '高优先级'
                : '中优先级'
            }}
          </div>

          <h4>{{ task.title }}</h4>
          <p>{{ task.description }}</p>
        </article>
      </div>

      <el-empty
        v-else
        description="当前没有需要补充的技能"
      />
    </section>
  </section>
</template>

<style scoped>
.result-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.result-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;

  padding: 28px;

  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-medium);
}

.eyebrow,
.result-section header span {
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.result-header h2 {
  margin: 7px 0 5px;
  font-size: 24px;
}

.result-header p {
  margin: 0;
  color: var(--text-light);
  font-size: 12px;
}

.score-section {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 34px;
  align-items: center;

  padding: 32px;

  color: #ffffff;
  background:
    radial-gradient(
      circle at 90% 0%,
      rgba(255, 255, 255, 0.2),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #302b63,
      #635bff
    );

  border-radius: var(--radius-large);
}

.score-number {
  text-align: center;
}

.score-number strong,
.score-number span {
  display: block;
}

.score-number strong {
  font-size: 72px;
  line-height: 1;
}

.score-number span {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
}

.score-content h3 {
  margin-bottom: 8px;
  font-size: 23px;
}

.score-content p {
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.7;
}

:deep(.el-progress__text) {
  color: #ffffff;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.summary-grid article {
  padding: 21px;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-medium);
}

.summary-grid span,
.summary-grid strong {
  display: block;
}

.summary-grid span {
  color: var(--text-secondary);
  font-size: 12px;
}

.summary-grid strong {
  margin-top: 7px;
  font-size: 28px;
}

.result-section {
  padding: 28px;

  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-medium);
}

.result-section header {
  margin-bottom: 20px;
}

.result-section header h3 {
  margin: 4px 0 0;
  font-size: 20px;
}

.skill-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.skill-card {
  padding: 18px;

  background: #f8f9fc;
  border: 1px solid #edf0f5;
  border-radius: 13px;
}

.skill-card-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.skill-card strong,
.skill-card small {
  display: block;
}

.skill-card strong {
  font-size: 15px;
}

.skill-card small {
  margin-top: 4px;
  color: var(--text-light);
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 15px;
}

.keyword-list span {
  padding: 4px 8px;

  color: var(--primary-color);
  font-size: 11px;

  background: var(--primary-light);
  border-radius: 999px;
}

.skill-card p {
  margin: 14px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.65;
}

.task-list {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.task-card {
  padding: 19px;
  background: #f8f9fc;
  border-radius: 13px;
}

.task-priority {
  display: flex;
  align-items: center;
  gap: 7px;

  color: var(--text-light);
  font-size: 11px;
}

.task-priority span {
  width: 8px;
  height: 8px;

  background: #f79009;
  border-radius: 50%;
}

.task-priority span.high {
  background: #f04438;
}

.task-card h4 {
  margin: 11px 0 7px;
}

.task-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.65;
}

@media (max-width: 780px) {
  .score-section {
    grid-template-columns: 1fr;
  }

  .score-number {
    text-align: left;
  }

  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .skill-grid,
  .task-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .result-header {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .result-header,
  .result-section,
  .score-section {
    padding: 21px;
  }
}
</style>