/**
 * Composable for managing comments analytics data, states, and actions.
 * Prepares API integration points — swap mock data with real API calls
 * when the backend endpoints become available.
 */
import { ref, computed } from 'vue'

/* ── API endpoints (configure when backend ready) ──────── */
const API = {
  summary: null, // GET /api/admin/comments/summary
  distribution: null, // GET /api/admin/comments/distribution
  trend: null, // GET /api/admin/comments/trend?range={range}
  stats: null, // GET /api/admin/comments/stats
  recent: null, // GET /api/admin/comments/recent?page={n}&limit={n}
}

/* ── Time range labels & values ────────────────────────── */
export const TIME_RANGES = [
  { value: '1h', label: '1 Hour' },
  { value: '5h', label: '5 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '2d', label: '2 Days' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: 'Week' },
  { value: '30d', label: 'Month' },
  { value: '90d', label: '3 Months' },
  { value: '365d', label: 'Year' },
]

/* ── Mock data ─────────────────────────────────────────── */
function mockSummary() {
  return { averageRating: 4.7, totalRatings: 8254, totalComments: 2431 }
}

function mockDistribution() {
  return [
    { stars: 5, percentage: 48, count: 3962 },
    { stars: 4, percentage: 28, count: 2311 },
    { stars: 3, percentage: 14, count: 1156 },
    { stars: 2, percentage: 7, count: 578 },
    { stars: 1, percentage: 3, count: 247 },
  ]
}

function mockTrend(range) {
  const pointsByRange = {
    '1h': Array.from({ length: 12 }, (_, i) => ({ label: `${(i + 1) * 5}m`, value: 0 })),
    '5h': Array.from({ length: 10 }, (_, i) => ({ label: `${i * 30}m`, value: 0 })),
    '24h': Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, value: 0 })),
    '2d': Array.from({ length: 16 }, (_, i) => ({
      label: i < 8 ? `Day 1 ${i + 6}:00` : `Day 2 ${i - 2}:00`,
      value: 0,
    })),
    '3d': Array.from({ length: 18 }, (_, i) => ({
      label: `Day ${Math.floor(i / 6) + 1}`,
      value: 0,
    })),
    '7d': Array.from({ length: 7 }, (_, i) => ({
      label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      value: 0,
    })),
    '30d': Array.from({ length: 30 }, (_, i) => ({ label: `D${i + 1}`, value: 0 })),
    '90d': Array.from({ length: 12 }, (_, i) => ({ label: `W${i + 1}`, value: 0 })),
    '365d': Array.from({ length: 12 }, (_, i) => ({
      label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
        i
      ],
      value: 0,
    })),
  }
  const base = pointsByRange[range] || pointsByRange['30d']
  return base.map((p, i) => ({
    ...p,
    value: Math.round(40 + Math.sin(i * 0.6) * 25 + Math.cos(i * 0.3) * 10 + Math.random() * 10),
  }))
}

function mockStats() {
  return [
    { label: 'New Comments', value: 128, trend: 12.3, iconType: 'new', color: 'info' },
    { label: 'Approved', value: 1458, trend: 8.7, iconType: 'approved', color: 'success' },
    { label: 'Pending', value: 608, trend: -3.1, iconType: 'pending', color: 'warning' },
    { label: 'Rejected', value: 365, trend: 5.8, iconType: 'rejected', color: 'error' },
  ]
}

