<template>
  <div class="trend-section glass-panel-inner mb-3">
    <!-- Section header -->
    <div class="section-header d-flex v-center h-space-between mb-2">
      <span class="section-label">Rating Trend</span>
    </div>

    <!-- Time range selector -->
    <div class="range-selector d-flex flex-wrap mb-3">
      <button
        v-for="r in timeRanges"
        :key="r.value"
        class="range-chip"
        :class="{ active: modelValue === r.value }"
        @click="$emit('update:modelValue', r.value)"
        type="button"
      >
        {{ r.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="chart-skeleton">
      <r-skeleton loading height="160px" type="line" class="w-100"></r-skeleton>
    </div>

    <!-- Empty -->
    <div v-else-if="!hasData" class="chart-empty d-flex v-center h-center py-4">
      <span class="empty-text">No trend data available for this period</span>
    </div>

    <!-- Chart -->
    <div v-else class="chart-wrapper" ref="chartRef" @mousemove="onHover" @mouseleave="hoveredIndex = -1">
      <svg :viewBox="`0 0 ${viewW} ${viewH}`" class="trend-svg">
        <!-- Grid lines -->
        <line v-for="(g, i) in grid" :key="'g' + i"
          :x1="g.x1" :y1="g.y1" :x2="g.x2" :y2="g.y2"
          class="grid-line"
        />

        <!-- Y-axis labels -->
        <text v-for="(l, i) in yLabels" :key="'yl' + i"
          :x="l.x" :y="l.y" class="axis-label-y"
        >{{ l.text }}</text>

        <!-- X-axis labels -->
        <text v-for="(l, i) in xLabels" :key="'xl' + i"
          :x="l.x" :y="l.y" class="axis-label-x"
        >{{ l.text }}</text>

        <!-- Area fill gradient -->
        <defs>
          <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#60a5fa" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Area fill -->
        <path :d="areaPathStr" fill="url(#trendAreaGrad)" class="area-fill" />

        <!-- Line -->
        <path :d="linePathStr" fill="none" class="trend-line" />

        <!-- Hover indicator line -->
        <line v-if="hoveredIndex >= 0"
          :x1="hoverX" :y1="chartTop" :x2="hoverX" :y2="chartTop + chartH"
          class="hover-line"
        />

        <!-- Hover dot -->
        <circle v-if="hoveredIndex >= 0"
          :cx="hoverX" :cy="hoverY" r="4" class="hover-dot"
        />
      </svg>

      <!-- Tooltip -->
      <div v-if="hoveredIndex >= 0 && hoverData" class="chart-tooltip"
        :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
      >
        <div class="tooltip-label">{{ hoverData.label }}</div>
        <div class="tooltip-value">{{ hoverData.value }} ratings</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  dataToPoints, smoothPath, areaPath, gridLines, formatNumber,
} from '../widgets/tickets/composables/useChartHelpers.js'

defineOptions({ name: 'comment-trend-chart' })

const props = defineProps({
  trendData: { type: Array, default: () => [] },
  modelValue: { type: String, default: '30d' },
  loading: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const chartRef = ref(null)
const hoveredIndex = ref(-1)

const timeRanges = [
  { value: '1h', label: '1H' },
  { value: '5h', label: '5H' },
  { value: '24h', label: '24H' },
  { value: '2d', label: '2D' },
  { value: '3d', label: '3D' },
  { value: '7d', label: 'Week' },
  { value: '30d', label: 'Month' },
  { value: '90d', label: '3M' },
  { value: '365d', label: 'Year' },
]

const viewW = 440
const viewH = 200
const chartLeft = 36
const chartTop = 12
const chartW = 390
const chartH = 155

const hasData = computed(() => props.trendData?.length >= 2)

// Compute chart points
const values = computed(() => props.trendData.map(d => d.value))
const minMax = computed(() => {
  if (!values.value.length) return { min: 0, max: 100 }
  const min = Math.min(...values.value)
  const max = Math.max(...values.value)
  const pad = (max - min) * 0.1 || 10
  return { min: min - pad, max: max + pad }
})

const points = computed(() => {
  if (!values.value.length) return []
  return dataToPoints(values.value, chartLeft, chartTop, chartW, chartH, minMax.value.min, minMax.value.max)
})

const linePathStr = computed(() => smoothPath(points.value))

const areaPathStr = computed(() => {
  if (!points.value.length) return ''
  const last = points.value[points.value.length - 1]
  const first = points.value[0]
  return areaPath(linePathStr.value, last.x, last.y, first.x, chartTop + chartH)
})

// Grid & labels
const grid = computed(() => gridLines(4, chartLeft, chartLeft + chartW, chartTop, chartH))

const yLabels = computed(() => {
  const labels = []
  for (let i = 0; i <= 4; i++) {
    const val = minMax.value.max - (i * (minMax.value.max - minMax.value.min)) / 4
    labels.push({
      x: chartLeft - 4,
      y: chartTop + (i * chartH) / 4 + 4,
      text: formatNumber(Math.round(val)),
    })
  }
  return labels
})

const xLabels = computed(() => {
  if (!props.trendData?.length) return []
  const step = chartW / (props.trendData.length - 1)
  const maxLabels = 6
  const interval = Math.max(1, Math.floor((props.trendData.length - 1) / maxLabels))
  return props.trendData
    .filter((_, i) => i % interval === 0 || i === props.trendData.length - 1)
    .map((d, i, arr) => {
      const idx = i * interval
      return {
        x: chartLeft + Math.min(idx, props.trendData.length - 1) * step,
        y: chartTop + chartH + 14,
        text: d.label || '',
      }
    })
})

// Hover / tooltip
const hoverX = computed(() => {
  if (hoveredIndex.value < 0 || !values.value.length) return 0
  const step = chartW / (values.value.length - 1)
  return chartLeft + hoveredIndex.value * step
})

const hoverY = computed(() => {
  if (!points.value.length || hoveredIndex.value < 0) return 0
  return points.value[hoveredIndex.value]?.y || 0
})

const hoverData = computed(() => {
  if (hoveredIndex.value < 0) return null
  const d = props.trendData[hoveredIndex.value]
  if (!d) return null
  return { label: d.label, value: d.value }
})

const tooltipX = computed(() => {
  if (hoveredIndex.value < 0) return -999
  const step = chartW / (values.value.length - 1)
  const raw = chartLeft + hoveredIndex.value * step
  return Math.min(raw, 300)
})

const tooltipY = computed(() => Math.max(hoverY.value - 36, 0))

function onHover(e) {
  if (!props.trendData?.length) return
  const rect = chartRef.value?.getBoundingClientRect()
  if (!rect) return
  const svgX = (e.clientX - rect.left) / rect.width * viewW
  const step = chartW / (values.value.length - 1)
  const idx = Math.round((svgX - chartLeft) / step)
  if (idx >= 0 && idx < props.trendData.length) {
    hoveredIndex.value = idx
  }
}
</script>

<style scoped lang="scss">
.trend-section {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--db-card-border, rgba(255,255,255,0.05));
}

.section-header {
  margin-bottom: 8px;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--db-text-secondary, rgba(255,255,255,0.65));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Range selector ──────────────── */
.range-selector {
  gap: 4px;
}

.range-chip {
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--db-text-muted, rgba(255,255,255,0.45));
  font-size: 0.625rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: var(--db-text-secondary, rgba(255,255,255,0.65));
  }

  &.active {
    background: rgba(96, 165, 250, 0.15);
    border-color: rgba(96, 165, 250, 0.3);
    color: #60a5fa;
  }
}

