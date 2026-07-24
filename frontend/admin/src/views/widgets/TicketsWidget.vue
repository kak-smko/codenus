<template>
  <div class="widget glass-panel">
    <!-- Header -->
    <div class="widget-header d-flex v-center h-space-between mb-3">
      <div class="d-flex v-center">
        <div class="widget-title-icon color-warning-text" v-html="ticketIconSvg"></div>
        <h3 class="widget-title ms-2">Tickets Overview</h3>
      </div>
      <r-btn text size="sm" class="widget-action-btn" @click.prevent="handleRefresh">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        <span class="ms-1">Refresh</span>
      </r-btn>
    </div>

    <!-- ========== LOADING STATE ========== -->
    <template v-if="loading">
      <div class="loading-state">
        <div class="d-flex v-center h-space-between mb-3">
          <r-skeleton loading width="100px" height="14px" type="line"></r-skeleton>
          <r-skeleton loading width="60px" height="12px" type="line"></r-skeleton>
        </div>
        <TicketOverviewCards :loading="true" />
        <div class="mt-3">
          <r-skeleton loading height="140px" type="line" class="w-100"></r-skeleton>
        </div>
        <div class="mt-3">
          <r-skeleton loading height="80px" type="line" class="w-100"></r-skeleton>
        </div>
        <div class="mt-3">
          <r-skeleton loading height="80px" type="line" class="w-100"></r-skeleton>
        </div>
      </div>
    </template>

    <!-- ========== ERROR STATE ========== -->
    <template v-else-if="error">
      <div class="error-state d-flex flex-column v-center h-center py-5">
        <div class="error-icon mb-2" v-html="errorIconSvg"></div>
        <p class="error-text">{{ error }}</p>
        <r-btn text size="sm" class="mt-2" @click="handleRefresh">Retry</r-btn>
      </div>
    </template>

    <!-- ========== EMPTY STATE ========== -->
    <template v-else-if="empty">
      <div class="empty-state d-flex flex-column v-center h-center py-5">
        <div class="empty-icon mb-2" v-html="emptyIconSvg"></div>
        <p class="empty-text">No ticket data available</p>
        <p class="empty-hint">Create your first ticket to get started</p>
      </div>
    </template>

    <!-- ========== CONTENT ========== -->
    <template v-else>
      <!-- 1. KPI Overview Cards -->
      <TicketOverviewCards
        :data="ticketData.kpiData.value"
        :sparklines="ticketData.sparklines.value"
        :loading="false"
      />

      <!-- 2. Main Trend Chart -->
      <TicketTrendChart
        :open-data="ticketData.trendData.value.open"
        :closed-data="ticketData.trendData.value.closed"
        :loading="false"
      />

      <!-- 3-8: Two-column grid for middle sections -->
      <div class="middle-grid">
        <!-- 3. Department Chart -->
        <DepartmentChart :departments="ticketData.departments.value" :loading="false" />

        <!-- 4. Status Donut Chart -->
        <TicketStatusChart :segments="ticketData.statusDistribution.value" :loading="false" />

        <!-- 5. SLA Health -->
        <SlaHealth :metrics="ticketData.slaMetrics.value" :loading="false" />

        <!-- 6. Average Time Cards -->
        <AverageTimeCards :metrics="ticketData.averageTimes.value" :loading="false" />

        <!-- 7. Priority Chart -->
        <PriorityChart :data="ticketData.priorityData.value" :loading="false" />

        <!-- 10. Workload Gauge -->
        <WorkloadGauge :data="ticketData.workload.value" :loading="false" />
      </div>

      <!-- 9. Top Performing Department -->
      <TopDepartmentCard :dept="ticketData.topDepartment.value" :loading="false" />

      <!-- 8. Recent Tickets -->
      <RecentTicketList :tickets="ticketData.recentTickets.value" :loading="false" />

      <!-- 12. Quick Actions -->
      <TicketQuickActions
        @view-all="$emit('view-all')"
        @create="$emit('create')"
        @assign="$emit('assign')"
        @export="$emit('export')"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTicketData } from './tickets/composables/useTicketData.js'
import TicketOverviewCards from './tickets/TicketOverviewCards.vue'
import TicketTrendChart from './tickets/TicketTrendChart.vue'
import DepartmentChart from './tickets/DepartmentChart.vue'
import TicketStatusChart from './tickets/TicketStatusChart.vue'
import SlaHealth from './tickets/SlaHealth.vue'
import AverageTimeCards from './tickets/AverageTimeCards.vue'
import PriorityChart from './tickets/PriorityChart.vue'
import RecentTicketList from './tickets/RecentTicketList.vue'
import TopDepartmentCard from './tickets/TopDepartmentCard.vue'
import WorkloadGauge from './tickets/WorkloadGauge.vue'
import TicketQuickActions from './tickets/TicketQuickActions.vue'

defineOptions({
  name: 'tickets-widget',
})

const emit = defineEmits(['view-all', 'create', 'assign', 'export'])

// ── Data ──
const ticketData = useTicketData()
const loading = computed(() => ticketData.loading.value)
const error = computed(() => ticketData.error.value)
const empty = computed(() => {
  if (loading.value || error.value) return false
  const dist = ticketData.statusDistribution.value
  return !dist || dist.length === 0 || dist.every((s) => s.value === 0)
})

// ── Actions ──
function handleRefresh() {
  ticketData.refresh()
}

// ── Icons ──
const ticketIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'

const errorIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'

const emptyIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
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
  font-size: 0.6875rem !important;
  text-transform: none !important;

  &:hover {
    color: var(--db-text-primary, rgba(255, 255, 255, 0.92)) !important;
  }
}

// ── Middle grid: 2 columns on wider viewports ──
.middle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}

// ── States ──
.loading-state,
.error-state,
.empty-state {
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

  .empty-hint {
    font-size: 0.6875rem;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.3));
    margin-top: 4px;
  }
}
</style>
