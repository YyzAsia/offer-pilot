<script setup lang="ts">
import FeaturePlaceholder from '@/components/common/FeaturePlaceholder.vue'

const features = [
  '记录公司、岗位和招聘链接',
  '通过看板管理投递阶段',
  '搜索和筛选投递记录',
  '统计投递、面试和 Offer 转化情况',
]
</script>

<template>
  <FeaturePlaceholder
    eyebrow="求职管理 · 第 4 阶段"
    title="让每一次投递都有记录和复盘"
    description="集中管理准备投递、已投递、笔试、面试、Offer 和未通过记录，避免遗漏重要进度。"
    :items="features"
  />
</template>