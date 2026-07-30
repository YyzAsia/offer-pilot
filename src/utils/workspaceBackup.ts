import type {
  AnalysisResult,
} from '@/types/analyzer'

import type {
  JobApplication,
} from '@/types/application'

import type {
  RoadmapTask,
} from '@/types/roadmap'

const STORAGE_KEYS = {
  analysis:
    'offer-pilot-analysis-history',

  roadmap:
    'offer-pilot-roadmap-tasks',

  applications:
    'offer-pilot-job-applications',
} as const

export interface WorkspaceBackup {
  appName: 'OfferPilot'
  version: 1
  exportedAt: string

  data: {
    analysisHistory:
      AnalysisResult[]

    roadmapTasks:
      RoadmapTask[]

    applications:
      JobApplication[]
  }
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null
  )
}

function readArrayFromStorage<T>(
  key: string,
): T[] {
  try {
    const rawData =
      localStorage.getItem(key)

    if (!rawData) {
      return []
    }

    const parsedData =
      JSON.parse(rawData) as unknown

    return Array.isArray(parsedData)
      ? (parsedData as T[])
      : []
  } catch {
    return []
  }
}

function isWorkspaceBackup(
  value: unknown,
): value is WorkspaceBackup {
  if (!isRecord(value)) {
    return false
  }

  if (
    value.appName !== 'OfferPilot' ||
    value.version !== 1 ||
    !isRecord(value.data)
  ) {
    return false
  }

  return (
    Array.isArray(
      value.data.analysisHistory,
    ) &&
    Array.isArray(
      value.data.roadmapTasks,
    ) &&
    Array.isArray(
      value.data.applications,
    )
  )
}

function formatFilenameDate(): string {
  const date = new Date()

  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function createWorkspaceBackup():
  WorkspaceBackup {
  return {
    appName: 'OfferPilot',
    version: 1,

    exportedAt:
      new Date().toISOString(),

    data: {
      analysisHistory:
        readArrayFromStorage<AnalysisResult>(
          STORAGE_KEYS.analysis,
        ),

      roadmapTasks:
        readArrayFromStorage<RoadmapTask>(
          STORAGE_KEYS.roadmap,
        ),

      applications:
        readArrayFromStorage<JobApplication>(
          STORAGE_KEYS.applications,
        ),
    },
  }
}

export function downloadWorkspaceBackup():
  WorkspaceBackup {
  const backup =
    createWorkspaceBackup()

  const jsonContent =
    JSON.stringify(
      backup,
      null,
      2,
    )

  const blob = new Blob(
    [jsonContent],
    {
      type: 'application/json',
    },
  )

  const objectUrl =
    URL.createObjectURL(blob)

  const anchor =
    document.createElement('a')

  anchor.href = objectUrl

  anchor.download =
    `offer-pilot-backup-${formatFilenameDate()}.json`

  document.body.appendChild(anchor)

  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(objectUrl)

  return backup
}

export function readWorkspaceBackupFile(
  file: File,
): Promise<WorkspaceBackup> {
  return new Promise(
    (resolve, reject) => {
      const reader = new FileReader()

      reader.addEventListener(
        'load',
        () => {
          try {
            if (
              typeof reader.result !==
              'string'
            ) {
              throw new Error(
                '无法读取备份文件',
              )
            }

            const parsedData =
              JSON.parse(
                reader.result,
              ) as unknown

            if (
              !isWorkspaceBackup(
                parsedData,
              )
            ) {
              throw new Error(
                '文件不是有效的 OfferPilot 备份',
              )
            }

            resolve(parsedData)
          } catch (error) {
            reject(
              error instanceof Error
                ? error
                : new Error(
                    '备份文件解析失败',
                  ),
            )
          }
        },
      )

      reader.addEventListener(
        'error',
        () => {
          reject(
            new Error(
              '备份文件读取失败',
            ),
          )
        },
      )

      reader.readAsText(file)
    },
  )
}

export function restoreWorkspaceBackup(
  backup: WorkspaceBackup,
): void {
  localStorage.setItem(
    STORAGE_KEYS.analysis,

    JSON.stringify(
      backup.data.analysisHistory,
    ),
  )

  localStorage.setItem(
    STORAGE_KEYS.roadmap,

    JSON.stringify(
      backup.data.roadmapTasks,
    ),
  )

  localStorage.setItem(
    STORAGE_KEYS.applications,

    JSON.stringify(
      backup.data.applications,
    ),
  )
}

export function clearWorkspaceData():
  void {
  localStorage.removeItem(
    STORAGE_KEYS.analysis,
  )

  localStorage.removeItem(
    STORAGE_KEYS.roadmap,
  )

  localStorage.removeItem(
    STORAGE_KEYS.applications,
  )
}