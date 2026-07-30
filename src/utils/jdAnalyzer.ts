import { skillDictionary } from '@/data/skillDictionary'

import type {
  AnalysisInput,
  AnalysisResult,
  DetectedSkill,
  LearningTaskDraft,
  SkillDefinition,
  SkillImportance,
} from '@/types/analyzer'

const bonusSignals = [
  '加分',
  '优先',
  '更佳',
  '优先考虑',
  '有经验者优先',
  'bonus',
  'preferred',
  'nice to have',
]

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”"'`]/g, '')
    .trim()
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasKeyword(
  text: string,
  keyword: string,
): boolean {
  const normalizedText = normalizeText(text)
  const normalizedKeyword = normalizeText(keyword)

  const isEnglishKeyword =
    /^[a-z0-9+#.\-\s]+$/i.test(normalizedKeyword)

  if (!isEnglishKeyword) {
    return normalizedText.includes(normalizedKeyword)
  }

  const keywordPattern = normalizedKeyword
    .split(/\s+/)
    .map(escapeRegExp)
    .join('\\s*')

  const pattern = new RegExp(
    `(^|[^a-z0-9])${keywordPattern}([^a-z0-9]|$)`,
    'i',
  )

  return pattern.test(normalizedText)
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/[\n。；;！？!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function isBonusSentence(sentence: string): boolean {
  const normalizedSentence = normalizeText(sentence)

  return bonusSignals.some((signal) =>
    normalizedSentence.includes(
      normalizeText(signal),
    ),
  )
}

function getSkillImportance(
  matchedSentences: string[],
): SkillImportance {
  const allMatchesAreBonus =
    matchedSentences.length > 0 &&
    matchedSentences.every(isBonusSentence)

  return allMatchesAreBonus
    ? 'bonus'
    : 'required'
}

function detectSkill(
  skill: SkillDefinition,
  fullText: string,
  sentences: string[],
  masteredSkillIds: string[],
): DetectedSkill | null {
  const matchedKeywords = skill.keywords.filter(
    (keyword) => hasKeyword(fullText, keyword),
  )

  if (matchedKeywords.length === 0) {
    return null
  }

  const matchedSentences = sentences.filter(
    (sentence) =>
      skill.keywords.some((keyword) =>
        hasKeyword(sentence, keyword),
      ),
  )

  const importance =
    getSkillImportance(matchedSentences)

  const effectiveWeight =
    importance === 'bonus'
      ? Number((skill.weight * 0.6).toFixed(1))
      : skill.weight

  return {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    importance,
    weight: skill.weight,
    effectiveWeight,
    mastered: masteredSkillIds.includes(skill.id),
    matchedKeywords,
    matchedSentences,
  }
}

function calculateScore(
  detectedSkills: DetectedSkill[],
): number {
  const totalWeight = detectedSkills.reduce(
    (total, skill) =>
      total + skill.effectiveWeight,
    0,
  )

  if (totalWeight === 0) {
    return 0
  }

  const masteredWeight = detectedSkills
    .filter((skill) => skill.mastered)
    .reduce(
      (total, skill) =>
        total + skill.effectiveWeight,
      0,
    )

  return Math.round(
    (masteredWeight / totalWeight) * 100,
  )
}

function getReadinessLabel(score: number): string {
  if (score >= 80) {
    return '高度匹配，可以重点投递'
  }

  if (score >= 60) {
    return '基本匹配，建议立即投递'
  }

  if (score >= 40) {
    return '可以边投递边补充技能'
  }

  return '匹配度较低，建议优先补强核心技能'
}

function createLearningTasks(
  missingSkills: DetectedSkill[],
): LearningTaskDraft[] {
  return missingSkills
    .slice(0, 8)
    .map((skill, index) => {
      const highPriority =
        skill.importance === 'required' &&
        skill.weight >= 7

      return {
        id: createId(`task-${index}`),
        skillId: skill.id,
        skillName: skill.name,
        title: `补齐 ${skill.name} 岗位能力`,
        priority: highPriority
          ? 'high'
          : 'medium',
        description:
          skillDictionary.find(
            (item) => item.id === skill.id,
          )?.learningSuggestion ??
          `学习 ${skill.name} 的核心知识。`,
      }
    })
}

function createSummary(
  score: number,
  detectedCount: number,
  missingCount: number,
): string {
  if (detectedCount === 0) {
    return '暂未识别出明确的前端技能要求。'
  }

  if (missingCount === 0) {
    return `系统识别出 ${detectedCount} 项技能要求，你已全部标记为掌握。`
  }

  return `系统识别出 ${detectedCount} 项技能要求，当前匹配度为 ${score}%，仍有 ${missingCount} 项技能需要补充。`
}

export function analyzeJobDescription(
  input: AnalysisInput,
): AnalysisResult {
  const sentences = splitIntoSentences(
    input.jdText,
  )

  const detectedSkills = skillDictionary
    .map((skill) =>
      detectSkill(
        skill,
        input.jdText,
        sentences,
        input.masteredSkillIds,
      ),
    )
    .filter(
      (
        skill,
      ): skill is DetectedSkill => skill !== null,
    )
    .sort((first, second) => {
      if (
        first.importance !== second.importance
      ) {
        return first.importance === 'required'
          ? -1
          : 1
      }

      return (
        second.effectiveWeight -
        first.effectiveWeight
      )
    })

  const masteredSkills = detectedSkills.filter(
    (skill) => skill.mastered,
  )

  const missingSkills = detectedSkills.filter(
    (skill) => !skill.mastered,
  )

  const score = calculateScore(detectedSkills)

  const keywordCount = detectedSkills.reduce(
    (total, skill) =>
      total + skill.matchedKeywords.length,
    0,
  )

  return {
    id: createId('analysis'),
    createdAt: new Date().toISOString(),
    companyName: input.companyName.trim(),
    jobTitle: input.jobTitle.trim(),
    originalText: input.jdText.trim(),
    score,
    readinessLabel: getReadinessLabel(score),
    summary: createSummary(
      score,
      detectedSkills.length,
      missingSkills.length,
    ),
    keywordCount,
    detectedSkills,
    masteredSkills,
    missingSkills,
    learningTasks:
      createLearningTasks(missingSkills),
  }
}