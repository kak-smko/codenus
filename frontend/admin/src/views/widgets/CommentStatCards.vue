<template>
  <div class="stat-grid">
    <div
      v-for="(stat, i) in stats"
      :key="i"
      class="stat-card glass-panel-inner"
      :class="'stat--' + stat.color"
    >
      <div class="stat-top d-flex v-center h-space-between">
        <div class="stat-icon" :class="'s-icon--' + stat.color" v-html="getIcon(stat.iconType)"></div>
        <span v-if="stat.trend != null" class="stat-trend" :class="stat.trend >= 0 ? 'trend-up' : 'trend-down'">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="trend-arrow">
            <polyline :points="stat.trend >= 0 ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"></polyline>
          </svg>
          <span>{{ stat.trend >= 0 ? '+' : '' }}{{ stat.trend }}%</span>
        </span>
      </div>
      <div class="stat-value">{{ typeof stat.value === 'number' ? formatNum(stat.value) : stat.value }}</div>
      <div class="stat-label">{{ stat.label }}</div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'comment-stat-cards' })

defineProps({
  stats: {
    type: Array,
    default: () => [],
  },
})

function formatNum(val) {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (val >= 1_000) return (val / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return val.toLocaleString()
}

const icons = {
  new: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  approved: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  pending: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  rejected: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  stars: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
}

function getIcon(type) {
  return icons[type] || icons.new
}
</script>

<style scoped lang="scss">
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
}

.stat-card {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--db-card-border, rgba(255,255,255,0.05));
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.stat-top {
  margin-bottom: 8px;
}

.stat-icon {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  &.s-icon--info    { background: rgba(96,165,250,0.15); color: #60a5fa; }
  &.s-icon--success { background: rgba(52,211,153,0.15); color: #34d399; }
  &.s-icon--warning { background: rgba(251,191,36,0.15); color: #fbbf24; }
  &.s-icon--error   { background: rgba(248,113,113,0.15); color: #f87171; }
  &.s-icon--one     { background: rgba(108,99,255,0.15); color: #6c63ff; }
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.625rem;
  font-weight: 600;

  &.trend-up   { color: #34d399; }
  &.trend-down { color: #f87171; }
}

.trend-arrow {
  display: block;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255,255,255,0.93));
  line-height: 1.2;
  margin-bottom: 2px;
  letter-spacing: -0.01em;
}

.stat-label {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255,255,255,0.4));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
