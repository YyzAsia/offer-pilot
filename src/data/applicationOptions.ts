import type {
  ApplicationPriority,
  ApplicationStatus,
} from '@/types/application'

export interface ApplicationStatusOption {
  value: ApplicationStatus
  label: string
  description: string
}

export const APPLICATION_STATUS_OPTIONS:
  ApplicationStatusOption[] = [
    {
      value: 'wishlist',
      label: '准备投递',
      description: '正在完善简历或准备投递材料',
    },
    {
      value: 'applied',
      label: '已投递',
      description: '已经提交简历，等待反馈',
    },
    {
      value: 'written-test',
      label: '笔试',
      description: '已进入笔试或在线测评阶段',
    },
    {
      value: 'interview-1',
      label: '一面',
      description: '已进入第一轮面试',
    },
    {
      value: 'interview-2',
      label: '二面',
      description: '已进入第二轮或终面',
    },
    {
      value: 'offer',
      label: 'Offer',
      description: '已经收到录用意向',
    },
    {
      value: 'rejected',
      label: '未通过',
      description: '流程结束或暂未通过',
    },
  ]

export const APPLICATION_STATUS_LABELS:
  Record<ApplicationStatus, string> = {
    wishlist: '准备投递',
    applied: '已投递',
    'written-test': '笔试',
    'interview-1': '一面',
    'interview-2': '二面',
    offer: 'Offer',
    rejected: '未通过',
  }

export const APPLICATION_PRIORITY_LABELS:
  Record<ApplicationPriority, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  }

export const RECRUITMENT_CHANNEL_OPTIONS = [
  'Boss 直聘',
  '实习僧',
  '牛客',
  '企业官网',
  '学校就业网',
  '内推',
  '招聘群',
  '其他',
]