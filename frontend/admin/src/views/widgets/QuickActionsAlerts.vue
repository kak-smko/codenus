<template>
  <div class="sidebar-widgets">
    <!-- Quick Actions -->
    <div class="widget glass-panel mb-3">
      <div class="widget-header d-flex v-center h-space-between mb-3">
        <div class="d-flex v-center">
          <div class="widget-title-icon color-one-text" v-html="actionIconSvg"></div>
          <h3 class="widget-title ms-2">Quick Actions</h3>
        </div>
      </div>

      <div class="actions-grid">
        <button
          v-for="(action, index) in quickActions"
          :key="index"
          class="action-btn"
          @click="handleAction(action)"
        >
          <div class="action-btn-icon" :class="'action-btn-icon--' + action.color" v-html="action.icon"></div>
          <span class="action-btn-label">{{ action.label }}</span>
        </button>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const $r = inject('renusify').$r

defineOptions({
  name: 'quick-actions-alerts',
})

const loading = ref(false)

const quickActions = ref([
  {
    label: 'New User',
    color: 'one',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  },
  {
    label: 'New Article',
    color: 'info',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  },
  {
    label: 'Backup',
    color: 'warning',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  },
  {
    label: 'Settings',
    color: 'success',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  },
])

const alerts = ref([
  {
    title: 'Server CPU usage at 87%',
    description: 'Production server-01 is nearing capacity',
    severity: 'critical',
  },
  {
    title: 'SSL certificate expiring',
    description: 'Certificate for api.codenus.app expires in 14 days',
    severity: 'warning',
  },
  {
    title: 'New update available',
    description: 'Renusify v3.2.0 is ready for installation',
    severity: 'info',
  },
])

const actionIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>'

const alertIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'

const checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'

function getAlertIcon(severity) {
  if (severity === 'critical') {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  } else if (severity === 'warning') {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
}

function handleAction(action) {
  // Action handler stub - would navigate or trigger action
  console.log('Action clicked:', action.label)
}

function dismissAlert(index) {
  alerts.value.splice(index, 1)
}

function dismissAll() {
  alerts.value = []
}
</script>

<style scoped lang="scss">
.widget {
  padding: 20px;
  border-radius: 14px;
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
  }
}

.widget-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  margin: 0;
}

.alert-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
  font-size: 0.625rem;
  font-weight: 700;
}

.widget-action-btn {
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4)) !important;

  .action-text {
    font-size: 0.6875rem;
    font-weight: 500;
    text-transform: none;
  }
}

// Quick Actions
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  outline: none;
  color: inherit;
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.action-btn-icon {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  &--one {
    background: rgba(108, 99, 255, 0.15);
    color: #6c63ff;
  }

  &--info {
    background: rgba(96, 165, 250, 0.15);
    color: #60a5fa;
  }

  &--warning {
    background: rgba(251, 191, 36, 0.15);
    color: #fbbf24;
  }

  &--success {
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;
  }
}

.action-btn-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  text-align: center;
}

// Alerts
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateX(2px);
  }

  &.alert--critical {
    background: rgba(248, 113, 113, 0.06);
    border-color: rgba(248, 113, 113, 0.15);
    .alert-icon { color: #f87171; }
    .alert-title { color: #f87171; }
  }

  &.alert--warning {
    background: rgba(251, 191, 36, 0.06);
    border-color: rgba(251, 191, 36, 0.15);
    .alert-icon { color: #fbbf24; }
    .alert-title { color: #fbbf24; }
  }

  &.alert--info {
    background: rgba(96, 165, 250, 0.06);
    border-color: rgba(96, 165, 250, 0.15);
    .alert-icon { color: #60a5fa; }
    .alert-title { color: #60a5fa; }
  }
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 2px;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
}

.alert-desc {
  font-size: 0.6875rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  line-height: 1.4;
}

.alert-dismiss {
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4)) !important;
  flex-shrink: 0;
}

.empty-state {
  .empty-icon {
    width: 40px;
    height: 40px;
  }

  .empty-text {
    font-size: 0.8125rem;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  }
}

.loading-state {
  .empty-text {
    font-size: 0.8125rem;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  }
}
</style>
