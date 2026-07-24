<template>
  <div class="widget glass-panel admin-activity-widget">
    <div class="widget-header d-flex v-center h-space-between mb-3">
      <div class="d-flex v-center">
        <div class="widget-title-icon color-warning-text" v-html="iconSvg"></div>
        <h3 class="widget-title ms-2">Admin Activity</h3>
      </div>
      <r-btn text size="sm" class="widget-action-btn" @click.prevent="viewAll">
        <span class="action-text">All Activity</span>
        <r-icon v-html="$r.icons.chevron_right" width="16" height="16"></r-icon>
      </r-btn>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="d-flex v-center h-center mb-4">
        <r-skeleton loading type="avatar" width="140px" height="140px"></r-skeleton>
      </div>
      <div v-for="n in 6" :key="n" class="d-flex v-center mb-3">
        <r-skeleton loading type="avatar" width="36px" height="36px" class="me-2"></r-skeleton>
        <div class="flex-grow-1">
          <r-skeleton loading height="12px" width="70%" type="line" class="mb-1"></r-skeleton>
          <r-skeleton loading height="10px" width="40%" type="line"></r-skeleton>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- Donut Overview -->
      <div class="donut-wrapper d-flex v-center">
        <div class="donut-chart-container">
          <svg viewBox="0 0 160 160" class="donut-svg">
            <circle
              cx="80"
              cy="80"
              :r="radius"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              stroke-width="16"
            />
            <circle
              v-for="(segment, index) in segments"
              :key="index"
              cx="80"
              cy="80"
              :r="radius"
              fill="none"
              :stroke="segment.color"
              stroke-width="16"
              stroke-linecap="round"
              :stroke-dasharray="segment.dasharray"
              :stroke-dashoffset="segment.offset"
              class="donut-segment"
              :style="{ '--delay': index * 0.1 + 's' }"
              transform="rotate(-90 80 80)"
            />
          </svg>
          <div class="donut-center">
            <div class="donut-center-value">{{ totalActivities }}</div>
            <div class="donut-center-label">Actions</div>
          </div>
        </div>

        <div class="donut-legend">
          <div v-for="(item, index) in legendData" :key="index" class="legend-item">
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value">{{ item.count }}</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-row d-flex v-center mb-3">
        <div class="filter-group">
          <select v-model="selectedAdmin" class="filter-select">
            <option value="">All Admins</option>
            <option v-for="admin in adminList" :key="admin" :value="admin">{{ admin }}</option>
          </select>
        </div>
        <div class="filter-group">
          <select v-model="selectedType" class="filter-select">
            <option value="">All Types</option>
            <option v-for="type in typeList" :key="type" :value="type">
              {{ typeLabels[type] || type }}
            </option>
          </select>
        </div>
        <r-btn
          v-if="selectedAdmin || selectedType"
          text
          size="sm"
          class="clear-filter-btn"
          @click.prevent="clearFilters"
        >
          Clear
        </r-btn>
      </div>

      <!-- Activity Feed (Timeline) -->
      <div class="activity-list">
        <div v-if="visibleActivities.length === 0" class="empty-feed">
          <r-icon v-html="$r.icons.inbox" width="40" height="40" class="empty-icon"></r-icon>
          <p>No activity found</p>
        </div>

        <a
          v-for="(activity, index) in visibleActivities"
          :key="index"
          :href="activity.link"
          class="activity-item"
          @click.prevent="openDetail(activity)"
        >
          <div class="activity-line">
            <div class="activity-avatar-wrap">
              <img
                v-if="activity.avatar"
                :src="activity.avatar"
                :alt="activity.actor"
                class="activity-avatar"
              />
              <div v-else class="activity-avatar activity-avatar--fallback">
                {{ getInitials(activity.actor) }}
              </div>
              <div class="activity-type-icon" :style="{ background: typeColors[activity.type] }">
                <r-icon v-html="typeIcons[activity.type]" width="10" height="10"></r-icon>
              </div>
            </div>

            <div class="activity-content">
              <div class="activity-text">
                <span class="activity-actor">{{ activity.actor }}</span>
                <span class="activity-role">{{ activity.role }}</span>
                <span class="activity-action-text">{{ activity.action }}</span>
                <span class="activity-target" v-if="activity.target">{{ activity.target }}</span>
              </div>
              <div class="activity-meta d-flex v-center">
                <span class="activity-time">{{ activity.time }}</span>
                <span class="activity-badge" :style="{ color: typeColors[activity.type] }">
                  {{ typeLabels[activity.type] || activity.type }}
                </span>
              </div>
            </div>
          </div>
        </a>
      </div>

      <!-- Load More -->
      <div v-if="hasMore" class="d-flex h-center mt-3">
        <r-btn outlined size="sm" class="load-more-btn" @click.prevent="loadMore">
          Load More
        </r-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'

