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

import {
  APPLICATION_STATUS_OPTIONS,
  RECRUITMENT_CHANNEL_OPTIONS,
} from '@/data/applicationOptions'

import type {
  ApplicationFormData,
  JobApplication,
} from '@/types/application'

const props = defineProps<{
  modelValue: boolean
  application: JobApplication | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: ApplicationFormData]
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

function createDefaultNextDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 3)

  return formatDateValue(date)
}

function createEmptyForm():
  ApplicationFormData {
  return {
    companyName: '',
    jobTitle: '',
    location: '',
    salaryRange: '',
    jobUrl: '',

    recruitmentChannel: '',
    contactName: '',
    contactInfo: '',

    status: 'wishlist',
    priority: 'medium',

    appliedAt: '',
    nextActionAt:
      createDefaultNextDate(),

    tags: [],
    notes: '',
  }
}

const form = reactive<ApplicationFormData>(
  createEmptyForm(),
)

const visible = computed({
  get: () => props.modelValue,

  set: (value: boolean) => {
    emit('update:modelValue', value)
  },
})

const dialogTitle = computed(() =>
  props.application
    ? '编辑投递记录'
    : '新增投递记录',
)

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
}

function syncForm(): void {
  const nextForm = props.application
    ? {
        companyName:
          props.application.companyName,

        jobTitle:
          props.application.jobTitle,

        location:
          props.application.location,

        salaryRange:
          props.application.salaryRange,

        jobUrl:
          props.application.jobUrl,

        recruitmentChannel:
          props.application
            .recruitmentChannel,

        contactName:
          props.application.contactName,

        contactInfo:
          props.application.contactInfo,

        status:
          props.application.status,

        priority:
          props.application.priority,

        appliedAt:
          props.application.appliedAt,

        nextActionAt:
          props.application.nextActionAt,

        tags: [
          ...props.application.tags,
        ],

        notes:
          props.application.notes,
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
      props.application,
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
    companyName: form.companyName,
    jobTitle: form.jobTitle,
    location: form.location,
    salaryRange: form.salaryRange,
    jobUrl: form.jobUrl,

    recruitmentChannel:
      form.recruitmentChannel,

    contactName: form.contactName,
    contactInfo: form.contactInfo,

    status: form.status,
    priority: form.priority,

    appliedAt: form.appliedAt,

    nextActionAt:
      form.nextActionAt,

    tags: [...form.tags],
    notes: form.notes,
  })

  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="min(760px, 94vw)"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <div class="form-grid">
        <el-form-item
          label="公司名称"
          prop="companyName"
        >
          <el-input
            v-model="form.companyName"
            placeholder="例如：某科技公司"
          />
        </el-form-item>

        <el-form-item
          label="岗位名称"
          prop="jobTitle"
        >
          <el-input
            v-model="form.jobTitle"
            placeholder="例如：前端开发实习生"
          />
        </el-form-item>

        <el-form-item label="工作地点">
          <el-input
            v-model="form.location"
            placeholder="例如：北京 / 远程"
          />
        </el-form-item>

        <el-form-item label="薪资范围">
          <el-input
            v-model="form.salaryRange"
            placeholder="例如：200～300 元/天"
          />
        </el-form-item>

        <el-form-item label="投递阶段">
          <el-select
            v-model="form.status"
            style="width: 100%"
          >
            <el-option
              v-for="option in APPLICATION_STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
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

        <el-form-item label="招聘渠道">
          <el-select
            v-model="
              form.recruitmentChannel
            "
            filterable
            allow-create
            default-first-option
            style="width: 100%"
            placeholder="选择或输入渠道"
          >
            <el-option
              v-for="channel in RECRUITMENT_CHANNEL_OPTIONS"
              :key="channel"
              :label="channel"
              :value="channel"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="岗位链接">
          <el-input
            v-model="form.jobUrl"
            placeholder="https://..."
          />
        </el-form-item>

        <el-form-item label="投递日期">
          <el-date-picker
            v-model="form.appliedAt"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="尚未投递可留空"
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="下一步行动日期">
          <el-date-picker
            v-model="form.nextActionAt"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="例如：跟进或面试日期"
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="联系人">
          <el-input
            v-model="form.contactName"
            placeholder="例如：招聘负责人"
          />
        </el-form-item>

        <el-form-item label="联系方式">
          <el-input
            v-model="form.contactInfo"
            placeholder="邮箱、电话或微信"
          />
        </el-form-item>
      </div>

      <el-form-item label="岗位标签">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="输入标签后按回车"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="5"
          maxlength="1000"
          show-word-limit
          placeholder="记录准备事项、沟通情况或面试安排"
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
          保存记录
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 620px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>