<script setup lang="ts">
import FeaturePlaceholder from '@/components/common/FeaturePlaceholder.vue'

const features = [
  '根据岗位技能差距生成任务',
  '支持待开始、进行中、已完成状态',
  '设置任务优先级和截止日期',
  '统计学习完成率和连续学习天数',
]
</script>

<template>
  <FeaturePlaceholder
    eyebrow="学习系统 · 第 3 阶段"
    title="只学习目标岗位真正需要的内容"
    description="所有学习任务都来自具体岗位要求，避免无限看课程却没有项目产出。"
    :items="features"
  />
</template>