const $r = inject('renusify').$r

defineOptions({
  name: 'recent-activity-widget',
})

const emit = defineEmits(['view-all', 'open-detail'])

const loading = ref(false)

// ---------- Type Config ----------
const typeColors = {
  reply: '#60a5fa',
  approve: '#34d399',
  delete: '#f87171',
  publish: '#a78bfa',
  edit: '#fbbf24',
  upload: '#22d3ee',
  status: '#fb923c',
  settings: '#94a3b8',
  category: '#4ade80',
  error: '#f43f5e',
}

const typeLabels = {
  reply: 'Ticket Reply',
  approve: 'Comment Approved',
  delete: 'Comment Deleted',
  publish: 'Article Published',
  edit: 'Article Edited',
  upload: 'File Uploaded',
  status: 'User Status',
  settings: 'Settings Update',
  category: 'Category Created',
  error: 'Error Fixed',
}

const typeIcons = {
  reply:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  approve:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>',
  delete:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/></svg>',
  publish:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
  upload:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  status:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  settings:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  category:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>',
  error:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
}

// ---------- Raw Data (mock: 25 items) ----------
const allActivities = ref([
  {
    actor: 'Sara Ahmadi',
    role: 'Support Agent',
    avatar: '',
    action: 'replied to ticket',
    target: '#4521 - Login Issue',
    type: 'reply',
    time: '2 min ago',
    link: '#',
  },
  {
    actor: 'Ali Rezaei',
    role: 'Moderator',
    avatar: '',
    action: 'approved comment on',
    target: '"Security Best Practices"',
    type: 'approve',
    time: '10 min ago',
    link: '#',
  },
  {
    actor: 'Sara Ahmadi',
    role: 'Support Agent',
    avatar: '',
    action: 'deleted spam comment on',
    target: '"Renusify v3 Release"',
    type: 'delete',
    time: '25 min ago',
    link: '#',
  },
  {
    actor: 'Mohammad Karimi',
    role: 'Content Editor',
    avatar: '',
    action: 'published article',
    target: '"Getting Started with Renusify"',
    type: 'publish',
    time: '40 min ago',
    link: '#',
  },
  {
    actor: 'Neda Hosseini',
    role: 'Content Editor',
    avatar: '',
    action: 'edited article',
    target: '"Dashboard Widgets Guide"',
    type: 'edit',
    time: '1 hour ago',
    link: '#',
  },
  {
    actor: 'Ali Rezaei',
    role: 'Moderator',
    avatar: '',
    action: 'uploaded file',
    target: 'user-manual-v2.pdf',
    type: 'upload',
    time: '1 hour ago',
    link: '#',
  },
  {
    actor: 'Sara Ahmadi',
    role: 'Support Agent',
    avatar: '',
    action: 'changed status of user',
    target: 'jane.doe@company.com',
    type: 'status',
    time: '2 hours ago',
    link: '#',
  },
  {
    actor: 'Admin Root',
    role: 'Super Admin',
    avatar: '',
    action: 'updated settings for',
    target: 'email notifications',
    type: 'settings',
    time: '2 hours ago',
    link: '#',
  },
  {
    actor: 'Mohammad Karimi',
    role: 'Content Editor',
    avatar: '',
    action: 'created category',
    target: '"Tutorials"',
    type: 'category',
    time: '3 hours ago',
    link: '#',
  },
  {
    actor: 'Neda Hosseini',
    role: 'Content Editor',
    avatar: '',
    action: 'fixed error on',
    target: 'payment gateway',
    type: 'error',
    time: '3 hours ago',
    link: '#',
  },
  {
    actor: 'Ali Rezaei',
    role: 'Moderator',
    avatar: '',
    action: 'approved comment on',
    target: '"Roadmap 2025"',
    type: 'approve',
    time: '4 hours ago',
    link: '#',
  },
  {
    actor: 'Sara Ahmadi',
    role: 'Support Agent',
    avatar: '',
    action: 'replied to ticket',
    target: '#4498 - Billing Question',
    type: 'reply',
    time: '4 hours ago',
    link: '#',
  },
  {
    actor: 'Admin Root',
    role: 'Super Admin',
    avatar: '',
    action: 'deleted comment on',
    target: '"Old Announcement"',
    type: 'delete',
    time: '5 hours ago',
    link: '#',
  },
  {
    actor: 'Mohammad Karimi',
    role: 'Content Editor',
    avatar: '',
    action: 'published article',
    target: '"Vue 3 Composition API Tips"',
    type: 'publish',
    time: '5 hours ago',
    link: '#',
  },
  {
    actor: 'Neda Hosseini',
    role: 'Content Editor',
    avatar: '',
    action: 'edited article',
    target: '"SEO Checklist"',
    type: 'edit',
    time: '6 hours ago',
    link: '#',
  },
  {
    actor: 'Ali Rezaei',
    role: 'Moderator',
    avatar: '',
    action: 'uploaded file',
    target: 'terms-of-service.docx',
    type: 'upload',
    time: '6 hours ago',
    link: '#',
  },
  {
    actor: 'Sara Ahmadi',
    role: 'Support Agent',
    avatar: '',
    action: 'changed status of user',
    target: 'test.user@company.com',
    type: 'status',
    time: '7 hours ago',
    link: '#',
  },
  {
    actor: 'Admin Root',
    role: 'Super Admin',
    avatar: '',
    action: 'updated settings for',
    target: 'backup schedule',
    type: 'settings',
    time: '8 hours ago',
    link: '#',
  },
  {
    actor: 'Mohammad Karimi',
    role: 'Content Editor',
    avatar: '',
    action: 'created category',
    target: '"Announcements"',
    type: 'category',
    time: '9 hours ago',
    link: '#',
  },
  {
    actor: 'Neda Hosseini',
    role: 'Content Editor',
    avatar: '',
    action: 'fixed error on',
    target: 'image upload module',
    type: 'error',
    time: '10 hours ago',
    link: '#',
  },
  {
    actor: 'Sara Ahmadi',
    role: 'Support Agent',
    avatar: '',
    action: 'replied to ticket',
    target: '#4471 - Password Reset',
    type: 'reply',
    time: '11 hours ago',
    link: '#',
  },
  {
    actor: 'Ali Rezaei',
    role: 'Moderator',
    avatar: '',
    action: 'deleted spam comment on',
    target: '"Welcome Post"',
    type: 'delete',
    time: '12 hours ago',
    link: '#',
  },
  {
    actor: 'Admin Root',
    role: 'Super Admin',
    avatar: '',
    action: 'approved comment on',
    target: '"Feature Request"',
    type: 'approve',
    time: '13 hours ago',
    link: '#',
  },
  {
    actor: 'Mohammad Karimi',
    role: 'Content Editor',
    avatar: '',
    action: 'published article',
    target: '"API Reference v2"',
    type: 'publish',
    time: '14 hours ago',
    link: '#',
  },
  {
    actor: 'Neda Hosseini',
    role: 'Content Editor',
    avatar: '',
    action: 'edited article',
    target: '"Changelog"',
    type: 'edit',
    time: '15 hours ago',
    link: '#',
  },
])

const iconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'

// ---------- Filters ----------
const selectedAdmin = ref('')
const selectedType = ref('')
const pageSize = 8
const currentPage = ref(1)

const adminList = computed(() => {
  return [...new Set(allActivities.value.map((a) => a.actor))]
})

const typeList = computed(() => {
  return [...new Set(allActivities.value.map((a) => a.type))]
})

const filteredActivities = computed(() => {
  return allActivities.value.filter((a) => {
    const matchAdmin = !selectedAdmin.value || a.actor === selectedAdmin.value
    const matchType = !selectedType.value || a.type === selectedType.value
    return matchAdmin && matchType
  })
})

const visibleActivities = computed(() => {
  return filteredActivities.value.slice(0, currentPage.value * pageSize)
})

const hasMore = computed(() => {
  return visibleActivities.value.length < filteredActivities.value.length
})

function loadMore() {
  currentPage.value += 1
}

function clearFilters() {
  selectedAdmin.value = ''
  selectedType.value = ''
  currentPage.value = 1
}

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function openDetail(activity) {
  emit('open-detail', activity)
}

// ---------- Donut Chart (overview of ALL activities, not just visible) ----------
const radius = 64
const circumference = 2 * Math.PI * radius

const totalActivities = computed(() => allActivities.value.length)

