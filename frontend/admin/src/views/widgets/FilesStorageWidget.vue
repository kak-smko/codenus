<template>
  <div class="widget glass-panel storage-widget">
    <div class="widget-header d-flex v-center h-space-between mb-3">
      <div class="d-flex v-center">
        <div class="widget-title-icon color-success-text" v-html="iconSvg"></div>
        <h3 class="widget-title ms-2">Files & Storage</h3>
      </div>
      <div class="header-actions d-flex v-center gap-2">
        <span class="health-badge" :class="'health-badge--' + healthStatus.level">
          <span class="health-dot"></span>
          {{ healthStatus.label }}
        </span>
        <r-btn text size="sm" class="widget-action-btn" @click.prevent="manageFiles">
          <span class="action-text">Manage</span>
          <r-icon v-html="$r.icons.chevron_right" width="16" height="16"></r-icon>
        </r-btn>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="d-flex v-center gap-3 mb-4">
        <r-skeleton loading type="avatar" width="140px" height="140px"></r-skeleton>
        <div class="flex-grow-1">
          <r-skeleton loading height="14px" width="60%" type="line" class="mb-2"></r-skeleton>
          <r-skeleton loading height="12px" width="80%" type="line" class="mb-2"></r-skeleton>
          <r-skeleton loading height="10px" width="50%" type="line"></r-skeleton>
        </div>
      </div>
      <r-skeleton
        v-for="n in 5"
        :key="n"
        loading
        height="40px"
        type="line"
        class="mb-2"
      ></r-skeleton>
    </div>

    <div v-else-if="error" class="error-state text-center py-5">
      <r-icon v-html="errorIcon" width="48" height="48" class="error-icon mb-3"></r-icon>
      <p class="error-text mb-3">Failed to load storage data</p>
      <r-btn outlined size="sm" @click.prevent="retry">Retry</r-btn>
    </div>

    <div v-else-if="isEmpty" class="empty-state text-center py-5">
      <r-icon v-html="emptyIcon" width="48" height="48" class="empty-icon mb-3"></r-icon>
      <p class="empty-text">No storage data available</p>
    </div>

    <div v-else class="storage-content">
      <!-- 1. Storage Overview + Donut Chart -->
      <div class="storage-overview d-flex v-center gap-3 mb-4">
        <div class="donut-container">
          <svg viewBox="0 0 160 160" class="donut-svg">
            <circle
              cx="80"
              cy="80"
              :r="donutRadius"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              stroke-width="18"
            />
            <circle
              cx="80"
              cy="80"
              :r="donutRadius"
              fill="none"
              :stroke="donutColor"
              stroke-width="18"
              stroke-linecap="round"
              :stroke-dasharray="donutDasharray"
              :stroke-dashoffset="donutOffset"
              transform="rotate(-90 80 80)"
              class="donut-fill-segment"
            />
          </svg>
          <div class="donut-center">
            <div class="donut-percent">{{ storageData.usedPercent }}%</div>
            <div class="donut-label">Used</div>
          </div>
        </div>

        <div class="overview-stats flex-grow-1">
          <div class="stat-row mb-2">
            <span class="stat-label">Total Storage</span>
            <span class="stat-value stat-value--primary">{{ storageData.total }}</span>
          </div>
          <div class="stat-row mb-2">
            <span class="stat-label">Used</span>
            <span class="stat-value stat-value--used">{{ storageData.used }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Available</span>
            <span class="stat-value stat-value--available">{{ storageData.available }}</span>
          </div>
        </div>
      </div>

      <!-- 2. Storage Distribution (Donut Legend) -->
      <div class="distribution-section mb-4">
        <h4 class="section-title mb-2">Storage Distribution</h4>
        <div class="distribution-list">
          <div v-for="(item, index) in distribution" :key="index" class="distribution-item">
            <div class="d-flex v-center gap-2 flex-grow-1">
              <span class="dist-dot" :style="{ background: item.color }"></span>
              <span class="dist-name">{{ item.name }}</span>
            </div>
            <span class="dist-percent">{{ item.percent }}%</span>
            <span class="dist-size">{{ item.size }}</span>
          </div>
        </div>
      </div>

      <!-- 3. Storage Trend (Area Chart) -->
      <div class="trend-section mb-4">
        <h4 class="section-title mb-2">Storage Trend (30 days)</h4>
        <div class="trend-chart-wrapper">
          <svg
            viewBox="0 0 300 80"
            class="trend-svg"
            @mousemove="onTrendHover"
            @mouseleave="trendTooltip.visible = false"
          >
            <defs>
              <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color: #6c63ff; stop-opacity: 0.3" />
                <stop offset="100%" style="stop-color: #6c63ff; stop-opacity: 0" />
              </linearGradient>
            </defs>
            <!-- Area -->
            <path :d="trendAreaPath" fill="url(#trendGradient)" />
            <!-- Line -->
            <path
              :d="trendLinePath"
              fill="none"
              stroke="#6c63ff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <!-- Hover dots -->
            <circle
              v-for="(point, i) in trendPoints"
              :key="i"
              :cx="point.x"
              :cy="point.y"
              r="3"
              fill="#6c63ff"
              class="trend-dot"
            />
          </svg>
          <div
            v-if="trendTooltip.visible"
            class="trend-tooltip"
            :style="{ left: trendTooltip.x + 'px', top: trendTooltip.y + 'px' }"
          >
            <div class="tooltip-label">{{ trendTooltip.label }}</div>
            <div class="tooltip-value">{{ trendTooltip.value }}</div>
          </div>
        </div>
      </div>

      <!-- 4. Quick Stats -->
      <div class="quick-stats mb-4">
        <div class="quick-stat-item">
          <div class="quick-stat-label">Files</div>
          <div class="quick-stat-value">{{ quickStats.totalFiles }}</div>
        </div>
        <div class="quick-stat-item">
          <div class="quick-stat-label">Uploads</div>
          <div class="quick-stat-value quick-stat-value--success">
            +{{ quickStats.uploadsToday }}
          </div>
        </div>
        <div class="quick-stat-item">
          <div class="quick-stat-label">Largest</div>
          <div class="quick-stat-value">{{ quickStats.largestFile }}</div>
        </div>
        <div class="quick-stat-item">
          <div class="quick-stat-label">Average</div>
          <div class="quick-stat-value">{{ quickStats.averageSize }}</div>
        </div>
      </div>

      <!-- 5. Quick Actions -->
      <div class="quick-actions d-flex gap-2">
        <r-btn outlined size="sm" class="action-btn flex-grow-1" @click.prevent="uploadFiles">
          <r-icon v-html="uploadIcon" width="14" height="14" class="me-1"></r-icon>
          Upload
        </r-btn>
        <r-btn outlined size="sm" class="action-btn flex-grow-1" @click.prevent="openSettings">
          <r-icon v-html="settingsIcon" width="14" height="14" class="me-1"></r-icon>
          Settings
        </r-btn>
        <r-btn outlined size="sm" class="action-btn flex-grow-1" @click.prevent="cleanTemp">
          <r-icon v-html="cleanIcon" width="14" height="14" class="me-1"></r-icon>
          Clean
        </r-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'

const $r = inject('renusify').$r

defineOptions({
  name: 'files-storage-widget',
})

const emit = defineEmits(['manage', 'upload', 'settings', 'clean', 'retry'])

const loading = ref(false)
const error = ref(false)
const isEmpty = ref(false)

// ---------- Storage Overview Data ----------
const storageData = ref({
  total: '2 TB',
  used: '1.36 TB',
  available: '640 GB',
  usedPercent: 68,
})

// ---------- Distribution Data ----------
const distribution = ref([
  { name: 'Images', percent: 38, size: '516 GB', color: '#60a5fa' },
  { name: 'Documents', percent: 24, size: '326 GB', color: '#fbbf24' },
  { name: 'Videos', percent: 18, size: '245 GB', color: '#a78bfa' },
  { name: 'Backups', percent: 12, size: '163 GB', color: '#34d399' },
  { name: 'Others', percent: 8, size: '109 GB', color: '#94a3b8' },
])

// ---------- Trend Data (mock: 30 days) ----------
const trendData = ref([
  50, 52, 51, 54, 55, 56, 57, 58, 59, 60, 61, 60, 62, 63, 64, 63, 65, 64, 66, 65, 67, 66, 68, 67,
  68, 67, 68, 67, 68, 68,
])

// ---------- Quick Stats ----------
const quickStats = ref({
  totalFiles: '24,381',
  uploadsToday: '184',
  largestFile: '3.2 GB',
  averageSize: '18 MB',
})

// ---------- Health Status ----------
const healthStatus = computed(() => {
  const percent = storageData.value.usedPercent
  if (percent >= 95) return { level: 'critical', label: 'Critical' }
  if (percent >= 80) return { level: 'warning', label: 'Warning' }
  return { level: 'healthy', label: 'Healthy' }
})

// ---------- Donut Chart Calculations ----------
const donutRadius = 64
const donutCircumference = 2 * Math.PI * donutRadius

const donutDasharray = computed(() => {
  const usedLength = (storageData.value.usedPercent / 100) * donutCircumference
  return `${usedLength} ${donutCircumference}`
})

const donutOffset = computed(() => 0)

const donutColor = computed(() => {
  const percent = storageData.value.usedPercent
  if (percent >= 95) return '#f87171'
  if (percent >= 80) return '#fbbf24'
  return '#6c63ff'
})

// ---------- Trend Chart Path Calculations ----------
const trendPoints = computed(() => {
  const width = 300
  const height = 80
  const padding = 10
  const maxVal = Math.max(...trendData.value)
  const minVal = Math.min(...trendData.value)
  const range = maxVal - minVal || 1

  return trendData.value.map((val, i) => {
    const x = padding + (i / (trendData.value.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((val - minVal) / range) * (height - 2 * padding)
    return { x, y, val, day: i + 1 }
  })
})

const trendLinePath = computed(() => {
  if (trendPoints.value.length === 0) return ''
  return trendPoints.value.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')
})

const trendAreaPath = computed(() => {
  if (trendPoints.value.length === 0) return ''
  const first = trendPoints.value[0]
  const last = trendPoints.value[trendPoints.value.length - 1]
  return `M${first.x},80 ${trendLinePath.value.replace('M', 'L')} L${last.x},80 Z`
})

const trendTooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  value: '',
})

function onTrendHover(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const closest = trendPoints.value.reduce((prev, curr) =>
    Math.abs(curr.x - mouseX) < Math.abs(prev.x - mouseX) ? curr : prev,
  )
  trendTooltip.value = {
    visible: true,
    x: closest.x,
    y: closest.y - 10,
    label: `Day ${closest.day}`,
    value: `${closest.val}%`,
  }
}

// ---------- Icons ----------
const iconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>'

const uploadIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'

const settingsIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'

const cleanIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'

const errorIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'

const emptyIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'

// ---------- Actions ----------
function manageFiles() {
  emit('manage')
}

function uploadFiles() {
  emit('upload')
}

function openSettings() {
  emit('settings')
}

function cleanTemp() {
  emit('clean')
}

function retry() {
  error.value = false
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
  emit('retry')
}
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
    background: rgba(52, 211, 153, 0.12);
  }
}

