<template>
  <div class="overview-grid">
    <div v-for="(kpi, i) in data" :key="i" class="overview-card glass-panel-inner" role="button" tabindex="0" @keydown.enter="$emit('card-click', kpi)">
      <div class="overview-card-top">
        <div class="overview-icon" :class="'ov-icon--' + kpi.color" v-html="getIcon(kpi.iconType)"></div>
        <span class="overview-trend" :class="kpi.trend >= 0 ? 'trend-up' : 'trend-down'">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="trend-arrow">
            <polyline :points="kpi.trend >= 0 ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"></polyline>
          </svg>
          <span>{{ kpi.trend >= 0 ? '+' : '' }}{{ kpi.trend }}%</span>
        </span>
      </div>
      <div class="overview-value">{{ typeof kpi.value === 'number' ? formatNum(kpi.value) : kpi.value }}</div>
      <div class="overview-label">{{ kpi.label }}</div>
      <div class="overview-sparkline" v-if="sparkline">
        <svg :viewBox="'0 0 ' + sparkW + ' ' + sparkH" class="sparkline-svg">
          <path :d="sparkPath" fill="none" :stroke="sparkColor(kpi.color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    <!-- Skeletons -->
    <template v-if="loading">
      <div v-for="n in 4" :key="'sk-' + n" class="overview-card glass-panel-inner">
        <div class="d-flex v-center h-space-between mb-2">
          <r-skeleton loading width="32px" height="32px" type="rect" class="mb-2"></r-skeleton>
          <r-skeleton loading width="50px" height="12px" type="line"></r-skeleton>
        </div>
        <r-skeleton loading width="70px" height="24px" type="line" class="mb-1"></r-skeleton>
        <r-skeleton loading width="60px" height="10px" type="line"></r-skeleton>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { sparklinePath } from './composables/useChartHelpers.js'

defineOptions({ name: 'ticket-overview-cards' })

const props = defineProps({
  data: { type: Array, default: () => [] },
  sparklines: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['card-click'])

const sparkW = 80
const sparkH = 24

function sparkColor(color) {
  const map = { warning: '#fbbf24', success: '#34d399', info: '#60a5fa', one: '#6c63ff' }
  return map[color] || '#6c63ff'
}

const sparkPath = computed(() => {
  if (!props.sparklines) return ''
  const data = props.sparklines
  const firstKey = Object.keys(data)[0]
  if (!firstKey) return ''
  return sparklinePath(data[firstKey], sparkW, sparkH)
})

function formatNum(val) {
  if (val >= 1000) return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return val.toString()
}

function getIcon(type) {
  const icons = {
    open: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    closed: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    new: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    sla: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  }
  return icons[type] || icons.open
}
</script>

<style scoped lang="scss">
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.overview-card {
  padding: 12px;
  border-radius: 10px;
  cursor: default;
  transition: all 0.25s ease;
  outline: none;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    transform: translateY(-2px);
  }
  &:focus-visible {
    box-shadow: 0 0 0 2px var(--db-accent, #6c63ff);
  }
}

.overview-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.overview-icon {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;

  &.ov-icon--warning { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
  &.ov-icon--success { background: rgba(52, 211, 153, 0.15); color: #34d399; }
  &.ov-icon--info    { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
  &.ov-icon--one     { background: rgba(108, 99, 255, 0.15); color: #6c63ff; }
}

.overview-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 12px;
  white-space: nowrap;

  &.trend-up   { background: rgba(52, 211, 153, 0.12); color: #34d399; }
  &.trend-down { background: rgba(248, 113, 113, 0.12); color: #f87171; }

  .trend-arrow { display: inline-flex; line-height: 0; }
}

.overview-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  line-height: 1.2;
  margin-bottom: 2px;
  letter-spacing: -0.02em;
}

.overview-label {
  font-size: 0.6875rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  font-weight: 500;
  margin-bottom: 6px;
}

.overview-sparkline {
  width: 100%;
  height: 24px;

  .sparkline-svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>
