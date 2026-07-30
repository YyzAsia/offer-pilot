<script setup lang="ts">
import {
  ref,
} from 'vue'

import {
  ElMessage,
  ElMessageBox,
} from 'element-plus'

import {
  clearWorkspaceData,
  downloadWorkspaceBackup,
  readWorkspaceBackupFile,
  restoreWorkspaceBackup,
} from '@/utils/workspaceBackup'

const fileInputRef =
  ref<HTMLInputElement | null>(null)

const importing = ref(false)

function handleExport(): void {
  const backup =
    downloadWorkspaceBackup()

  const totalCount =
    backup.data.analysisHistory.length +
    backup.data.roadmapTasks.length +
    backup.data.applications.length

  ElMessage.success(
    `备份已导出，共包含 ${totalCount} 条数据`,
  )
}

function openFileSelector(): void {
  fileInputRef.value?.click()
}

async function handleFileChange(
  event: Event,
): Promise<void> {
  const input =
    event.target as HTMLInputElement

  const file = input.files?.[0]

  input.value = ''

  if (!file) {
    return
  }

  if (
    !file.name
      .toLowerCase()
      .endsWith('.json')
  ) {
    ElMessage.warning(
      '请选择 JSON 格式的备份文件',
    )

    return
  }

  importing.value = true

  try {
    const backup =
      await readWorkspaceBackupFile(
        file,
      )

    const analysisCount =
      backup.data.analysisHistory.length

    const taskCount =
      backup.data.roadmapTasks.length

    const applicationCount =
      backup.data.applications.length

    await ElMessageBox.confirm(
      `即将导入：${analysisCount} 条分析记录、${taskCount} 个学习任务和 ${applicationCount} 条投递记录。当前数据将被覆盖。`,
      '确认导入备份',
      {
        confirmButtonText: '确认导入',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    restoreWorkspaceBackup(backup)

    ElMessage.success(
      '数据导入成功，页面即将刷新',
    )

    window.setTimeout(() => {
      window.location.reload()
    }, 600)
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  } finally {
    importing.value = false
  }
}

async function handleClear():
  Promise<void> {
  try {
    await ElMessageBox.confirm(
      '该操作将删除浏览器中的所有分析、学习任务和投递数据。建议先导出备份。',
      '确认清空全部数据',
      {
        confirmButtonText: '确认清空',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    clearWorkspaceData()

    ElMessage.success(
      '全部数据已经清空',
    )

    window.setTimeout(() => {
      window.location.reload()
    }, 500)
  } catch {
    // 用户取消时不处理
  }
}
</script>

<template>
  <section class="management-card">
    <header>
      <span>LOCAL DATA MANAGEMENT</span>

      <h3>项目数据管理</h3>

      <p>
        当前版本的数据保存在浏览器中。
        可以导出备份，在其他浏览器中恢复。
      </p>
    </header>

    <div class="management-grid">
      <article>
        <div class="icon purple">
          ↓
        </div>

        <h4>导出数据</h4>

        <p>
          下载包含分析、学习任务和投递记录的 JSON 文件。
        </p>

        <el-button
          type="primary"
          plain
          @click="handleExport"
        >
          导出 JSON 备份
        </el-button>
      </article>

      <article>
        <div class="icon blue">
          ↑
        </div>

        <h4>导入数据</h4>

        <p>
          从 OfferPilot JSON 备份恢复项目数据。
        </p>

        <el-button
          :loading="importing"
          @click="openFileSelector"
        >
          选择备份文件
        </el-button>

        <input
          ref="fileInputRef"
          class="file-input"
          type="file"
          accept=".json,application/json"
          @change="handleFileChange"
        />
      </article>

      <article>
        <div class="icon red">
          ×
        </div>

        <h4>清空数据</h4>

        <p>
          删除当前浏览器保存的全部项目数据。
        </p>

        <el-button
          type="danger"
          plain
          @click="handleClear"
        >
          清空全部数据
        </el-button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.management-card {
  padding: 26px;

  background: #ffffff;

  border:
    1px solid var(--border);

  border-radius:
    var(--radius-medium);
}

.management-card > header > span {
  color: var(--primary-color);

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.management-card > header h3 {
  margin: 4px 0 6px;
  font-size: 20px;
}

.management-card > header p {
  margin: 0;

  color: var(--text-secondary);
  font-size: 12px;
}

.management-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 14px;

  margin-top: 21px;
}

.management-grid article {
  display: flex;
  align-items: flex-start;
  flex-direction: column;

  padding: 19px;

  background: #f8f9fc;
  border-radius: 13px;
}

.icon {
  display: grid;
  place-items: center;

  width: 38px;
  height: 38px;

  font-size: 20px;
  font-weight: 800;

  border-radius: 11px;
}

.icon.purple {
  color: #635bff;
  background: #eeedff;
}

.icon.blue {
  color: #1570ef;
  background: #eaf2ff;
}

.icon.red {
  color: #d92d20;
  background: #fee4e2;
}

.management-grid h4 {
  margin: 15px 0 7px;
}

.management-grid p {
  flex: 1;

  margin: 0 0 17px;

  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.7;
}

.file-input {
  display: none;
}

@media (max-width: 800px) {
  .management-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .management-card {
    padding: 21px;
  }

  .management-grid article
  :deep(.el-button) {
    width: 100%;
  }
}
</style>