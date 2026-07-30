import type {
  SkillCategory,
  SkillDefinition,
} from '@/types/analyzer'

export const SKILL_CATEGORY_LABELS: Record<
  SkillCategory,
  string
> = {
  foundation: '前端基础',
  framework: '前端框架',
  engineering: '工程化',
  backend: '后端能力',
  'computer-science': '计算机基础',
  platform: '平台开发',
}

export const skillDictionary: SkillDefinition[] = [
  {
    id: 'html',
    name: 'HTML',
    category: 'foundation',
    keywords: [
      'html',
      'html5',
      '语义化',
      '网页结构',
    ],
    weight: 6,
    learningSuggestion:
      '掌握常见语义化标签、表单、图片、链接和页面结构。',
  },
  {
    id: 'css',
    name: 'CSS',
    category: 'foundation',
    keywords: [
      'css',
      'css3',
      'flex',
      'grid',
      '响应式布局',
      '移动端适配',
    ],
    weight: 6,
    learningSuggestion:
      '重点掌握盒模型、Flex、Grid、响应式布局和移动端适配。',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'foundation',
    keywords: [
      'javascript',
      'ecmascript',
      'es6',
      'es2015',
      '闭包',
      '原型链',
      '事件循环',
    ],
    weight: 10,
    learningSuggestion:
      '重点掌握数组对象、函数、异步、Promise、事件循环和 DOM。',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'foundation',
    keywords: [
      'typescript',
      '类型系统',
      '类型定义',
    ],
    weight: 8,
    learningSuggestion:
      '掌握基础类型、interface、联合类型、泛型基础和类型收窄。',
  },
  {
    id: 'vue',
    name: 'Vue',
    category: 'framework',
    keywords: [
      'vue',
      'vue2',
      'vue3',
      'pinia',
      'vue router',
      'vue-router',
    ],
    weight: 9,
    learningSuggestion:
      '掌握组件、响应式状态、组件通信、Router 和 Pinia。',
  },
  {
    id: 'react',
    name: 'React',
    category: 'framework',
    keywords: [
      'react',
      'react hooks',
      'redux',
      'zustand',
    ],
    weight: 9,
    learningSuggestion:
      '掌握函数组件、Hooks、路由和常见状态管理方案。',
  },
  {
    id: 'vite-webpack',
    name: '前端工程化',
    category: 'engineering',
    keywords: [
      'vite',
      'webpack',
      '构建工具',
      '工程化',
      '模块化',
      '打包优化',
    ],
    weight: 5,
    learningSuggestion:
      '了解 Vite 或 Webpack、模块化、环境变量和生产构建。',
  },
  {
    id: 'git',
    name: 'Git',
    category: 'engineering',
    keywords: [
      'git',
      'github',
      'gitlab',
      '版本控制',
    ],
    weight: 4,
    learningSuggestion:
      '掌握分支、提交、合并、拉取、推送和基础冲突处理。',
  },
  {
    id: 'testing',
    name: '前端测试',
    category: 'engineering',
    keywords: [
      'vitest',
      'jest',
      'playwright',
      'cypress',
      '单元测试',
      '自动化测试',
    ],
    weight: 4,
    learningSuggestion:
      '了解单元测试和端到端测试，并为核心流程编写测试。',
  },
  {
    id: 'performance',
    name: '性能优化',
    category: 'engineering',
    keywords: [
      '性能优化',
      '首屏优化',
      '懒加载',
      '代码分割',
      'lighthouse',
      '用户体验优化',
    ],
    weight: 5,
    learningSuggestion:
      '学习路由懒加载、图片优化、缓存和减少重复请求。',
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'backend',
    keywords: [
      'node.js',
      'nodejs',
      'node js',
      'express',
      'nestjs',
    ],
    weight: 6,
    learningSuggestion:
      '掌握 Express 路由、中间件、REST API 和基础数据库操作。',
  },
  {
    id: 'http',
    name: 'HTTP 与网络',
    category: 'computer-science',
    keywords: [
      'http',
      'https',
      '网络协议',
      'tcp',
      '跨域',
      'cors',
      '浏览器缓存',
    ],
    weight: 6,
    learningSuggestion:
      '重点掌握 HTTP 方法、状态码、缓存、跨域和 HTTPS。',
  },
  {
    id: 'data-structure',
    name: '数据结构',
    category: 'computer-science',
    keywords: [
      '数据结构',
      '算法',
      '时间复杂度',
      '数组',
      '链表',
      '二叉树',
    ],
    weight: 5,
    learningSuggestion:
      '学习数组、链表、栈、队列、哈希表和基础复杂度分析。',
  },
  {
    id: 'operating-system',
    name: '操作系统',
    category: 'computer-science',
    keywords: [
      '操作系统',
      '进程',
      '线程',
      '内存管理',
    ],
    weight: 4,
    learningSuggestion:
      '掌握进程线程、内存、并发和文件系统的基础概念。',
  },
  {
    id: 'mini-program',
    name: '微信小程序',
    category: 'platform',
    keywords: [
      '微信小程序',
      '小程序开发',
      'wxml',
      'wxss',
      'uni-app',
      'taro',
    ],
    weight: 6,
    learningSuggestion:
      '了解小程序页面结构、生命周期、路由、请求和本地缓存。',
  },
]