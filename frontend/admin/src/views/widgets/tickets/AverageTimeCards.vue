<template>
  <div class="avg-section">
    <div class="section-header d-flex v-center h-space-between mb-2">
      <span class="section-label">Average Times</span>
    </div>

    <div v-if="loading" class="avg-grid">
      <div v-for="n in 4" :key="n" class="avg-card glass-panel-inner p-2">
        <r-skeleton loading width="28px" height="28px" type="rect" class="mb-1"></r-skeleton>
        <r-skeleton loading width="40px" height="16px" type="line"></r-skeleton>
        <r-skeleton loading width="50px" height="10px" type="line"></r-skeleton>
      </div>
    </div>

    <div v-else-if="!metrics || metrics.length === 0" class="avg-empty d-flex v-center h-center py-2">
      <span class="empty-text">No time data</span>
    </div>

    <div v-else class="avg-grid">
      <div v-for="(m, i) in metrics" :key="i" class="avg-card glass-panel-inner" role="button" tabindex="0">
        <div class="avg-icon" :class="'avg-icon--' + m.color" v-html="getIcon(m.iconType)"></div>
        <div class="avg-value">{{ m.value }}</div>
        <div class="avg-label">{{ m.label }}</div>
        <div class="avg-trend" :class="m.trend <= 0 ? 'trend-good' : 'trend-bad'">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline :points="m.trend <= 0 ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"></polyline>
          </svg>
          <span>{{ Math.abs(m.trend) }}% vs avg</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'average-time-cards' })

defineProps({
  metrics: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

function getIcon(type) {
  const icons = {
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    message: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  }
  return icons[type] || icons.clock
}
</script>

<style scoped lang="scss">
.avg-section {
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

.avg-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.avg-card {
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
  cursor: default;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
  }
}

.avg-icon {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-bottom: 6px;

  &.avg-icon--success { background: rgba(52, 211, 153, 0.15); color: #34d399; }
  &.avg-icon--info    { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
  &.avg-icon--warning { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
  &.avg-icon--one     { background: rgba(108, 99, 255, 0.15); color: #6c63ff; }
}

.avg-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  line-height: 1.2;
  margin-bottom: 1px;
}

.avg-label {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  font-weight: 500;
  margin-bottom: 4px;
}

.avg-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.5625rem;
  font-weight: 600;

  &.trend-good { color: #34d399; }
  &.trend-bad  { color: #f87171; }
}

.avg-empty .empty-text {
  font-size: 0.75rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
}
</style>