/* ── Chart ────────────────────────── */
.chart-wrapper {
  position: relative;
  width: 100%;
}

.trend-svg {
  width: 100%;
  height: auto;
  display: block;
}

.grid-line {
  stroke: rgba(255, 255, 255, 0.04);
  stroke-width: 1;
}

.axis-label-y {
  fill: var(--db-text-muted, rgba(255,255,255,0.3));
  font-size: 7px;
  font-family: inherit;
  text-anchor: end;
  dominant-baseline: middle;
}

.axis-label-x {
  fill: var(--db-text-muted, rgba(255,255,255,0.25));
  font-size: 7px;
  font-family: inherit;
  text-anchor: middle;
}

.trend-line {
  stroke: #60a5fa;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 4px rgba(96, 165, 250, 0.25));
}

.area-fill {
  pointer-events: none;
}

.hover-line {
  stroke: rgba(255, 255, 255, 0.15);
  stroke-width: 1;
  stroke-dasharray: 3 2;
  pointer-events: none;
}

.hover-dot {
  fill: #60a5fa;
  stroke: #fff;
  stroke-width: 1.5;
}

/* ── Tooltip ──────────────────────── */
.chart-tooltip {
  position: absolute;
  background: rgba(8, 8, 22, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
}

.tooltip-label {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255,255,255,0.45));
  margin-bottom: 2px;
}

.tooltip-value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255,255,255,0.92));
}

/* ── States ───────────────────────── */
.chart-skeleton {
  border-radius: 10px;
  overflow: hidden;
}

.chart-empty .empty-text {
  font-size: 0.75rem;
  color: var(--db-text-muted, rgba(255,255,255,0.4));
}
</style>
