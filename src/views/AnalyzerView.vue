<script setup lang="ts">
import FeaturePlaceholder from '@/components/common/FeaturePlaceholder.vue'

const features = [
  '填写公司名称、岗位名称和招聘 JD',
  '识别技术栈、计算机基础和实习要求',
  '计算岗位技能匹配度',
  '生成待补技能和针对性学习建议',
]
</script>

<template>
  <FeaturePlaceholder
    eyebrow="核心功能 · 第 2 阶段"
    title="把招聘要求转化成可执行的学习计划"
    description="粘贴岗位 JD 后，系统会识别其中的技能关键词、计算当前匹配度，并生成针对该岗位的学习任务。"
    :items="features"
  />
</template>