import { defineStore } from 'pinia'

import type { AnalysisResult } from '@/types/analyzer'

import type {
  RoadmapTask,
  RoadmapTaskFormData,
  RoadmapTaskPriority,
  RoadmapTaskStatus,
} from '@/types/roadmap'

interface RoadmapState {
  tasks: RoadmapTask[]
  hydrated: boolean
}

const STORAGE_KEY = 'offer-pilot-roadmap-tasks'

const priorityOrder: Record<
  RoadmapTaskPriority,
  number
> = {
  high: 0,
  medium: 1,
  low: 2,
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`
}

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

function createDefaultDueDate(
  priority: RoadmapTaskPriority,
): string {
  const date = new Date()

  const daysToAdd: Record<
    RoadmapTaskPriority,
    number
  > = {
    high: 3,
    medium: 7,
    low: 14,
  }

  date.setDate(
    date.getDate() + daysToAdd[priority],
  )

  return formatDateValue(date)
}

function saveTasks(tasks: RoadmapTask[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks),
  )
}

function isTaskOverdue(
  task: RoadmapTask,
): boolean {
  if (
    task.status === 'done' ||
    !task.dueDate
  ) {
    return false
  }

  const dueTime = new Date(
    `${task.dueDate}T23:59:59`,
  ).getTime()

  return dueTime < Date.now()
}

function sortTasks(
  tasks: RoadmapTask[],
): RoadmapTask[] {
  return [...tasks].sort(
    (first, second) => {
      const priorityDifference =
        priorityOrder[first.priority] -
        priorityOrder[second.priority]

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
    },
  )
}

export const useRoadmapStore = defineStore(
  'roadmap',
  {
    state: (): RoadmapState => ({
      tasks: [],
      hydrated: false,
    }),

    getters: {
      totalCount(state): number {
        return state.tasks.length
      },

      activeCount(state): number {
        return state.tasks.filter(
          (task) => task.status !== 'done',
        ).length
      },

      todoCount(state): number {
        return state.tasks.filter(
          (task) => task.status === 'todo',
        ).length
      },

      doingCount(state): number {
        return state.tasks.filter(
          (task) => task.status === 'doing',
        ).length
      },

      completedCount(state): number {
        return state.tasks.filter(
          (task) => task.status === 'done',
        ).length
      },

      completionRate(state): number {
        if (state.tasks.length === 0) {
          return 0
        }

        const completedCount =
          state.tasks.filter(
            (task) => task.status === 'done',
          ).length

        return Math.round(
          (completedCount /
            state.tasks.length) *
            100,
        )
      },

      averageProgress(state): number {
        if (state.tasks.length === 0) {
          return 0
        }

        const totalProgress =
          state.tasks.reduce(
            (total, task) =>
              total + task.progress,
            0,
          )

        return Math.round(
          totalProgress / state.tasks.length,
        )
      },

      overdueCount(state): number {
        return state.tasks.filter(
          isTaskOverdue,
        ).length
      },

      focusTasks(state): RoadmapTask[] {
        const activeTasks =
          state.tasks.filter(
            (task) => task.status !== 'done',
          )

        return sortTasks(activeTasks).slice(
          0,
          3,
        )
      },
    },

    actions: {
      hydrate(): void {
        if (this.hydrated) {
          return
        }

        try {
          const savedData =
            localStorage.getItem(STORAGE_KEY)

          if (!savedData) {
            this.hydrated = true
            return
          }

          const parsedData = JSON.parse(
            savedData,
          ) as unknown

          if (Array.isArray(parsedData)) {
            this.tasks =
              parsedData as RoadmapTask[]
          }
        } catch (error) {
          console.error(
            '读取学习任务失败：',
            error,
          )

          this.tasks = []
        } finally {
          this.hydrated = true
        }
      },

      persist(): void {
        saveTasks(this.tasks)
      },

      importFromAnalysis(
        result: AnalysisResult,
      ): number {
        const existingSkillIds = new Set(
          this.tasks.flatMap((task) =>
            task.skillId
              ? [task.skillId]
              : [],
          ),
        )

        const now = new Date().toISOString()

        const createdTasks: RoadmapTask[] =
          []

        for (const draft of result.learningTasks) {
          if (
            existingSkillIds.has(draft.skillId)
          ) {
            continue
          }

          existingSkillIds.add(draft.skillId)

          const priority:
            | 'high'
            | 'medium' =
            draft.priority

          createdTasks.push({
            id: createId('roadmap-task'),
            title: draft.title,
            description: draft.description,

            skillId: draft.skillId,
            skillName: draft.skillName,

            status: 'todo',
            priority,
            progress: 0,

            dueDate:
              createDefaultDueDate(priority),

            estimatedHours:
              priority === 'high' ? 6 : 4,

            notes: '',

            source: 'analysis',

            sourceAnalysisId: result.id,

            sourceCompany:
              result.companyName,

            sourceJobTitle:
              result.jobTitle,

            createdAt: now,
            updatedAt: now,
            completedAt: null,
          })
        }

        if (createdTasks.length === 0) {
          return 0
        }

        this.tasks = [
          ...createdTasks,
          ...this.tasks,
        ]

        this.persist()

        return createdTasks.length
      },

      addTask(
        input: RoadmapTaskFormData,
      ): RoadmapTask {
        const now = new Date().toISOString()

        const progress =
          input.status === 'done'
            ? 100
            : Math.min(
                Math.max(input.progress, 0),
                99,
              )

        const task: RoadmapTask = {
          id: createId('roadmap-task'),

          title: input.title.trim(),

          description:
            input.description.trim(),

          skillId: null,
          skillName: input.skillName.trim(),

          status: input.status,
          priority: input.priority,
          progress,

          dueDate: input.dueDate,

          estimatedHours:
            input.estimatedHours,

          notes: input.notes.trim(),

          source: 'manual',

          sourceAnalysisId: null,
          sourceCompany: null,
          sourceJobTitle: null,

          createdAt: now,
          updatedAt: now,

          completedAt:
            input.status === 'done'
              ? now
              : null,
        }

        this.tasks.unshift(task)
        this.persist()

        return task
      },

      updateTask(
        id: string,
        input: RoadmapTaskFormData,
        ): RoadmapTask | null {
        const taskIndex = this.tasks.findIndex(
            (task) => task.id === id,
        )

        if (taskIndex === -1) {
            return null
        }

        const originalTask = this.tasks[taskIndex]

        // 开启 noUncheckedIndexedAccess 后，
        // 通过数组下标获取的元素仍可能被判断为 undefined。
        if (!originalTask) {
            return null
        }

        const now = new Date().toISOString()

        let progress = Math.min(
            Math.max(input.progress, 0),
            100,
        )

        if (input.status === 'todo') {
            progress = 0
        }

        if (input.status === 'doing') {
            progress = Math.min(
            Math.max(progress, 10),
            99,
            )
        }

        if (input.status === 'done') {
            progress = 100
        }

        const updatedTask: RoadmapTask = {
            ...originalTask,

            title: input.title.trim(),

            description:
            input.description.trim(),

            skillName: input.skillName.trim(),

            status: input.status,
            priority: input.priority,
            progress,

            dueDate: input.dueDate,

            estimatedHours:
            input.estimatedHours,

            notes: input.notes.trim(),

            updatedAt: now,

            completedAt:
            input.status === 'done'
                ? originalTask.completedAt ?? now
                : null,
        }

        this.tasks.splice(
            taskIndex,
            1,
            updatedTask,
        )

        this.persist()

        return updatedTask
        },

      moveTask(
        id: string,
        status: RoadmapTaskStatus,
      ): void {
        const task = this.tasks.find(
          (item) => item.id === id,
        )

        if (!task || task.status === status) {
          return
        }

        const now = new Date().toISOString()

        task.status = status
        task.updatedAt = now

        if (status === 'todo') {
          task.progress = 0
          task.completedAt = null
        }

        if (status === 'doing') {
          task.progress = Math.min(
            Math.max(task.progress, 10),
            99,
          )

          task.completedAt = null
        }

        if (status === 'done') {
          task.progress = 100
          task.completedAt = now
        }

        this.persist()
      },

      removeTask(id: string): boolean {
        const originalLength =
          this.tasks.length

        this.tasks = this.tasks.filter(
          (task) => task.id !== id,
        )

        const removed =
          this.tasks.length !== originalLength

        if (removed) {
          this.persist()
        }

        return removed
      },

      clearCompleted(): number {
        const completedCount =
          this.tasks.filter(
            (task) => task.status === 'done',
          ).length

        if (completedCount === 0) {
          return 0
        }

        this.tasks = this.tasks.filter(
          (task) => task.status !== 'done',
        )

        this.persist()

        return completedCount
      },
    },
  },
)