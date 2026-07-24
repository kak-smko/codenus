<template>
  <div class="kpi-summary">
    <!-- ========== LOADING STATE ========== -->
    <template v-if="loading">
      <r-row dense>
        <r-col v-for="n in 4" :key="n" class="lg-3 col-6">
          <div class="kpi-card glass-panel">
            <div>
              <div class="d-flex v-center mb-2">
                <r-skeleton
                  loading
                  type="avatar"
                  width="36px"
                  height="36px"
                  class="me-2"
                ></r-skeleton>
                <r-skeleton loading height="12px" width="60%" type="line"></r-skeleton>
              </div>
              <r-skeleton loading height="26px" width="50%" type="line" class="mb-2"></r-skeleton>
              <div class="d-flex v-center h-space-between">
                <r-skeleton loading height="10px" width="40%" type="line"></r-skeleton>
                <r-skeleton loading height="10px" width="30%" type="line"></r-skeleton>
              </div>
            </div>
          </div>
        </r-col>
      </r-row>
    </template>

    <!-- ========== ERROR STATE ========== -->
    <template v-else-if="error">
      <div class="error-state glass-panel d-flex flex-column v-center h-center py-5">
        <div class="error-icon mb-2" v-html="errorIconSvg"></div>
        <p class="error-text">{{ error }}</p>
        <r-btn text size="sm" class="mt-2" @click="retry">Retry</r-btn>
      </div>
    </template>

    <!-- ========== EMPTY STATE ========== -->
    <template v-else-if="kpis.length === 0">
      <div class="empty-state glass-panel d-flex flex-column v-center h-center py-5">
        <div class="empty-icon mb-2" v-html="emptyIconSvg"></div>
        <p class="empty-text">No KPI data available</p>
      </div>
    </template>

    <!-- ========== CONTENT ========== -->
    <template v-else>
      <r-row dense>
        <r-col
          v-for="(kpi, index) in kpis"
          :key="index"
          class="lg-3 col-6">
          <div
            class="kpi-card glass-panel"
            :style="{ '--card-delay': index * 0.08 + 's' }"
          >
            <!-- Card header with icon and label -->
            <div class="kpi-header d-flex v-center h-space-between mb-3">
              <div class="d-flex v-center" style="min-width: 0; overflow: hidden;">
                <div class="kpi-icon" :class="`kpi-icon--${kpi.color}`" v-html="kpi.icon"></div>
                <span class="kpi-label ms-2">{{ kpi.label }}</span>
              </div>
              <!-- Trend badge -->
              <div class="kpi-trend" :class="kpi.trend >= 0 ? 'trend-up' : 'trend-down'">
                <span class="trend-arrow" v-html="kpi.trend >= 0 ? arrowUpSvg : arrowDownSvg"></span>
                <span class="trend-value">{{ Math.abs(kpi.trend) }}%</span>
              </div>
            </div>

            <!-- Main value -->
            <div class="kpi-value-row mb-2">
              <div class="kpi-value">{{ kpi.value }}</div>
            </div>

            <!-- Sparkline + subtitle row -->
            <div class="kpi-footer d-flex v-center h-space-between">
              <span class="kpi-subtitle">{{ kpi.subtitle }}</span>
              <div
                class="kpi-sparkline"
                v-if="kpi.sparklineData"
                v-html="getSparkline(kpi.sparklineData, kpi.sparklineColor)"
              ></div>
            </div>
          </div>
        </r-col>
      </r-row>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'kpi-summary-cards',
})

defineEmits(['refresh'])

// ── States ──
const loading = ref(false)
const error = ref(null)

