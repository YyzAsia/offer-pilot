<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

import {
  init,
} from '@/plugins/echarts'

import type {
  EChartsCoreOption,
} from '@/plugins/echarts'

const props = withDefaults(
  defineProps<{
    option: EChartsCoreOption
    height?: string
    empty?: boolean
    emptyText?: string
    ariaLabel?: string
  }>(),
  {
    height: '320px',
    empty: false,
    emptyText: '暂无可展示的数据',
    ariaLabel: '数据图表',
  },
)

const chartContainer =
  ref<HTMLDivElement | null>(null)

let chart:
  | ReturnType<typeof init>
  | null = null

let resizeObserver:
  | ResizeObserver
  | null = null

const chartStyle = computed(() => ({
  height: props.height,
}))

function resizeChart(): void {
  chart?.resize()
}

async function renderChart(): Promise<void> {
  await nextTick()

  if (!chartContainer.value) {
    return
  }

  if (props.empty) {
    chart?.clear()
    return
  }

  if (!chart) {
    chart = init(chartContainer.value)
  }

  chart.setOption(
    props.option,
    {
      notMerge: true,
      lazyUpdate: false,
    },
  )
}

watch(
  () => props.option,
  () => {
    void renderChart()
  },
  {
    deep: true,
  },
)

watch(
  () => props.empty,
  () => {
    void renderChart()
  },
)

onMounted(() => {
  void renderChart()

  window.addEventListener(
    'resize',
    resizeChart,
  )

  if (
    chartContainer.value &&
    typeof ResizeObserver !== 'undefined'
  ) {
    resizeObserver =
      new ResizeObserver(() => {
        resizeChart()
      })

    resizeObserver.observe(
      chartContainer.value,
    )
  }
})

onBeforeUnmount(() => {
  window.removeEventListener(
    'resize',
    resizeChart,
  )

  resizeObserver?.disconnect()
  resizeObserver = null

  chart?.dispose()
  chart = null
})
</script>

<template>
  <div
    class="chart-wrapper"
    :style="chartStyle"
  >
    <div
      ref="chartContainer"
      class="chart-container"
      role="img"
      :aria-label="ariaLabel"
    ></div>

    <div
      v-if="empty"
      class="chart-empty"
    >
      <span>暂无数据</span>
      <p>{{ emptyText }}</p>
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  position: relative;

  width: 100%;
  min-height: 220px;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.chart-empty {
  position: absolute;
  inset: 0;

  display: grid;
  place-items: center;
  align-content: center;

  padding: 24px;

  color: var(--text-light);
  text-align: center;

  background: #ffffff;
}

.chart-empty span {
  font-size: 14px;
  font-weight: 700;
}

.chart-empty p {
  margin: 7px 0 0;
  font-size: 12px;
}
</style>