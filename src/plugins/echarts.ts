import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
} from 'echarts/charts'

import {
  AriaComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
} from 'echarts/components'

import {
  init,
  use,
} from 'echarts/core'

import { CanvasRenderer } from 'echarts/renderers'

use([
  BarChart,
  LineChart,
  PieChart,
  RadarChart,

  AriaComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,

  CanvasRenderer,
])

export { init }

export type {
  EChartsCoreOption,
} from 'echarts/core'