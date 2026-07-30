<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  reactive,
  ref,
} from 'vue'

import {
  ElMessage,
  ElMessageBox,
} from 'element-plus'

import type {
  FormInstance,
  FormRules,
} from 'element-plus'

import AnalysisResultView from '@/components/analyzer/AnalysisResult.vue'

import {
  SKILL_CATEGORY_LABELS,
  skillDictionary,
} from '@/data/skillDictionary'

import { useAnalysisStore } from '@/stores/analysis'

import type {
  AnalysisInput,
  AnalysisResult,
  SkillCategory,
} from '@/types/analyzer'

import { analyzeJobDescription } from '@/utils/jdAnalyzer'
import { useRoadmapStore } from '@/stores/roadmap'

const analysisStore = useAnalysisStore()
const roadmapStore = useRoadmapStore()

const formRef = ref<FormInstance>()
const resultSectionRef =
  ref<HTMLElement | null>(null)

const analyzing = ref(false)

const currentResult =
  ref<AnalysisResult | null>(null)

const form = reactive<AnalysisInput>({
  companyName: '',
  jobTitle: '',
  jdText: '',
  masteredSkillIds: [],
})

const rules: FormRules = {
  companyName: [
    {
      required: true,
      message: '请输入公司名称',
      trigger: 'blur',
    },
  ],

  jobTitle: [
    {
      required: true,
      message: '请输入岗位名称',
      trigger: 'blur',
    },
  ],

  jdText: [
    {
      required: true,
      message: '请粘贴招聘 JD',
      trigger: 'blur',
    },
    {
      min: 50,
      message: 'JD 内容至少需要 50 个字符',
      trigger: 'blur',
    },
  ],
}

const categoryOrder: SkillCategory[] = [
  'foundation',
  'framework',
  'engineering',
  'backend',
  'computer-science',
  'platform',
]

const skillGroups = computed(() =>
  categoryOrder.map((category) => ({
    category,
    label: SKILL_CATEGORY_LABELS[category],
    skills: skillDictionary.filter(
      (skill) => skill.category === category,
    ),
  })),
)

const sampleJD = `职位名称：Web 前端开发实习生

岗位职责：
1. 参与客户端 H5、微信 H5、PC Web 和微信小程序的日常需求开发；
2. 与产品、设计和后端团队合作，完成页面和业务功能；
3. 优化用户体验，提升前端研发质量和效率。

任职要求：
1. 计算机相关专业，本科及以上学历；
2. 具备良好的计算机基础，包括数据结构、操作系统和网络协议；
3. 掌握 HTML、CSS 和 JavaScript；
4. 熟悉 Vue 3、TypeScript、Vue Router 和 Pinia；
5. 了解 Git、Vite、HTTP、跨域和浏览器缓存；
6. 具备良好的学习能力和责任心。

加分项：
1. 有 Node.js 或 Express 开发经验者优先；
2. 有微信小程序开发经验者优先；
3. 了解前端自动化测试和性能优化。`

function loadSample(): void {
  form.companyName = '示例科技公司'
  form.jobTitle = 'Web 前端开发实习生'
  form.jdText = sampleJD

  form.masteredSkillIds = [
    'html',
    'css',
    'javascript',
    'git',
  ]

  formRef.value?.clearValidate()

  ElMessage.success('已填入示例招聘 JD')
}

async function handleAnalyze(): Promise<void> {
  if (!formRef.value) {
    return
  }

  const valid = await formRef.value
    .validate()
    .catch(() => false)

  if (!valid) {
    ElMessage.warning(
      '请先完善岗位信息和招聘 JD',
    )
    return
  }

  analyzing.value = true

  try {
    await new Promise((resolve) =>
      window.setTimeout(resolve, 450),
    )

    const result = analyzeJobDescription({
      companyName: form.companyName,
      jobTitle: form.jobTitle,
      jdText: form.jdText,
      masteredSkillIds: [
        ...form.masteredSkillIds,
      ],
    })

    if (result.detectedSkills.length === 0) {
      ElMessage.warning(
        '没有识别到明确技能，请检查 JD 内容',
      )
      return
    }

    analysisStore.addResult(result)
    currentResult.value = result

    ElMessage.success('JD 分析完成')

    await nextTick()

    resultSectionRef.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  } finally {
    analyzing.value = false
  }
}

function resetForm(): void {
  formRef.value?.resetFields()
  form.masteredSkillIds = []
  currentResult.value = null
}

