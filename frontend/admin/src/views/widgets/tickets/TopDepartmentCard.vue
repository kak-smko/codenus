<template>
  <div class="top-dept-section">
    <div class="section-header d-flex v-center h-space-between mb-2">
      <span class="section-label">Top Performing Department</span>
    </div>

    <div v-if="loading" class="top-dept-skeleton">
      <r-skeleton loading height="80px" type="card" class="w-100"></r-skeleton>
    </div>

    <div v-else-if="!dept" class="top-dept-empty d-flex v-center h-center py-2">
      <span class="empty-text">No data</span>
    </div>

    <div v-else class="top-dept-card glass-panel-inner">
      <div class="top-dept-header d-flex v-center h-space-between">
        <div class="d-flex v-center">
          <span class="trophy-icon" v-html="trophySvg"></span>
          <div>
            <div class="top-dept-name">{{ dept.name }}</div>
            <div class="top-dept-subtitle">Response Rate: {{ dept.responseRate }}%</div>
          </div>
        </div>
        <span class="success-badge">Best Performer</span>
      </div>
      <div class="top-dept-stats d-flex h-space-between mt-2">
        <div class="top-stat">
          <span class="top-stat-value">{{ dept.avgResponseTime }}</span>
          <span class="top-stat-label">Avg Response</span>
        </div>
        <div class="top-stat">
          <span class="top-stat-value">{{ dept.ticketsResolved }}</span>
          <span class="top-stat-label">Resolved</span>
        </div>
        <div class="top-stat">
          <span class="top-stat-value trend-up">+{{ dept.trend }}%</span>
          <span class="top-stat-label">vs Last Month</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'top-department-card' })

defineProps({
  dept: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const trophySvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>'
</script>

<style scoped lang="scss">
.top-dept-section {
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

.top-dept-card {
  padding: 12px;
  border-radius: 10px;
  background: rgba(108, 99, 255, 0.06);
  border: 1px solid rgba(108, 99, 255, 0.12);
}

.top-dept-header {
  // header row
}

.trophy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.15);
  flex-shrink: 0;
  margin-right: 10px;
}

.top-dept-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
}

.top-dept-subtitle {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
}

.success-badge {
  font-size: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 12px;
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  white-space: nowrap;
  flex-shrink: 0;
}

.top-dept-stats {
  gap: 8px;
}

.top-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 8px 4px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.top-stat-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));

  &.trend-up { color: #34d399; }
}

.top-stat-label {
  font-size: 0.5625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  margin-top: 2px;
}

.top-dept-empty .empty-text {
  font-size: 0.75rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
}
</style>
