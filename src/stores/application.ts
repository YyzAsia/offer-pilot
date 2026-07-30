import { defineStore } from 'pinia'

import type { AnalysisResult } from '@/types/analyzer'

import type {
  ApplicationFormData,
  ApplicationHistoryItem,
  ApplicationPriority,
  ApplicationSource,
  ApplicationStatus,
  JobApplication,
} from '@/types/application'

interface ApplicationState {
  applications: JobApplication[]
  hydrated: boolean
}

interface ApplicationMetadata {
  source?: ApplicationSource
  sourceAnalysisId?: string | null
  matchScore?: number | null
  jdSnapshot?: string
}

const STORAGE_KEY =
  'offer-pilot-job-applications'

const TERMINAL_STATUSES =
  new Set<ApplicationStatus>([
    'offer',
    'rejected',
  ])

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

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function createFutureDate(days: number): string {
  const date = new Date()

  date.setDate(date.getDate() + days)

  return formatDateValue(date)
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

function normalizeTags(tags: string[]): string[] {
  const cleanedTags = tags
    .map((tag) => tag.trim())
    .filter(Boolean)

  return [...new Set(cleanedTags)].slice(0, 8)
}

function saveApplications(
  applications: JobApplication[],
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(applications),
  )
}

function createHistoryItem(
  status: ApplicationStatus,
  note: string,
): ApplicationHistoryItem {
  return {
    id: createId('application-history'),
    status,
    createdAt: new Date().toISOString(),
    note,
  }
}

