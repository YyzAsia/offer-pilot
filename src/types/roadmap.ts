export type RoadmapTaskStatus =
  | 'todo'
  | 'doing'
  | 'done'

export type RoadmapTaskPriority =
  | 'high'
  | 'medium'
  | 'low'

export type RoadmapTaskSource =
  | 'analysis'
  | 'manual'

export interface RoadmapTask {
  id: string
  title: string
  description: string

  skillId: string | null
  skillName: string

  status: RoadmapTaskStatus
  priority: RoadmapTaskPriority
  progress: number

  dueDate: string
  estimatedHours: number
  notes: string

  source: RoadmapTaskSource
  sourceAnalysisId: string | null
  sourceCompany: string | null
  sourceJobTitle: string | null

  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface RoadmapTaskFormData {
  title: string
  description: string
  skillName: string

  status: RoadmapTaskStatus
  priority: RoadmapTaskPriority
  progress: number

  dueDate: string
  estimatedHours: number
  notes: string
}