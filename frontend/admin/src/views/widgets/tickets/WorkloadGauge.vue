<template>
  <div class="workload-section">
    <div class="section-header d-flex v-center h-space-between mb-2">
      <span class="section-label">Team Workload</span>
    </div>

    <div v-if="loading" class="workload-skeleton d-flex v-center h-center" style="height:100px">
      <r-skeleton loading width="80px" height="80px" type="circle"></r-skeleton>
    </div>

    <div v-else-if="!data" class="workload-empty d-flex v-center h-center py-2">
      <span class="empty-text">No workload data</span>
    </div>

    <div v-else class="workload-content d-flex v-center">
      <div class="gauge-wrap flex-shrink-0">
        <svg viewBox="0 0 120 120" class="gauge-svg">
          <!-- Background circle -->
          <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="8" />
          <!-- Progress arc -->
          <circle cx="60" cy="60" r="48" fill="none"
            :stroke="gaugeColor" stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="dashArray"
            stroke-dashoffset="0"
            transform="rotate(-90 60 60)"
            class="gauge-arc"
          />
          <text x="60" y="52" text-anchor="middle" class="gauge-value">{{ data.currentUtilization }}%</text>
          <text x="60" y="68" text-anchor="middle" class="gauge-label">Utilized</text>
        </svg>
      </div>
      <div class="workload-info ms-3 flex-grow-1">
        <div class="workload-row d-flex v-center h-space-between mb-1">
          <span class="wl-label">Agent Capacity</span>
          <span class="wl-value">{{ data.agentCapacity }}</span>
        </div>
        <div class="workload-row d-flex v-center h-space-between mb-1">
          <span class="wl-label">Current Load</span>
          <span class="wl-value">{{ data.currentUtilization }}%</span>
        </div>
        <div class="workload-row d-flex v-center h-space-between">
          <span class="wl-label">Status</span>
          <span class="wl-status" :class="'wl--' + statusClass">{{ statusLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'workload-gauge' })

const props = defineProps({
  data: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const radius = 48
const circumference = 2 * Math.PI * radius

const dashArray = computed(() => {
  if (!props.data) return '0 301'
  const pct = Math.min(props.data.currentUtilization, 100) / 100
  const filled = pct * circumference
  return `${filled} ${circumference - filled}`
})

const gaugeColor = computed(() => {
  if (!props.data) return '#6c63ff'
  const val = props.data.currentUtilization
  if (val >= 90) return '#f87171'
  if (val >= 75) return '#fbbf24'
  return '#34d399'
})

const statusClass = computed(() => {
  if (!props.data) return 'healthy'
  const val = props.data.currentUtilization
  if (val >= 90) return 'critical'
  if (val >= 75) return 'warning'
  return 'healthy'
})

const statusLabel = computed(() => {
  if (!props.data) return 'Healthy'
  const val = props.data.currentUtilization
  if (val >= 90) return 'Critical'
  if (val >= 75) return 'Warning'
  return 'Healthy'
})
</script>

<style scoped lang="scss">
.workload-section {
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

.workload-content {
  align-items: center;
}

.gauge-wrap {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.gauge-svg {
  width: 100%;
  height: auto;
  display: block;
}

.gauge-arc {
  transition: stroke-dasharray 0.8s ease;
}

.gauge-value {
  fill: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
}

.gauge-label {
  fill: var(--db-text-muted, rgba(255, 255, 255, 0.35));
  font-size: 7px;
  font-family: inherit;
}

.workload-info {
  min-width: 0;
}

.workload-row {
  margin-bottom: 4px;
}

.wl-label {
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.45));
}

.wl-value {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
}

.wl-status {
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 8px;

  &.wl--healthy { background: rgba(52, 211, 153, 0.15); color: #34d399; }
  &.wl--warning { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
  &.wl--critical { background: rgba(248, 113, 113, 0.15); color: #f87171; }
}

.workload-empty .empty-text {
  font-size: 0.75rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
}
</style>
