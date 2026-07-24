<template>
  <div class="status-section">
    <div class="section-header d-flex v-center h-space-between mb-2">
      <span class="section-label">Status Distribution</span>
      <span class="section-total">{{ total }} tickets</span>
    </div>

    <div v-if="loading" class="d-flex v-center h-center" style="height:140px">
      <r-skeleton loading width="100px" height="100px" type="circle"></r-skeleton>
    </div>

    <div v-else-if="!segments || segments.length === 0" class="d-flex v-center h-center" style="height:140px">
      <span class="empty-text">No status data</span>
    </div>

    <div v-else class="status-content d-flex v-center">
      <!-- Donut SVG -->
      <div class="donut-wrap flex-shrink-0">
        <svg viewBox="0 0 120 120" class="donut-svg">
          <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="10" />
          <circle v-for="(seg, i) in segments" :key="i"
            cx="60" cy="60" r="48" fill="none"
            :stroke="seg.color" stroke-width="10"
            :stroke-dasharray="seg.dashArray"
            :stroke-dashoffset="seg.dashOffset"
            transform="rotate(-90 60 60)"
            stroke-linecap="butt"
            class="donut-segment"
          />
          <text x="60" y="56" text-anchor="middle" class="donut-center-pct">{{ centerPercent }}%</text>
          <text x="60" y="70" text-anchor="middle" class="donut-center-label">Total</text>
        </svg>
      </div>
      <!-- Legend -->
      <div class="status-legend flex-grow-1 ms-3">
        <div v-for="(seg, i) in segments" :key="i" class="legend-row d-flex v-center h-space-between mb-1">
          <div class="d-flex v-center">
            <span class="legend-dot" :style="{ background: seg.color }"></span>
            <span class="legend-label">{{ seg.label }}</span>
          </div>
          <span class="legend-value">{{ seg.percent }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { donutSegments } from './composables/useChartHelpers.js'

defineOptions({ name: 'ticket-status-chart' })

const props = defineProps({
  segments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const total = computed(() => {
  return props.segments.reduce((s, seg) => s + seg.value, 0)
})

const circumference = 2 * Math.PI * 48

const segmentsWithDash = computed(() => {
  if (!props.segments.length) return []
  const totalVal = props.segments.reduce((s, seg) => s + seg.value, 0) || 1
  // We compute dash arrays manually with donutSegments helper
  let offset = 0
  return props.segments.map((seg) => {
    const length = (seg.value / totalVal) * circumference
    const item = {
      ...seg,
      percent: Math.round((seg.value / totalVal) * 100),
      dashArray: `${Math.max(length, 0)} ${Math.max(circumference - length, 0)}`,
      dashOffset: -offset,
    }
    offset += length
    return item
  })
})

const centerPercent = computed(() => {
  if (!props.segments.length) return 0
  const totalVal = props.segments.reduce((s, seg) => s + seg.value, 0) || 1
  return Math.round((props.segments[0].value / totalVal) * 100)
})
</script>

<style scoped lang="scss">
.status-section {
  margin-bottom: 16px;
}

.section-header { margin-bottom: 8px; }

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.section-total {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
}

.status-content {
  align-items: center;
}

.donut-wrap {
  width: 88px;
  height: 88px;
}

.donut-svg {
  width: 100%;
  height: auto;
  display: block;
}

.donut-segment {
  transition: stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease;
}

.donut-center-pct {
  fill: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
}

.donut-center-label {
  fill: var(--db-text-muted, rgba(255, 255, 255, 0.35));
  font-size: 7px;
  font-family: inherit;
}

.status-legend {
  min-width: 0;
}

.legend-row {
  padding: 2px 0;
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 6px;
}

.legend-label {
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-value {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  min-width: 28px;
  text-align: right;
}

.empty-text {
  font-size: 0.75rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
}
</style>