function mockRecent() {
  return [
    {
      id: 'c-001',
      author: 'Sarah Johnson',
      avatarBg: 'linear-gradient(135deg, #6c63ff, #4834d4)',
      rating: 5,
      text: 'Great article! This really helped me understand the new authentication flow.',
      article: 'Introduction to OAuth 2.0',
      status: 'approved',
      relativeTime: '12 min ago',
    },
    {
      id: 'c-002',
      author: 'Marcus Chen',
      avatarBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
      rating: 4,
      text: 'Could you please clarify the deployment steps for the staging environment?',
      article: 'DevOps Best Practices 2024',
      status: 'pending',
      relativeTime: '45 min ago',
    },
    {
      id: 'c-003',
      author: 'Emily Rodriguez',
      avatarBg: 'linear-gradient(135deg, #10b981, #059669)',
      rating: 3,
      text: 'We found a minor bug in the pagination logic. The page count resets unexpectedly.',
      article: 'Building Scalable APIs',
      status: 'approved',
      relativeTime: '2 hours ago',
    },
    {
      id: 'c-004',
      author: 'Alex Kim',
      avatarBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      rating: 5,
      text: 'The new design system looks fantastic. Can we get access to the Figma file?',
      article: 'Design System v2 Release',
      status: 'approved',
      relativeTime: '4 hours ago',
    },
    {
      id: 'c-005',
      author: 'Lisa Wang',
      avatarBg: 'linear-gradient(135deg, #f87171, #dc2626)',
      rating: 2,
      text: 'The article was too technical and lacked practical examples for beginners.',
      article: 'Advanced Component Patterns in Vue 3',
      status: 'rejected',
      relativeTime: '6 hours ago',
    },
    {
      id: 'c-006',
      author: 'Tom Baker',
      avatarBg: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
      rating: 4,
      text: 'Excellent write-up! I shared this with my team and everyone found it useful.',
      article: 'API Authentication Best Practices',
      status: 'approved',
      relativeTime: '8 hours ago',
    },
  ]
}

/* ── Composable ────────────────────────────────────────── */
export function useCommentData() {
  const loading = ref(false)
  const error = ref(null)
  const summary = ref(mockSummary())
  const distribution = ref(mockDistribution())
  const trendData = ref(mockTrend('30d'))
  const stats = ref(mockStats())
  const recentComments = ref(mockRecent())

  // Current time range for trend chart
  const selectedRange = ref('30d')

  const hasData = computed(() => summary.value.totalComments > 0)

  /**
   * Fetch summary from API or fall back to mock.
   */
  async function fetchSummary() {
    if (!API.summary) return
    try {
      const { data } = await (window.app?.$axios || window.axios).get(API.summary)
      summary.value = data
    } catch {
      summary.value = mockSummary()
    }
  }

  /**
   * Fetch distribution from API or fall back to mock.
   */
  async function fetchDistribution() {
    if (!API.distribution) return
    try {
      const { data } = await (window.app?.$axios || window.axios).get(API.distribution)
      distribution.value = data
    } catch {
      distribution.value = mockDistribution()
    }
  }

  /**
   * Fetch trend data for a given time range.
   */
  async function fetchTrend(range) {
    if (API.trend) {
      try {
        const { data } = await (window.app?.$axios || window.axios).get(API.trend, {
          params: { range },
        })
        trendData.value = data
        return
      } catch {
        /* fall through to mock */
      }
    }
    trendData.value = mockTrend(range)
  }

  /**
   * Fetch stats from API or fall back to mock.
   */
  async function fetchStats() {
    if (!API.stats) return
    try {
      const { data } = await (window.app?.$axios || window.axios).get(API.stats)
      stats.value = data
    } catch {
      stats.value = mockStats()
    }
  }

  /**
   * Fetch recent comments from API or fall back to mock.
   */
  async function fetchRecent() {
    if (!API.recent) return
    try {
      const { data } = await (window.app?.$axios || window.axios).get(API.recent)
      recentComments.value = data
    } catch {
      recentComments.value = mockRecent()
    }
  }

  /**
   * Refresh all data (simulate API loading).
   */
  function refresh() {
    loading.value = true
    error.value = null
    // Simulate network delay; replace with Promise.all(API calls) when endpoints exist
    setTimeout(() => {
      loading.value = false
      summary.value = mockSummary()
      distribution.value = mockDistribution()
      trendData.value = mockTrend(selectedRange.value)
      stats.value = mockStats()
      recentComments.value = mockRecent()
    }, 600)
  }

  /**
   * Change the active trend time range and re-fetch.
   */
  function setTimeRange(range) {
    selectedRange.value = range
    fetchTrend(range)
  }

  return {
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
    fetchSummary,
    fetchDistribution,
    fetchTrend,
    fetchStats,
    fetchRecent,
  }
}
