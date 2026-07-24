<template>
  <div class="widget glass-panel">
    <div class="widget-header d-flex v-center h-space-between mb-3">
      <div class="d-flex v-center">
        <div class="widget-title-icon color-one-text" v-html="iconSvg"></div>
        <h3 class="widget-title ms-2">Traffic & Users</h3>
      </div>
      <span class="period-badge">Last 30 days</span>
    </div>

    <div v-if="loading" class="loading-state">
      <r-skeleton v-for="n in 4" :key="n" loading height="40px" type="line" class="mb-2"></r-skeleton>
    </div>

    <div v-else class="traffic-content">
      <!-- Mini stats row -->
      <div class="traffic-grid mb-3">
        <div
          v-for="(stat, index) in trafficStats"
          :key="index"
          class="traffic-stat"
        >
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-trend" :class="stat.trend >= 0 ? 'trend-up' : 'trend-down'">
            <r-icon
              v-html="stat.trend >= 0 ? $r.icons.chevron_up : $r.icons.chevron_down"
              width="12"
              height="12"
            ></r-icon>
            <span>{{ Math.abs(stat.trend) }}%</span>
          </div>
        </div>
      </div>

      <!-- Weekly bar chart (renusify progress bars styled as chart) -->
      <div class="chart-section">
        <div class="chart-label">Weekly Page Views</div>
        <div class="chart-bars">
          <div
            v-for="(day, index) in weeklyData"
            :key="index"
            class="chart-bar-item"
          >
            <div class="chart-bar-track">
              <div
                class="chart-bar-fill"
                :style="{ height: day.percent + '%' }"
              ></div>
            </div>
            <span class="chart-bar-label">{{ day.label }}</span>
          </div>
        </div>
      </div>

      <!-- Browser distribution -->
      <div class="browser-dist mt-3">
        <div
          v-for="(browser, index) in browsers"
          :key="index"
          class="browser-row"
        >
          <div class="browser-info d-flex v-center h-space-between mb-1">
            <div class="d-flex v-center">
              <span class="browser-dot" :style="{ background: browser.color }"></span>
              <span class="browser-name">{{ browser.name }}</span>
            </div>
            <span class="browser-percent">{{ browser.percent }}%</span>
          </div>
          <div class="browser-bar-track">
            <div
              class="browser-bar-fill"
              :style="{ width: browser.percent + '%', background: browser.color }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const $r = inject('renusify').$r

defineOptions({
  name: 'traffic-users-widget',
})

const loading = ref(false)

const trafficStats = ref([
  { label: 'Page Views', value: '284.7K', trend: 12.5 },
  { label: 'Visitors', value: '67.2K', trend: 8.3 },
  { label: 'Bounce Rate', value: '32.1%', trend: -2.4 },
  { label: 'Avg Session', value: '4m 32s', trend: 3.7 },
])

const weeklyData = ref([
  { label: 'Mon', percent: 65 },
  { label: 'Tue', percent: 78 },
  { label: 'Wed', percent: 82 },
  { label: 'Thu', percent: 91 },
  { label: 'Fri', percent: 74 },
  { label: 'Sat', percent: 45 },
  { label: 'Sun', percent: 38 },
])

const browsers = ref([
  { name: 'Chrome', percent: 52, color: '#6c63ff' },
  { name: 'Firefox', percent: 18, color: '#60a5fa' },
  { name: 'Safari', percent: 15, color: '#34d399' },
  { name: 'Edge', percent: 10, color: '#fbbf24' },
  { name: 'Other', percent: 5, color: '#94a3b8' },
])

const iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>'
</script>

<style scoped lang="scss">
.widget {
  padding: 20px;
  border-radius: 14px;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    transform: translateY(-2px);
  }
}

.widget-header {
  .widget-title-icon {
    display: inline-flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(108, 99, 255, 0.12);
  }
}

.widget-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  margin: 0;
}

.period-badge {
  font-size: 0.625rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  letter-spacing: 0.02em;
}

// Traffic stats grid
.traffic-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.traffic-stat {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.stat-label {
  font-size: 0.6875rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  margin-bottom: 2px;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  font-size: 0.6875rem;
  font-weight: 600;

  &.trend-up {
    color: #34d399;
  }

  &.trend-down {
    color: #f87171;
  }
}

// Bar chart
.chart-section {
  .chart-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
    margin-bottom: 12px;
  }
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 100px;
}

.chart-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar-track {
  flex: 1;
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px 4px 0 0;
  position: relative;
  overflow: hidden;
}

.chart-bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #6c63ff, rgba(108, 99, 255, 0.4));
  transition: height 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.chart-bar-label {
  font-size: 0.5625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  margin-top: 4px;
  text-transform: uppercase;
}

// Browser distribution
.browser-dist {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.browser-row {
  + .browser-row {
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }
}

.browser-info {
  gap: 4px;
}

.browser-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}

.browser-name {
  font-size: 0.75rem;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
}

.browser-percent {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
}

.browser-bar-track {
  width: 100%;
  height: 5px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.browser-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.loading-state {
  .empty-icon {
    width: 48px;
    height: 48px;
    opacity: 0.2;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  }
}
</style>
