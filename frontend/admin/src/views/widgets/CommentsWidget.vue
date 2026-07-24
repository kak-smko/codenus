<template>
  <div class="widget glass-panel">
    <!-- ═══ HEADER ═══ -->
    <div class="widget-header d-flex v-center h-space-between mb-3">
      <div class="d-flex v-center">
        <div class="widget-title-icon color-info-text" v-html="iconSvg"></div>
        <h3 class="widget-title ms-2">Comments Analytics</h3>
      </div>
      <div class="d-flex v-center gap-1">
        <r-btn
          text
          size="sm"
          class="widget-action-btn me-1"
          @click="handleRefresh"
          :disabled="loading"
        >
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
        <r-btn text size="sm" class="widget-action-btn" @click.prevent="$emit('view-all')">
          <span class="action-text">View All</span>
          <r-icon v-html="$r.icons.chevron_right" width="16" height="16"></r-icon>
        </r-btn>
      </div>
    </div>

    <!-- ═══ LOADING STATE ═══ -->
    <template v-if="loading">
      <!-- Skeleton: filters -->
      <div class="d-flex gap-2 mb-3">
        <r-skeleton
          v-for="n in 3"
          :key="'fl-' + n"
          loading
          height="32px"
          width="140px"
          type="line"
        ></r-skeleton>
        <r-skeleton loading height="32px" width="200px" type="line"></r-skeleton>
      </div>
      <!-- Skeleton: rating summary -->
      <div
        class="glass-panel-inner mb-3"
        style="padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05)"
      >
        <div class="d-flex v-center">
          <div class="d-flex flex-column v-center me-4">
            <r-skeleton loading height="22px" width="120px" type="line" class="mb-2"></r-skeleton>
            <r-skeleton loading height="32px" width="80px" type="line"></r-skeleton>
          </div>
          <div class="d-flex gap-3">
            <r-skeleton
              v-for="n in 2"
              :key="'rs-' + n"
              loading
              height="16px"
              width="120px"
              type="line"
            ></r-skeleton>
          </div>
        </div>
      </div>
      <!-- Skeleton: chart -->
      <r-skeleton loading height="160px" type="line" class="w-100 mb-3"></r-skeleton>
      <!-- Skeleton: comments list -->
      <div v-for="n in 4" :key="'cl-' + n" class="d-flex v-center mb-2">
        <r-skeleton loading type="avatar" width="32px" height="32px" class="me-2"></r-skeleton>
        <div class="flex-grow-1">
          <r-skeleton loading height="10px" width="60%" type="line" class="mb-1"></r-skeleton>
          <r-skeleton loading height="8px" width="80%" type="line"></r-skeleton>
        </div>
      </div>
    </template>

    <!-- ═══ ERROR STATE ═══ -->
    <template v-else-if="error">
      <div class="error-state d-flex flex-column v-center h-center py-5">
        <div class="error-icon mb-2" v-html="errorSvg"></div>
        <p class="error-title">Failed to load comments data</p>
        <p class="error-desc mb-3">{{ error }}</p>
        <r-btn size="sm" class="retry-btn" @click="handleRefresh">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="me-1"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Retry
        </r-btn>
      </div>
    </template>

    <!-- ═══ EMPTY STATE ═══ -->
    <template v-else-if="!hasData">
      <div class="empty-state d-flex flex-column v-center h-center py-5">
        <div class="empty-icon mb-2" v-html="emptySvg"></div>
        <p class="empty-title">No comments data yet</p>
        <p class="empty-desc">
          Comments and ratings will appear here once users start engaging with your content.
        </p>
      </div>
    </template>

    <!-- ═══ CONTENT ═══ -->
    <template v-else>
      <!-- Rating Summary -->
      <CommentRatingSummary
        :average-rating="summary.averageRating"
        :total-ratings="summary.totalRatings"
        :total-comments="summary.totalComments"
      />

      <!-- Two-column: Distribution + Stats -->
      <div class="two-col mb-3">
        <div class="two-col-left">
          <CommentRatingDistribution :distribution="distribution" />
        </div>
        <div class="two-col-right">
          <CommentStatCards :stats="stats" />
        </div>
      </div>

      <!-- Trend Chart -->
      <CommentTrendChart
        :trend-data="trendData"
        :model-value="selectedTimeRange"
        :loading="trendLoading"
        @update:model-value="onTimeRangeChange"
      />

      <!-- Recent Comments -->
      <CommentRecentList :comments="filteredComments" :loading="recentLoading" />
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { useCommentData, TIME_RANGES } from './comments/composables/useCommentData.js'
import CommentRatingSummary from './CommentRatingSummary.vue'
import CommentRatingDistribution from './CommentRatingDistribution.vue'
import CommentTrendChart from './CommentTrendChart.vue'
import CommentStatCards from './CommentStatCards.vue'
import CommentRecentList from './CommentRecentList.vue'