function selectHistory(
  result: AnalysisResult,
): void {
  currentResult.value = result

  nextTick(() => {
    resultSectionRef.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

async function removeHistory(
  result: AnalysisResult,
): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除“${result.companyName} · ${result.jobTitle}”的分析记录吗？`,
      '删除分析记录',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    analysisStore.removeResult(result.id)

    if (currentResult.value?.id === result.id) {
      currentResult.value =
        analysisStore.currentResult
    }

    ElMessage.success('分析记录已删除')
  } catch {
    // 用户取消删除时不做处理
  }
}

function addCurrentResultToRoadmap(): void {
  if (!currentResult.value) {
    ElMessage.warning(
      '当前没有可以导入的分析结果',
    )

    return
  }

  const createdCount =
    roadmapStore.importFromAnalysis(
      currentResult.value,
    )

  if (createdCount === 0) {
    ElMessage.info(
      '这些技能已经存在于学习路线中',
    )

    return
  }

  ElMessage.success(
    `已新增 ${createdCount} 个学习任务`,
  )
}

onMounted(() => {
  analysisStore.hydrate()
  roadmapStore.hydrate()

  currentResult.value =
    analysisStore.currentResult
})
</script>

<template>
  <div class="analyzer-page">
    <section class="intro-banner">
      <div>
        <span>JD INTELLIGENCE ENGINE</span>

        <h2>
          把招聘要求转化成
          <em>可执行的学习计划</em>
        </h2>

        <p>
          粘贴招聘 JD，系统将识别技能要求、
          判断技能差距并生成针对性的学习任务。
        </p>
      </div>

      <div class="engine-status">
        <span></span>
        本地规则引擎已就绪
      </div>
    </section>

    <section class="workspace-grid">
      <article class="form-card">
        <header class="card-header">
          <div>
            <span>STEP 01</span>
            <h3>填写岗位信息</h3>
          </div>

          <el-button @click="loadSample">
            使用示例 JD
          </el-button>
        </header>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
        >
          <div class="basic-fields">
            <el-form-item
              label="公司名称"
              prop="companyName"
            >
              <el-input
                v-model="form.companyName"
                placeholder="例如：某科技公司"
                clearable
              />
            </el-form-item>

            <el-form-item
              label="岗位名称"
              prop="jobTitle"
            >
              <el-input
                v-model="form.jobTitle"
                placeholder="例如：前端开发实习生"
                clearable
              />
            </el-form-item>
          </div>

          <el-form-item
            label="招聘 JD"
            prop="jdText"
          >
            <el-input
              v-model="form.jdText"
              type="textarea"
              :rows="13"
              maxlength="5000"
              show-word-limit
              placeholder="请粘贴完整招聘要求，包括岗位职责、任职要求和加分项……"
            />
          </el-form-item>

          <section class="mastered-section">
            <div class="section-title">
              <span>STEP 02</span>
              <h3>选择你已经掌握的技能</h3>
              <p>
                匹配度将根据岗位要求和你选择的技能计算。
              </p>
            </div>

            <el-checkbox-group
              v-model="form.masteredSkillIds"
              class="skill-selector"
            >
              <section
                v-for="group in skillGroups"
                :key="group.category"
                class="skill-group"
              >
                <h4>{{ group.label }}</h4>

                <div>
                  <el-checkbox
                    v-for="skill in group.skills"
                    :key="skill.id"
                    :value="skill.id"
                  >
                    {{ skill.name }}
                  </el-checkbox>
                </div>
              </section>
            </el-checkbox-group>
          </section>

          <div class="form-actions">
            <el-button @click="resetForm">
              清空内容
            </el-button>

            <el-button
              type="primary"
              :loading="analyzing"
              @click="handleAnalyze"
            >
              {{
                analyzing
                  ? '正在分析'
                  : '开始分析岗位'
              }}
            </el-button>
          </div>
        </el-form>
      </article>

      <aside class="history-card">
        <header class="card-header">
          <div>
            <span>HISTORY</span>
            <h3>最近分析</h3>
          </div>

          <strong>
            {{ analysisStore.totalCount }}
          </strong>
        </header>

        <div
          v-if="analysisStore.history.length"
          class="history-list"
        >
          <article
            v-for="item in analysisStore.history.slice(
              0,
              6,
            )"
            :key="item.id"
            class="history-item"
          >
            <button
              type="button"
              @click="selectHistory(item)"
            >
              <span>{{ item.companyName }}</span>
              <strong>{{ item.jobTitle }}</strong>
              <small>
                匹配度 {{ item.score }}%
              </small>
            </button>

            <button
              class="delete-button"
              type="button"
              aria-label="删除分析记录"
              @click="removeHistory(item)"
            >
              ×
            </button>
          </article>
        </div>

        <el-empty
          v-else
          :image-size="80"
          description="暂无分析记录"
        />

        <div class="history-tip">
          <strong>分析说明</strong>
          <p>
            当前版本采用关键词和权重规则分析，
            后续将增加后端存储和更复杂的语义分析。
          </p>
        </div>
      </aside>
    </section>

    <section
      v-if="currentResult"
      ref="resultSectionRef"
      class="result-wrapper"
    >
      <AnalysisResultView
        :result="currentResult"
        @reanalyze="resetForm"
        @add-to-roadmap="
            addCurrentResultToRoadmap
        "
       />
    </section>
  </div>
</template>

<style scoped>
.analyzer-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.intro-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;

  padding: 32px;

  color: #ffffff;
  background:
    radial-gradient(
      circle at 90% 10%,
      rgba(182, 177, 255, 0.42),
      transparent 30%
    ),
    linear-gradient(
      125deg,
      #28244f,
      #5750ca
    );

  border-radius: var(--radius-large);
}

.intro-banner > div > span {
  color: #bdb8ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.intro-banner h2 {
  margin: 9px 0 10px;
  font-size: clamp(25px, 4vw, 38px);
}

.intro-banner h2 em {
  color: #c8ffde;
  font-style: normal;
}

.intro-banner p {
  max-width: 690px;
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

.engine-status {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 0 0 auto;

  padding: 12px 15px;

  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;

  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}

.engine-status span {
  width: 8px;
  height: 8px;

  background: #55e595;
  border-radius: 50%;
  box-shadow: 0 0 12px #55e595;
}

.workspace-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) 310px;
  gap: 20px;
  align-items: start;
}

.form-card,
.history-card {
  padding: 27px;

  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-medium);
}

.history-card {
  position: sticky;
  top: 112px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;

  margin-bottom: 24px;
}

.card-header span,
.section-title > span {
  color: var(--primary-color);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.card-header h3,
.section-title h3 {
  margin: 4px 0 0;
  font-size: 19px;
}

.card-header > strong {
  color: var(--primary-color);
  font-size: 26px;
}

.basic-fields {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.mastered-section {
  margin-top: 30px;
  padding-top: 27px;
  border-top: 1px solid var(--border);
}

.section-title p {
  margin: 7px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.skill-selector {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 14px;

  margin-top: 20px;
}

.skill-group {
  padding: 16px;
  background: #f8f9fc;
  border-radius: 12px;
}

.skill-group h4 {
  margin: 0 0 10px;
  font-size: 13px;
}

.skill-group > div {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 14px;
}

:deep(.el-checkbox) {
  margin-right: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  margin-top: 28px;
  padding-top: 24px;

  border-top: 1px solid var(--border);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  position: relative;

  display: flex;
  align-items: stretch;

  overflow: hidden;
  background: #f8f9fc;
  border: 1px solid transparent;
  border-radius: 12px;

  transition:
    border-color 0.2s,
    transform 0.2s;
}

.history-item:hover {
  border-color: #cbc8ff;
  transform: translateY(-1px);
}

.history-item > button:first-child {
  flex: 1;
  padding: 14px;

  color: inherit;
  text-align: left;

  background: transparent;
  cursor: pointer;
}

.history-item span,
.history-item strong,
.history-item small {
  display: block;
}

.history-item span {
  color: var(--primary-color);
  font-size: 11px;
}

.history-item strong {
  margin: 4px 0;
  font-size: 13px;
}

.history-item small {
  color: var(--text-light);
}

.delete-button {
  width: 38px;

  color: var(--text-light);
  font-size: 20px;

  background: transparent;
  cursor: pointer;
}

.delete-button:hover {
  color: var(--danger);
  background: #fff0ef;
}

.history-tip {
  margin-top: 20px;
  padding: 16px;

  background: var(--primary-light);
  border-radius: 12px;
}

.history-tip strong {
  color: var(--primary-color);
  font-size: 12px;
}

.history-tip p {
  margin: 7px 0 0;

  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.65;
}

.result-wrapper {
  scroll-margin-top: 110px;
}

@media (max-width: 1080px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .history-card {
    position: static;
  }

  .history-list {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .intro-banner {
    align-items: flex-start;
    flex-direction: column;
  }

  .basic-fields,
  .skill-selector {
    grid-template-columns: 1fr;
  }

  .history-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .intro-banner,
  .form-card,
  .history-card {
    padding: 21px;
  }

  .form-actions {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .form-actions :deep(.el-button) {
    width: 100%;
    margin-left: 0;
  }
}
</style>