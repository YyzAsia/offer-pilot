export type ApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'written-test'
  | 'interview-1'
  | 'interview-2'
  | 'offer'
  | 'rejected'

export type ApplicationPriority =
  | 'high'
  | 'medium'
  | 'low'

export type ApplicationSource =
  | 'analysis'
  | 'manual'

export interface ApplicationHistoryItem {
  id: string
  status: ApplicationStatus
  createdAt: string
  note: string
}

export interface JobApplication {
  id: string

  companyName: string
  jobTitle: string
  location: string
  salaryRange: string
  jobUrl: string

  recruitmentChannel: string
  contactName: string
  contactInfo: string

  status: ApplicationStatus
  priority: ApplicationPriority

  appliedAt: string
  nextActionAt: string

  tags: string[]
  notes: string

  source: ApplicationSource
  sourceAnalysisId: string | null

  matchScore: number | null
  jdSnapshot: string

  history: ApplicationHistoryItem[]

  createdAt: string
  updatedAt: string
}

export interface ApplicationFormData {
  companyName: string
  jobTitle: string
  location: string
  salaryRange: string
  jobUrl: string

  recruitmentChannel: string
  contactName: string
  contactInfo: string

  status: ApplicationStatus
  priority: ApplicationPriority

  appliedAt: string
  nextActionAt: string

  tags: string[]
  notes: string
}