const $r = inject('renusify').$r

defineOptions({ name: 'comments-analytics-widget' })

defineEmits(['view-all'])

/* ── Data ─────────────────────────────────────────────── */
const {
  loading,
  error,
  hasData,
  summary,
  distribution,
  trendData,
  stats,
  recentComments,
  selectedRange,
  refresh,
  setTimeRange,
} = useCommentData()

/* ── Local state ──────────────────────────────────────── */
const filters = reactive({
  rating: null,
  status: null,
  dateRange: null,
  search: '',
})

const trendLoading = ref(false)
const recentLoading = ref(false)

/* ── Computed: filtered comments ──────────────────────── */
const filteredComments = computed(() => {
  let list = [...recentComments.value]

  if (filters.rating != null) {
    list = list.filter((c) => c.rating === filters.rating)
  }
  if (filters.status) {
    list = list.filter((c) => c.status === filters.status)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(
      (c) =>
        c.author.toLowerCase().includes(q) ||
        c.text.toLowerCase().includes(q) ||
        (c.article && c.article.toLowerCase().includes(q)),
    )
  }
  return list
})

/* ── Handlers ─────────────────────────────────────────── */
function onFiltersUpdate(newFilters) {
  Object.assign(filters, newFilters)
}

function onTimeRangeChange(range) {
  trendLoading.value = true
  setTimeRange(range)
  setTimeout(() => {
    trendLoading.value = false
  }, 400)
}

function handleRefresh() {
  refresh()
  trendLoading.value = true
  recentLoading.value = true
  setTimeout(() => {
    trendLoading.value = false
    recentLoading.value = false
  }, 600)
}

/* ── Derived ──────────────────────────────────────────── */
const selectedTimeRange = computed(() => selectedRange.value)

/* ── Icons ────────────────────────────────────────────── */
const iconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'

const emptySvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/></svg>'

const errorSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
</script>

<style scoped lang="scss">
/* ── Widget container ──────────────── */
.widget {
  padding: 20px;
  border-radius: 14px;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    transform: translateY(-2px);
  }
}

/* ── Header ────────────────────────── */
.widget-header {
  .widget-title-icon {
    display: inline-flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(96, 165, 250, 0.12);
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

/* ── Two-column layout ──────────────── */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.two-col-left,
.two-col-right {
  min-width: 0;
}

/* ── Error state ──────────────────── */
.error-state {
  .error-icon {
    width: 48px;
    height: 48px;
    color: #f87171;
    opacity: 0.6;
  }

  .error-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
    margin: 0 0 4px 0;
  }

  .error-desc {
    font-size: 0.75rem;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
    margin: 0;
    text-align: center;
  }
}

.retry-btn {
  color: var(--db-text-muted, rgba(255, 255, 255, 0.5)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  &:hover {
    color: var(--db-text-primary, rgba(255, 255, 255, 0.92)) !important;
    border-color: rgba(255, 255, 255, 0.15) !important;
  }
}

/* ── Empty state ───────────────────── */
.empty-state {
  .empty-icon {
    width: 56px;
    height: 56px;
    opacity: 0.15;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  }

  .empty-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
    margin: 0 0 4px 0;
  }

  .empty-desc {
    font-size: 0.75rem;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
    margin: 0;
    text-align: center;
    max-width: 280px;
  }
}

/* ── Utility overrides ─────────────── */
:deep(.glass-panel-inner) {
  background: var(--db-card-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
</style>
