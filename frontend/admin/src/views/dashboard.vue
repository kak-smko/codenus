<template>
  <div class="dark-dashboard ps-md-3 ps-2 mb-10">
    <r-container full-width class="dashboard-container px-4 py-4">
      <!-- Page Header -->
      <div class="d-flex v-center h-space-between mb-4 pt-2">
        <div>
          <h1 class="page-title headline-1 font-weight-bold">Dashboard</h1>
          <p class="page-subtitle body-2 font-weight-regular">
            Overview of your platform performance and activity
          </p>
        </div>
      </div>

      <!-- Global Filters -->
      <div class="mb-4">
        <DashboardFilters
          :enabled-widgets="enabledWidgets"
          :widget-labels="widgetLabels"
          @update:filters="onFiltersUpdate"
          @toggle:widget="onToggleWidget"
        />
      </div>

      <!-- Dashboard Grid Layout -->
      <div class="dashboard-grid d-flex">
        <!-- Main Content Area -->
        <div class="main-area flex-grow-1" style="min-width: 0">
          <!-- KPI Summary Cards -->
          <transition name="widget-fade">
            <div v-if="enabledWidgets.kpi" class="mb-4">
              <KpiSummaryCards />
            </div>
          </transition>

          <!-- Second Row: Tickets + Traffic/Users + Files/Storage -->
          <r-row class="mb-4" dense>
            <r-col class="col-12 mb-3 mb-lg-0">
              <transition name="widget-fade">
                <TicketsWidget v-if="enabledWidgets.tickets" />
              </transition>
            </r-col>
            <r-col class="col-12 mb-3 mb-lg-0">
              <transition name="widget-fade">
                <TrafficUsersWidget v-if="enabledWidgets.traffic" />
              </transition>
            </r-col>
            <r-col class="col-12">
              <transition name="widget-fade">
                <FilesStorageWidget v-if="enabledWidgets.files" />
              </transition>
            </r-col>
          </r-row>

          <!-- Lower Section: Comments + Articles -->
          <r-row dense>
            <r-col class="col-12 mb-3 mb-lg-0">
              <transition name="widget-fade">
                <CommentsWidget v-if="enabledWidgets.comments" />
              </transition>
            </r-col>
            <r-col class="col-12 mb-3 mb-lg-0">
              <transition name="widget-fade">
                <ArticlesWidget v-if="enabledWidgets.articles" />
              </transition>
            </r-col>
          </r-row>
        </div>

        <!-- Right Sidebar: Quick Actions + Recent Activity -->
        <aside class="sidebar-area d-flex flex-column">
          <QuickActionsAlerts />
          <transition name="widget-fade">
            <RecentActivityWidget v-if="enabledWidgets.activity" />
          </transition>
        </aside>
      </div>
    </r-container>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

defineOptions({
  name: 'admin-dashboard',
})

// ── Widget Components ────────────────────────────────────
import KpiSummaryCards from './widgets/KpiSummaryCards.vue'
import TicketsWidget from './widgets/TicketsWidget.vue'
import CommentsWidget from './widgets/CommentsWidget.vue'
import ArticlesWidget from './widgets/ArticlesWidget.vue'
import FilesStorageWidget from './widgets/FilesStorageWidget.vue'
import TrafficUsersWidget from './widgets/TrafficUsersWidget.vue'
import RecentActivityWidget from './widgets/RecentActivityWidget.vue'
import DashboardFilters from './widgets/DashboardFilters.vue'
import QuickActionsAlerts from './widgets/QuickActionsAlerts.vue'

// ── Widget Configuration ─────────────────────────────────
const enabledWidgets = reactive({
  kpi: true,
  tickets: true,
  comments: true,
  articles: true,
  files: true,
  traffic: true,
  activity: true,
})

const widgetLabels = {
  kpi: 'KPI Cards',
  tickets: 'Tickets',
  comments: 'Comments',
  articles: 'Articles',
  files: 'Files & Storage',
  traffic: 'Traffic & Users',
  activity: 'Admin Activity',
}

// ── Global Filters ───────────────────────────────────────
const activeFilters = reactive({
  dateRange: null,
  department: null,
  status: null,
})

function onFiltersUpdate(filters) {
  Object.assign(activeFilters, filters)
}

function onToggleWidget(key, value) {
  enabledWidgets[key] = value
}
</script>

<style scoped lang="scss">
/* ============================================================
   DARK DASHBOARD — Premium Glassmorphism Theme
   Inspired by Apple VisionOS, Linear, Stripe Dashboard
   ============================================================ */

.dark-dashboard {
  --db-bg: #0a0a10;
  --db-card-bg: rgba(20, 20, 20, 0.45);
  --db-card-bg-light: rgba(255, 255, 255, 0.06);
  --db-card-border: rgba(255, 255, 255, 0.1);
  --db-card-border-hover: rgba(255, 255, 255, 0.16);
  --db-text-primary: rgba(255, 255, 255, 0.92);
  --db-text-secondary: rgba(255, 255, 255, 0.62);
  --db-text-muted: rgba(255, 255, 255, 0.38);
  --db-accent: #6c63ff;
  --db-accent-glow: rgba(108, 99, 255, 0.15);
  --db-success: #34d399;
  --db-warning: #fbbf24;
  --db-error: #f87171;
  --db-info: #60a5fa;

  min-height: 100%;
  position: relative;
  background: var(--db-bg);
  color: var(--db-text-primary);

  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}


/* ============================================================
   DASHBOARD CONTAINER
   ============================================================ */

.dashboard-container {
  position: relative;
  z-index: 1;
}

/* ============================================================
   PAGE HEADER
   ============================================================ */

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--db-text-primary);
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 0.8125rem;
  color: var(--db-text-secondary);
  margin: 6px 0 0 0;
  font-weight: 400;
}

/* ============================================================
   DASHBOARD GRID LAYOUT
   ============================================================ */

.dashboard-grid {
  gap: 24px;
}

.main-area {
  flex: 1;
  min-width: 0;
}

.sidebar-area {
  width: 320px;
  flex-shrink: 0;
  gap: 16px;

  @media (max-width: 1200px) {
    width: 280px;
  }

  @media (max-width: 992px) {
    width: 100%;
  }
}

/* ============================================================
   GLASSMORPHISM — Global panel styles
   Applied to all widget containers via the glass-panel class
   ============================================================ */

:global(.glass-panel) {
  background: var(--db-card-bg, rgba(20, 20, 20, 0.45));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--db-card-border, rgba(255, 255, 255, 0.1));
  border-radius: 18px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

:global(.glass-panel:hover) {
  transform: translateY(-3px);
  border-color: var(--db-card-border-hover, rgba(255, 255, 255, 0.16));
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

:global(.glass-light) {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}

/* ============================================================
   WIDGET FADE TRANSITION
   ============================================================ */

.widget-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.widget-fade-leave-active {
  transition: all 0.25s ease;
}

.widget-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.widget-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

/* ============================================================
   RESPONSIVE ADJUSTMENTS
   ============================================================ */

@media (max-width: 1200px) {
  .page-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 992px) {
  .dashboard-grid {
    flex-direction: column;
  }

  .page-title {
    font-size: 1.35rem;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.75rem;
  }

}
</style>