export const useApplicationStore = defineStore(
  'applications',
  {
    state: (): ApplicationState => ({
      applications: [],
      hydrated: false,
    }),

    getters: {
      totalCount(state): number {
        return state.applications.length
      },

      activeCount(state): number {
        return state.applications.filter(
          (application) =>
            !TERMINAL_STATUSES.has(
              application.status,
            ),
        ).length
      },

      submittedCount(state): number {
        return state.applications.filter(
          (application) =>
            application.status !== 'wishlist',
        ).length
      },

      interviewCount(state): number {
        return state.applications.filter(
          (application) =>
            application.status ===
              'interview-1' ||
            application.status ===
              'interview-2',
        ).length
      },

      offerCount(state): number {
        return state.applications.filter(
          (application) =>
            application.status === 'offer',
        ).length
      },

      rejectedCount(state): number {
        return state.applications.filter(
          (application) =>
            application.status === 'rejected',
        ).length
      },

      interviewRate(state): number {
        const submittedApplications =
          state.applications.filter(
            (application) =>
              application.status !==
              'wishlist',
          )

        if (
          submittedApplications.length === 0
        ) {
          return 0
        }

        const progressedApplications =
          submittedApplications.filter(
            (application) =>
              application.status ===
                'written-test' ||
              application.status ===
                'interview-1' ||
              application.status ===
                'interview-2' ||
              application.status ===
                'offer',
          )

        return Math.round(
          (progressedApplications.length /
            submittedApplications.length) *
            100,
        )
      },

      statusCounts(
        state,
      ): Record<ApplicationStatus, number> {
        const counts: Record<
          ApplicationStatus,
          number
        > = {
          wishlist: 0,
          applied: 0,
          'written-test': 0,
          'interview-1': 0,
          'interview-2': 0,
          offer: 0,
          rejected: 0,
        }

        for (
          const application of
          state.applications
        ) {
          counts[application.status] += 1
        }

        return counts
      },

      recentApplications(
        state,
      ): JobApplication[] {
        return [...state.applications]
          .sort((first, second) =>
            second.updatedAt.localeCompare(
              first.updatedAt,
            ),
          )
          .slice(0, 5)
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
            this.applications =
              parsedData as JobApplication[]
          }
        } catch (error) {
          console.error(
            '读取投递记录失败：',
            error,
          )

          this.applications = []
        } finally {
          this.hydrated = true
        }
      },

      persist(): void {
        saveApplications(this.applications)
      },

      findDuplicate(
        companyName: string,
        jobTitle: string,
        excludeId?: string,
      ): JobApplication | null {
        const normalizedCompany =
          normalizeText(companyName)

        const normalizedTitle =
          normalizeText(jobTitle)

        return (
          this.applications.find(
            (application) =>
              application.id !== excludeId &&
              normalizeText(
                application.companyName,
              ) === normalizedCompany &&
              normalizeText(
                application.jobTitle,
              ) === normalizedTitle,
          ) ?? null
        )
      },

      addApplication(
        input: ApplicationFormData,
        metadata: ApplicationMetadata = {},
      ): JobApplication | null {
        const duplicate =
          this.findDuplicate(
            input.companyName,
            input.jobTitle,
          )

        if (duplicate) {
          return null
        }

        const now = new Date().toISOString()

        const appliedAt =
          input.status === 'wishlist'
            ? input.appliedAt
            : input.appliedAt ||
              formatDateValue(new Date())

        const nextActionAt =
          TERMINAL_STATUSES.has(input.status)
            ? ''
            : input.nextActionAt ||
              createFutureDate(3)

        const application: JobApplication = {
          id: createId('application'),

          companyName:
            input.companyName.trim(),

          jobTitle: input.jobTitle.trim(),

          location: input.location.trim(),

          salaryRange:
            input.salaryRange.trim(),

          jobUrl: input.jobUrl.trim(),

          recruitmentChannel:
            input.recruitmentChannel.trim(),

          contactName:
            input.contactName.trim(),

          contactInfo:
            input.contactInfo.trim(),

          status: input.status,
          priority: input.priority,

          appliedAt,
          nextActionAt,

          tags: normalizeTags(input.tags),

          notes: input.notes.trim(),

          source:
            metadata.source ?? 'manual',

          sourceAnalysisId:
            metadata.sourceAnalysisId ??
            null,

          matchScore:
            metadata.matchScore ?? null,

          jdSnapshot:
            metadata.jdSnapshot ?? '',

          history: [
            createHistoryItem(
              input.status,
              '创建投递记录',
            ),
          ],

          createdAt: now,
          updatedAt: now,
        }

        this.applications.unshift(
          application,
        )

        this.persist()

        return application
      },

      createFromAnalysis(
        result: AnalysisResult,
      ): JobApplication | null {
        const existingByAnalysis =
          this.applications.find(
            (application) =>
              application.sourceAnalysisId ===
              result.id,
          )

        if (existingByAnalysis) {
          return null
        }

        const priority:
          ApplicationPriority =
          result.score >= 80
            ? 'high'
            : result.score >= 60
              ? 'medium'
              : 'low'

        return this.addApplication(
          {
            companyName:
              result.companyName,

            jobTitle: result.jobTitle,

            location: '',
            salaryRange: '',
            jobUrl: '',

            recruitmentChannel:
              'JD 分析',

            contactName: '',
            contactInfo: '',

            status: 'wishlist',
            priority,

            appliedAt: '',

            nextActionAt:
              createFutureDate(2),

            tags: result.detectedSkills
              .slice(0, 5)
              .map((skill) => skill.name),

            notes: result.summary,
          },
          {
            source: 'analysis',

            sourceAnalysisId:
              result.id,

            matchScore: result.score,

            jdSnapshot:
              result.originalText,
          },
        )
      },

      updateApplication(
        id: string,
        input: ApplicationFormData,
      ): JobApplication | null {
        const applicationIndex =
          this.applications.findIndex(
            (application) =>
              application.id === id,
          )

        if (applicationIndex === -1) {
          return null
        }

        const originalApplication =
          this.applications[
            applicationIndex
          ]

        if (!originalApplication) {
          return null
        }

        const duplicate =
          this.findDuplicate(
            input.companyName,
            input.jobTitle,
            id,
          )

        if (duplicate) {
          return null
        }

        const now = new Date().toISOString()

        const statusChanged =
          originalApplication.status !==
          input.status

        const history = Array.isArray(
          originalApplication.history,
        )
          ? [...originalApplication.history]
          : []

        if (statusChanged) {
          history.push(
            createHistoryItem(
              input.status,
              `状态变更为 ${input.status}`,
            ),
          )
        }

        const appliedAt =
          input.status === 'wishlist'
            ? input.appliedAt
            : input.appliedAt ||
              originalApplication.appliedAt ||
              formatDateValue(new Date())

        const nextActionAt =
          TERMINAL_STATUSES.has(input.status)
            ? ''
            : input.nextActionAt

        const updatedApplication:
          JobApplication = {
          ...originalApplication,

          companyName:
            input.companyName.trim(),

          jobTitle: input.jobTitle.trim(),

          location: input.location.trim(),

          salaryRange:
            input.salaryRange.trim(),

          jobUrl: input.jobUrl.trim(),

          recruitmentChannel:
            input.recruitmentChannel.trim(),

          contactName:
            input.contactName.trim(),

          contactInfo:
            input.contactInfo.trim(),

          status: input.status,
          priority: input.priority,

          appliedAt,
          nextActionAt,

          tags: normalizeTags(input.tags),

          notes: input.notes.trim(),

          history,

          updatedAt: now,
        }

        this.applications.splice(
          applicationIndex,
          1,
          updatedApplication,
        )

        this.persist()

        return updatedApplication
      },

      moveApplication(
        id: string,
        status: ApplicationStatus,
      ): void {
        const application =
          this.applications.find(
            (item) => item.id === id,
          )

        if (
          !application ||
          application.status === status
        ) {
          return
        }

        const now = new Date().toISOString()

        application.status = status
        application.updatedAt = now

        if (
          status !== 'wishlist' &&
          !application.appliedAt
        ) {
          application.appliedAt =
            formatDateValue(new Date())
        }

        if (TERMINAL_STATUSES.has(status)) {
          application.nextActionAt = ''
        } else if (
          !application.nextActionAt
        ) {
          application.nextActionAt =
            createFutureDate(3)
        }

        if (
          !Array.isArray(application.history)
        ) {
          application.history = []
        }

        application.history.push(
          createHistoryItem(
            status,
            `将投递阶段变更为 ${status}`,
          ),
        )

        this.persist()
      },

      removeApplication(
        id: string,
      ): boolean {
        const originalLength =
          this.applications.length

        this.applications =
          this.applications.filter(
            (application) =>
              application.id !== id,
          )

        const removed =
          originalLength !==
          this.applications.length

        if (removed) {
          this.persist()
        }

        return removed
      },

      clearRejected(): number {
        const rejectedCount =
          this.applications.filter(
            (application) =>
              application.status ===
              'rejected',
          ).length

        if (rejectedCount === 0) {
          return 0
        }

        this.applications =
          this.applications.filter(
            (application) =>
              application.status !==
              'rejected',
          )

        this.persist()

        return rejectedCount
      },
    },
  },
)