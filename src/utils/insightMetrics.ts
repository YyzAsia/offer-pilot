import {
  SKILL_CATEGORY_LABELS,
} from '@/data/skillDictionary'

import type {
  AnalysisResult,
  SkillCategory,
} from '@/types/analyzer'

import type {
  JobApplication,
} from '@/types/application'

import type {
  RoadmapTask,
} from '@/types/roadmap'

export interface SkillCategoryMetric {
  category: SkillCategory
  label: string
  score: number
  masteredCount: number
  totalCount: number
}

export interface ActivityTrendPoint {
  date: string
  label: string
  analyses: number
  roadmap: number
  applications: number
}

const SKILL_CATEGORY_ORDER:
  SkillCategory[] = [
    'foundation',
    'framework',
    'engineering',
    'backend',
    'computer-science',
    'platform',
  ]

function formatDateKey(
  date: Date,
): string {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDateKey(
  value: string,
): string | null {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return formatDateKey(date)
}

export function buildSkillCategoryMetrics(
  result: AnalysisResult | null,
): SkillCategoryMetric[] {
  return SKILL_CATEGORY_ORDER.map(
    (category) => {
      const skills =
        result?.detectedSkills.filter(
          (skill) =>
            skill.category === category,
        ) ?? []

      const totalWeight = skills.reduce(
        (total, skill) =>
          total + skill.effectiveWeight,
        0,
      )

      const masteredWeight = skills
        .filter(
          (skill) => skill.mastered,
        )
        .reduce(
          (total, skill) =>
            total +
            skill.effectiveWeight,
          0,
        )

      const score =
        totalWeight === 0
          ? 0
          : Math.round(
              (masteredWeight /
                totalWeight) *
                100,
            )

      return {
        category,

        label:
          SKILL_CATEGORY_LABELS[
            category
          ],

        score,

        masteredCount:
          skills.filter(
            (skill) => skill.mastered,
          ).length,

        totalCount: skills.length,
      }
    },
  )
}

export function buildWeeklyActivity(
  analyses: AnalysisResult[],
  tasks: RoadmapTask[],
  applications: JobApplication[],
): ActivityTrendPoint[] {
  const points: ActivityTrendPoint[] =
    []

  const pointMap = new Map<
    string,
    ActivityTrendPoint
  >()

  for (
    let dayOffset = 6;
    dayOffset >= 0;
    dayOffset -= 1
  ) {
    const date = new Date()

    date.setHours(0, 0, 0, 0)

    date.setDate(
      date.getDate() - dayOffset,
    )

    const dateKey =
      formatDateKey(date)

    const point: ActivityTrendPoint = {
      date: dateKey,

      label: `${date.getMonth() + 1}/${date.getDate()}`,

      analyses: 0,
      roadmap: 0,
      applications: 0,
    }

    points.push(point)
    pointMap.set(dateKey, point)
  }

  for (const analysis of analyses) {
    const dateKey = getDateKey(
      analysis.createdAt,
    )

    if (!dateKey) {
      continue
    }

    const point = pointMap.get(dateKey)

    if (point) {
      point.analyses += 1
    }
  }

  for (const task of tasks) {
    const dateKey = getDateKey(
      task.updatedAt,
    )

    if (!dateKey) {
      continue
    }

    const point = pointMap.get(dateKey)

    if (point) {
      point.roadmap += 1
    }
  }

  for (
    const application of applications
  ) {
    const history = Array.isArray(
      application.history,
    )
      ? application.history
      : []

    for (const historyItem of history) {
      const dateKey = getDateKey(
        historyItem.createdAt,
      )

      if (!dateKey) {
        continue
      }

      const point =
        pointMap.get(dateKey)

      if (point) {
        point.applications += 1
      }
    }
  }

  return points
}