const typeCounts = computed(() => {
  const counts = {}
  allActivities.value.forEach((a) => {
    counts[a.type] = (counts[a.type] || 0) + 1
  })
  return counts
})

const chartData = computed(() => {
  const total = totalActivities.value || 1
  let cumulative = 0
  const gap = 3

  return Object.entries(typeCounts.value).map(([type, count]) => {
    const fraction = count / total
    const length = Math.max(fraction * circumference - gap, 0)
    const offset = circumference - cumulative
    cumulative += fraction * circumference

    return {
      type,
      count,
      color: typeColors[type] || '#60a5fa',
      label: typeLabels[type] || type,
      dasharray: `${length} ${circumference}`,
      offset,
    }
  })
})

const segments = computed(() =>
  chartData.value.map((d) => ({ color: d.color, dasharray: d.dasharray, offset: d.offset })),
)
const legendData = computed(() =>
  chartData.value.map((d) => ({ label: d.label, count: d.count, color: d.color })),
)

function viewAll() {
  emit('view-all')
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
    background: rgba(251, 191, 36, 0.12);
  }
}

.widget-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  margin: 0;
}

.widget-action-btn {
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4)) !important;

  .action-text {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: none;
  }
}

/* ---------- Donut Chart ---------- */
.donut-wrapper {
  gap: 20px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
}

.donut-chart-container {
  position: relative;
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.donut-segment {
  transition: stroke-dasharray 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: fadeInSegment 0.6s ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

@keyframes fadeInSegment {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-center-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  line-height: 1;
}

.donut-center-label {
  font-size: 0.6rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.donut-legend {
  flex: 1;
  min-width: 160px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.6875rem;
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-value {
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  font-weight: 600;
}

/* ---------- Filters ---------- */
.filters-row {
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.75));
  font-size: 0.75rem;
  padding: 6px 10px;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover,
  &:focus {
    border-color: rgba(255, 255, 255, 0.2);
  }

  option {
    background: var(--db-bg, #0a0a14);
    color: #fff;
  }
}

.clear-filter-btn {
  color: var(--db-error, #f87171) !important;
  font-size: 0.75rem;
}

/* ---------- Activity Feed ---------- */
.activity-list {
  position: relative;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
}

.activity-item {
  position: relative;
  display: block;
  padding: 8px;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.2s;
  margin-bottom: 2px;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
}

.activity-line {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.activity-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.activity-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.06);

  &--fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--db-text-primary, rgba(255, 255, 255, 0.85));
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(167, 139, 250, 0.3));
  }
}

.activity-type-icon {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--db-bg, #0a0a14);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 0.75rem;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  line-height: 1.5;
  margin-bottom: 3px;
}

.activity-actor {
  font-weight: 600;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
}

.activity-role {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  margin-left: 4px;

  &::before {
    content: '·';
    margin-right: 4px;
  }
}

.activity-action-text {
  margin-left: 4px;
}

.activity-target {
  font-weight: 500;
  color: var(--db-info, #60a5fa);
  font-style: italic;
  margin-left: 4px;
}

.activity-meta {
  gap: 8px;
}

.activity-time {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
}

.activity-badge {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
}

.empty-feed {
  text-align: center;
  padding: 40px 0;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));

  .empty-icon {
    opacity: 0.3;
    margin-bottom: 8px;
  }

  p {
    font-size: 0.8125rem;
    margin: 0;
  }
}

.load-more-btn {
  font-size: 0.75rem;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65)) !important;
}

.loading-state {
  .empty-icon {
    width: 48px;
    height: 48px;
    opacity: 0.2;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  }
}

@media (max-width: 576px) {
  .donut-wrapper {
    flex-direction: column;
  }

  .donut-legend {
    width: 100%;
    grid-template-columns: 1fr;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;

    .filter-select {
      width: 100%;
    }
  }
}
</style>