.widget-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  margin: 0;
}

.header-actions {
  gap: 8px;
}

.health-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;

  .health-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  &--healthy {
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;

    .health-dot {
      background: #34d399;
    }
  }

  &--warning {
    background: rgba(251, 191, 36, 0.15);
    color: #fbbf24;

    .health-dot {
      background: #fbbf24;
    }
  }

  &--critical {
    background: rgba(248, 113, 113, 0.15);
    color: #f87171;

    .health-dot {
      background: #f87171;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.widget-action-btn {
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4)) !important;

  .action-text {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: none;
  }
}

/* ---------- Storage Overview + Donut ---------- */
.storage-overview {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.donut-container {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.donut-fill-segment {
  transition:
    stroke-dasharray 1s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    stroke 0.3s;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-percent {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  line-height: 1;
}

.donut-label {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.overview-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  font-weight: 500;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;

  &--primary {
    color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  }

  &--used {
    color: #6c63ff;
  }

  &--available {
    color: #34d399;
  }
}

/* ---------- Distribution ---------- */
.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.75));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.dist-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dist-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.85));
}

.dist-percent {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  min-width: 36px;
  text-align: right;
}

.dist-size {
  font-size: 0.6875rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.5));
  min-width: 60px;
  text-align: right;
}

/* ---------- Trend Chart ---------- */
.trend-chart-wrapper {
  position: relative;
  padding: 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.trend-svg {
  width: 100%;
  height: 80px;
  cursor: crosshair;
}

.trend-dot {
  opacity: 0;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.trend-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  background: rgba(10, 10, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 6px 10px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tooltip-label {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.5));
  margin-bottom: 2px;
}

.tooltip-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c63ff;
}

