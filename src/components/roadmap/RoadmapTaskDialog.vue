<script setup lang="ts">
import {
  computed,
  nextTick,
  reactive,
  ref,
  watch,
} from 'vue'

import type {
  FormInstance,
  FormRules,
} from 'element-plus'

import type {
  RoadmapTask,
  RoadmapTaskFormData,
} from '@/types/roadmap'

const props = defineProps<{
  modelValue: boolean
  task: RoadmapTask | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: RoadmapTaskFormData]
}>()

const formRef = ref<FormInstance>()

function formatDateValue(date: Date): string {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(date.getDate()).padStart(
    2,
    '0',
  )

  return `${year}-${month}-${day}`
}

function createDefaultDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7)

  return formatDateValue(date)
}

function createEmptyForm(): RoadmapTaskFormData {
  return {
    title: '',
    description: '',
    skillName: '',
    status: 'todo',
    priority: 'medium',
    progress: 0,
    dueDate: createDefaultDate(),
    estimatedHours: 4,
    notes: '',
  }
}

const form = reactive<RoadmapTaskFormData>(
  createEmptyForm(),
)

const visible = computed({
  get: () => props.modelValue,

  set: (value: boolean) => {
    emit('update:modelValue', value)
  },
})

const dialogTitle = computed(() =>
  props.task
    ? '编辑学习任务'
    : '新建学习任务',
)

const rules: FormRules = {
  title: [
    {
      required: true,
      message: '请输入任务标题',
      trigger: 'blur',
    },
    {
      min: 2,
      max: 60,
      message: '标题长度应为 2～60 个字符',
      trigger: 'blur',
    },
  ],

  skillName: [
    {
      required: true,
      message: '请输入关联技能',
      trigger: 'blur',
    },
  ],

  dueDate: [
    {
      required: true,
      message: '请选择截止日期',
      trigger: 'change',
    },
  ],
}

function syncForm(): void {
  const nextForm = props.task
    ? {
        title: props.task.title,

        description:
          props.task.description,

        skillName: props.task.skillName,

        status: props.task.status,
        priority: props.task.priority,
        progress: props.task.progress,

        dueDate: props.task.dueDate,

        estimatedHours:
          props.task.estimatedHours,

        notes: props.task.notes,
      }
    : createEmptyForm()

  Object.assign(form, nextForm)

  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

watch(
  () =>
    [
      props.modelValue,
      props.task,
    ] as const,

  ([isVisible]) => {
    if (isVisible) {
      syncForm()
    }
  },

  {
    immediate: true,
  },
)

async function handleSubmit(): Promise<void> {
  if (!formRef.value) {
    return
  }

  const valid = await formRef.value
    .validate()
    .catch(() => false)

  if (!valid) {
    return
  }

  emit('submit', {
    title: form.title,
    description: form.description,
    skillName: form.skillName,

    status: form.status,
    priority: form.priority,
    progress: form.progress,

    dueDate: form.dueDate,

    estimatedHours:
      form.estimatedHours,

    notes: form.notes,
  })

  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="min(640px, 92vw)"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <el-form-item
        label="任务标题"
        prop="title"
      >
        <el-input
          v-model="form.title"
          maxlength="60"
          show-word-limit
          placeholder="例如：掌握 Vue Router 路由守卫"
        />
      </el-form-item>

      <div class="form-grid">
        <el-form-item
          label="关联技能"
          prop="skillName"
        >
          <el-input
            v-model="form.skillName"
            placeholder="例如：Vue 3"
          />
        </el-form-item>

        <el-form-item label="任务状态">
          <el-select
            v-model="form.status"
            style="width: 100%"
          >
            <el-option
              label="待开始"
              value="todo"
            />

            <el-option
              label="进行中"
              value="doing"
            />

            <el-option
              label="已完成"
              value="done"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-select
            v-model="form.priority"
            style="width: 100%"
          >
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
        </el-form-item>

        <el-form-item
          label="截止日期"
          prop="dueDate"
        >
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择截止日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="预计学习时间">
          <el-input-number
            v-model="form.estimatedHours"
            :min="1"
            :max="100"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />

          <small class="field-tip">
            单位：小时
          </small>
        </el-form-item>
      </div>

      <el-form-item label="当前进度">
        <div class="progress-editor">
          <el-slider
            v-model="form.progress"
            :min="0"
            :max="100"
            :step="5"
          />

          <strong>
            {{ form.progress }}%
          </strong>
        </div>
      </el-form-item>

      <el-form-item label="任务说明">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          placeholder="说明该任务需要学习或完成哪些内容"
        />
      </el-form-item>

      <el-form-item label="学习笔记">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="4"
          maxlength="1000"
          show-word-limit
          placeholder="记录资料地址、学习结论或遇到的问题"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button
          @click="visible = false"
        >
          取消
        </el-button>

        <el-button
          type="primary"
          @click="handleSubmit"
        >
          保存任务
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.field-tip {
  display: block;
  margin-top: 6px;
  color: var(--text-light);
}

.progress-editor {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) 50px;
  gap: 18px;
  align-items: center;

  width: 100%;
}

.progress-editor strong {
  color: var(--primary-color);
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>