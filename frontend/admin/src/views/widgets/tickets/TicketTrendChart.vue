<template>
  <div class="trend-section">
    <div class="section-header d-flex v-center h-space-between mb-2">
      <span class="section-label">30-Day Ticket Trend</span>
      <div class="chart-legend d-flex v-center">
        <span class="legend-item"><span class="legend-dot dot-open"></span>Open</span>
        <span class="legend-item"><span class="legend-dot dot-closed"></span>Closed</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="chart-skeleton">
      <r-skeleton loading height="160px" type="line" class="w-100"></r-skeleton>
    </div>

    <!-- Empty -->
    <div v-else-if="!openData || openData.length < 2" class="chart-empty d-flex v-center h-center py-4">
      <span class="empty-text">No trend data available</span>
    </div>

    <!-- Chart -->
    <div v-else class="chart-wrapper" ref="chartRef">
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

        <!-- Open area fill -->
        <defs>
          <linearGradient id="openAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6c63ff" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#6c63ff" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="closedAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#34d399" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#34d399" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Open area -->
        <path :d="openArea" fill="url(#openAreaGrad)" class="area-fill" />
        <!-- Open line -->
        <path :d="openLine" fill="none" class="line-open" />

        <!-- Closed area -->
        <path :d="closedArea" fill="url(#closedAreaGrad)" class="area-fill" />
        <!-- Closed line -->
        <path :d="closedLine" fill="none" class="line-closed" />

        <!-- Hover indicator line -->
        <line v-if="hoveredIndex >= 0"
          :x1="hoverX" :y1="chartTop" :x2="hoverX" :y2="chartTop + chartH"
          class="hover-line"
        />
        <!-- Hover dots -->
        <circle v-if="hoveredIndex >= 0"
          :cx="hoverX" :cy="hoverOpenY" r="4" class="hover-dot dot-open"
        />
        <circle v-if="hoveredIndex >= 0"
          :cx="hoverX" :cy="hoverClosedY" r="4" class="hover-dot dot-closed"
        />
      </svg>

      <!-- Tooltip -->
      <div v-if="hoveredIndex >= 0 && tooltipData" class="chart-tooltip"
        :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
      >
        <div class="tooltip-row"><span class="tooltip-dot" style="background:#6c63ff"></span>Open: <strong>{{ tooltipData.open }}</strong></div>
        <div class="tooltip-row"><span class="tooltip-dot" style="background:#34d399"></span>Closed: <strong>{{ tooltipData.closed }}</strong></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { dataToPoints, smoothPath, areaPath, gridLines, formatNumber } from './composables/useChartHelpers.js'

defineOptions({ name: 'ticket-trend-chart' })

const props = defineProps({
  openData: { type: Array, default: () => [] },
  closedData: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const chartRef = ref(null)
const hoveredIndex = ref(-1)

const viewW = 420
const viewH = 200
const chartLeft = 36
const chartTop = 12
const chartW = 370
const chartH = 155
const padBottom = 28

// Compute points for both datasets
const openMin = computed(() => Math.min(...props.openData, ...props.closedData))
const openMax = computed(() => Math.max(...props.openData, ...props.closedData))

const openPoints = computed(() => {
  if (!props.openData?.length) return []
  return dataToPoints(props.openData, chartLeft, chartTop, chartW, chartH, openMin.value, openMax.value)
})

const closedPoints = computed(() => {
  if (!props.closedData?.length) return []
  return dataToPoints(props.closedData, chartLeft, chartTop, chartW, chartH, openMin.value, openMax.value)
})

const openLine = computed(() => smoothPath(openPoints.value))
const closedLine = computed(() => smoothPath(closedPoints.value))

const openArea = computed(() => {
  if (!openPoints.value.length) return ''
  const last = openPoints.value[openPoints.value.length - 1]
  const first = openPoints.value[0]
  return areaPath(openLine.value, last.x, last.y, first.x, chartTop + chartH)
})

const closedArea = computed(() => {
  if (!closedPoints.value.length) return ''
  const last = closedPoints.value[closedPoints.value.length - 1]
  const first = closedPoints.value[0]
  return areaPath(closedLine.value, last.x, last.y, first.x, chartTop + chartH)
})

const grid = computed(() => gridLines(4, chartLeft, chartLeft + chartW, chartTop, chartH))

const yLabels = computed(() => {
  const labels = []
  for (let i = 0; i <= 4; i++) {
    const val = openMax.value - (i * (openMax.value - openMin.value)) / 4
    labels.push({
      x: chartLeft - 4,
      y: chartTop + (i * chartH) / 4 + 4,
      text: formatNumber(Math.round(val)),
    })
  }
  return labels
})

const xLabels = computed(() => {
  if (!props.openData?.length) return []
  const step = chartW / (props.openData.length - 1)
  const indices = [0, 4, 9, 14, 19, 24, 29].filter(i => i < props.openData.length)
  return indices.map(i => ({
    x: chartLeft + i * step,
    y: chartTop + chartH + 14,
    text: 'Day ' + (i + 1),
  }))
})

// Hover / tooltip
const hoverX = computed(() => {
  if (hoveredIndex.value < 0 || !props.openData?.length) return 0
  const step = chartW / (props.openData.length - 1)
  return chartLeft + hoveredIndex.value * step
})

const hoverOpenY = computed(() => {
  if (!openPoints.value.length || hoveredIndex.value < 0) return 0
  return openPoints.value[hoveredIndex.value]?.y || 0
})

const hoverClosedY = computed(() => {
  if (!closedPoints.value.length || hoveredIndex.value < 0) return 0
  return closedPoints.value[hoveredIndex.value]?.y || 0
})

const tooltipData = computed(() => {
  if (hoveredIndex.value < 0) return null
  const o = props.openData?.[hoveredIndex.value]
  const c = props.closedData?.[hoveredIndex.value]
  if (o == null || c == null) return null
  return { open: o, closed: c }
})

const tooltipX = computed(() => {
  if (hoveredIndex.value < 0) return -999
  const step = chartW / (props.openData.length - 1)
  const raw = chartLeft + hoveredIndex.value * step
  return Math.min(raw, 280)
})

const tooltipY = computed(() => {
  return Math.min(hoverOpenY.value, hoverClosedY.value) - 40
})
</script>

<style scoped lang="scss">
.trend-section {
  margin-bottom: 16px;
}

.section-header {
  margin-bottom: 8px;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.chart-legend {
  gap: 12px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.45));
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  &.dot-open   { background: #6c63ff; }
  &.dot-closed { background: #34d399; }
}

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
  fill: var(--db-text-muted, rgba(255, 255, 255, 0.3));
  font-size: 7px;
  font-family: inherit;
  text-anchor: end;
  dominant-baseline: middle;
}

.axis-label-x {
  fill: var(--db-text-muted, rgba(255, 255, 255, 0.25));
  font-size: 7px;
  font-family: inherit;
  text-anchor: middle;
}

.line-open {
  stroke: #6c63ff;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 4px rgba(108, 99, 255, 0.25));
}

.line-closed {
  stroke: #34d399;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 4px rgba(52, 211, 153, 0.2));
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
  stroke: #fff;
  stroke-width: 1.5;
  &.dot-open   { fill: #6c63ff; }
  &.dot-closed { fill: #34d399; }
}

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

.tooltip-row {
  font-size: 0.6875rem;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  display: flex;
  align-items: center;
  gap: 6px;

  strong {
    color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  }
}

.tooltip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chart-skeleton {
  border-radius: 10px;
  overflow: hidden;
}

.chart-empty {
  .empty-text {
    font-size: 0.75rem;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  }
}
</style>