/* ---------- Quick Stats ---------- */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.quick-stat-item {
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition:
    transform 0.2s,
    background 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.05);
  }
}

.quick-stat-label {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.5));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.quick-stat-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));

  &--success {
    color: #34d399;
  }
}

/* ---------- Quick Actions ---------- */
.quick-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  font-size: 0.6875rem !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.75)) !important;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2) !important;
    background: rgba(255, 255, 255, 0.05) !important;
  }
}

/* ---------- States ---------- */
.loading-state,
.error-state,
.empty-state {
  padding: 20px 0;
}

.error-icon {
  color: #f87171;
  opacity: 0.3;
}

.error-text {
  font-size: 0.8125rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.5));
  margin: 0;
}

.empty-icon {
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  opacity: 0.2;
}

.empty-text {
  font-size: 0.8125rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.5));
  margin: 0;
}

/* ---------- Responsive ---------- */
@media (max-width: 768px) {
  .storage-overview {
    flex-direction: column;
    text-align: center;
  }

  .donut-container {
    margin: 0 auto;
  }

  .overview-stats {
    width: 100%;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    flex-direction: column;

    .action-btn {
      width: 100%;
    }
  }

  .distribution-item {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .health-badge {
    font-size: 0.625rem;
    padding: 3px 8px;
  }

  .widget-action-btn .action-text {
    display: none;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }
}
</style>