// ── KPI Data ──
const kpis = ref([
  {
    label: 'Total Users',
    value: '12,847',
    subtitle: 'Active accounts',
    trend: 8.2,
    color: 'one',
    sparklineColor: '#6c63ff',
    sparklineData: [10240, 10850, 11200, 11680, 11920, 12300, 12540, 12780, 12847],
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  },
  {
    label: 'Open Tickets',
    value: '342',
    subtitle: 'Across all departments',
    trend: -3.5,
    color: 'warning',
    sparklineColor: '#fbbf24',
    sparklineData: [380, 365, 370, 358, 350, 345, 348, 340, 342],
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  },
  {
    label: 'Comments',
    value: '2,431',
    subtitle: 'Pending moderation',
    trend: 12.1,
    color: 'info',
    sparklineColor: '#60a5fa',
    sparklineData: [1800, 1950, 2050, 2150, 2220, 2310, 2380, 2410, 2431],
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  },
  {
    label: 'Storage Used',
    value: '68.3 GB',
    subtitle: 'Of 120 GB total',
    trend: 4.7,
    color: 'success',
    sparklineColor: '#34d399',
    sparklineData: [52, 55, 58, 60, 62, 64, 66, 67.5, 68.3],
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
  },
])

// ── Sparkline Generator ──
function getSparkline(data, color) {
  if (!data || data.length < 2) return ''
  const width = 64
  const height = 24
  const padding = 2
  const chartW = width - padding * 2
  const chartH = height - padding * 2
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = chartW / (data.length - 1)

  const points = data.map((val, i) => {
    const x = padding + i * step
    const y = padding + chartH - ((val - min) / range) * chartH
    return `${x},${y}`
  })

  const line = points.join(' L')
  const firstX = padding
  const lastX = padding + (data.length - 1) * step
  const bottomY = padding + chartH
  const area = `M${points[0]} L${line} L${lastX},${bottomY} L${firstX},${bottomY} Z`

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sparkGrad_${color.replace('#', '')}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.25"/>
          <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#sparkGrad_${color.replace('#', '')})"/>
      <path d="M${line}" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  `
}

// ── Icons ──
const errorIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
const emptyIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'

const arrowUpSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>'
const arrowDownSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'

// ── Actions ──
function retry() {
  error.value = null
}
</script>

<style scoped lang="scss">
// ── KPI Card ──
.kpi-card {
  padding: 20px;
  height: 100%;
  animation: cardIn 0.4s ease both;
  animation-delay: var(--card-delay, 0s);
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ── Card Header ──
.kpi-header {
  min-width: 0;
}

.kpi-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  color: #fff;

  &--one {
    background: linear-gradient(135deg, #6c63ff, #4834d4);
    box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
  }

  &--warning {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  }

  &--info {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
  }

  &--success {
    background: linear-gradient(135deg, #34d399, #10b981);
    box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
  }
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

// ── Trend Badge ──
.kpi-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;

  &.trend-up {
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;
  }

  &.trend-down {
    background: rgba(248, 113, 113, 0.15);
    color: #f87171;
  }
}

.trend-arrow {
  display: inline-flex;
  align-items: center;
}

.trend-value {
  line-height: 1;
}

// ── Value ──
.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  line-height: 1.2;
  letter-spacing: -0.02em;
}

// ── Footer ──
.kpi-footer {
  gap: 8px;
}

.kpi-subtitle {
  font-size: 0.6875rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.kpi-sparkline {
  flex-shrink: 0;
  display: inline-flex;
  align-items: flex-end;
  opacity: 0.65;
  transition: opacity 0.25s ease;

  .kpi-card:hover & {
    opacity: 1;
  }
}

// ── States ──
.error-state,
.empty-state {
  border-radius: 14px;

  .empty-icon,
  .error-icon {
    width: 48px;
    height: 48px;
    opacity: 0.2;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  }

  .error-icon {
    opacity: 0.5;
    color: #f87171;
  }

  .empty-text,
  .error-text {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.5));
    margin: 0;
  }
}

// ── Responsive Fine-tuning ──
@media (max-width: 576px) {
  .kpi-card {
    padding: 14px;
  }

  .kpi-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;

    :deep(svg) {
      width: 16px;
      height: 16px;
    }
  }

  .kpi-value {
    font-size: 1.25rem;
  }

  .kpi-trend {
    padding: 1px 6px;
    font-size: 0.625rem;
  }
}
</style>
