export type SkillCategory =
  | 'foundation'
  | 'framework'
  | 'engineering'
  | 'backend'
  | 'computer-science'
  | 'platform'

export type SkillImportance = 'required' | 'bonus'

export type TaskPriority = 'high' | 'medium'

export interface SkillDefinition {
  id: string
  name: string
  category: SkillCategory
  keywords: string[]
  weight: number
  learningSuggestion: string
}

export interface AnalysisInput {
  companyName: string
  jobTitle: string
  jdText: string
  masteredSkillIds: string[]
}

export interface DetectedSkill {
  id: string
  name: string
  category: SkillCategory
  importance: SkillImportance
  weight: number
  effectiveWeight: number
  mastered: boolean
  matchedKeywords: string[]
  matchedSentences: string[]
}

export interface LearningTaskDraft {
  id: string
  skillId: string
  skillName: string
  title: string
  priority: TaskPriority
  description: string
}

export interface AnalysisResult {
  id: string
  createdAt: string
  companyName: string
  jobTitle: string
  originalText: string
  score: number
  readinessLabel: string
  summary: string
  keywordCount: number
  detectedSkills: DetectedSkill[]
  masteredSkills: DetectedSkill[]
  missingSkills: DetectedSkill[]
  learningTasks: LearningTaskDraft[]
}