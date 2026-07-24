<template>
  <div class="sla-section">
    <div class="section-header d-flex v-center h-space-between mb-2">
      <span class="section-label">SLA &amp; Response Health</span>
    </div>

    <div v-if="loading" class="sla-skeleton">
      <div v-for="n in 3" :key="n" class="mb-2">
        <r-skeleton loading height="10px" width="100px" type="line" class="mb-1"></r-skeleton>
        <r-skeleton loading height="8px" type="line" class="w-100"></r-skeleton>
      </div>
    </div>

    <div v-else-if="!metrics || metrics.length === 0" class="sla-empty d-flex v-center h-center py-2">
      <span class="empty-text">No SLA data</span>
    </div>

    <div v-else class="sla-list">
      <div v-for="(m, i) in metrics" :key="i" class="sla-row mb-2">
        <div class="sla-header d-flex v-center h-space-between mb-1">
          <span class="sla-label">{{ m.label }}</span>
          <div class="sla-meta d-flex v-center">
            <span class="sla-value">{{ m.value }}%</span>
            <span class="sla-trend" :class="m.trend >= 0 ? 'trend-up' : 'trend-down'">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline :points="m.trend >= 0 ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"></polyline>
              </svg>
              {{ Math.abs(m.trend) }}%
            </span>
          </div>
        </div>
        <div class="sla-bar-track">
          <div class="sla-bar-fill" :style="{ width: m.value + '%', background: m.color }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'sla-health' })

defineProps({
  metrics: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>

<style scoped lang="scss">
.sla-section {
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

.sla-list {
  display: flex;
  flex-direction: column;
}

.sla-row {
  // each row
}

.sla-header {
  margin-bottom: 2px;
}

.sla-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
}

.sla-meta {
  gap: 4px;
}

.sla-value {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
}

.sla-trend {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  font-size: 0.5625rem;
  font-weight: 600;

  &.trend-up   { color: #34d399; }
  &.trend-down { color: #f87171; }
}

.sla-bar-track {
  height: 5px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.sla-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.sla-empty .empty-text {
  font-size: 0.75rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
}
</style>
