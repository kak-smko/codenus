import { ref, computed } from 'vue'

/**
 * Composable for managing ticket dashboard data, states, and actions.
 */
export function useTicketData() {
  const loading = ref(false)
  const error = ref(null)

  const kpiData = ref([
    { label: 'Open Tickets', value: 342, trend: 8.2, iconType: 'open', color: 'warning' },
    { label: 'Closed Today', value: 47, trend: 12.5, iconType: 'closed', color: 'success' },
    { label: 'New Today', value: 28, trend: -3.1, iconType: 'new', color: 'info' },
    { label: 'SLA Rate', value: '98.3%', trend: 1.2, iconType: 'sla', color: 'one' },
  ])

  const sparklines = {
    open: [312, 328, 315, 340, 335, 342, 338, 345, 342],
    closed: [35, 38, 42, 40, 45, 43, 47, 46, 47],
    new: [22, 25, 20, 28, 26, 30, 24, 27, 28],
    sla: [96.2, 96.8, 97.1, 97.5, 97.8, 98.0, 98.1, 98.3, 98.3],
  }

  const trendData = ref({
    open: [
      320, 335, 310, 340, 355, 348, 360, 345, 370, 380, 365, 390, 375, 385, 400, 392, 410, 395, 380,
      360, 345, 355, 340, 350, 338, 348, 342, 335, 345, 342,
    ],
    closed: [
      28, 32, 35, 30, 38, 36, 40, 38, 42, 45, 42, 48, 44, 46, 50, 47, 52, 49, 45, 42, 43, 46, 44,
      47, 43, 45, 47, 44, 46, 47,
    ],
  })

  const departments = ref([
    { name: 'Support', count: 128, percent: 37, color: '#6c63ff' },
    { name: 'Technical', count: 84, percent: 25, color: '#60a5fa' },
    { name: 'Sales', count: 61, percent: 18, color: '#34d399' },
    { name: 'Finance', count: 43, percent: 13, color: '#fbbf24' },
    { name: 'HR', count: 26, percent: 7, color: '#f87171' },
  ])

  const statusDistribution = ref([
    { label: 'Open', value: 98, color: '#f87171' },
    { label: 'In Progress', value: 76, color: '#60a5fa' },
    { label: 'Waiting Customer', value: 54, color: '#fbbf24' },
    { label: 'Resolved', value: 89, color: '#34d399' },
    { label: 'Closed', value: 105, color: '#6c63ff' },
  ])

  const slaMetrics = ref([
    { label: 'First Response Rate', value: 94, trend: 2.3, color: '#34d399' },
    { label: 'Resolution Rate', value: 87, trend: -1.5, color: '#60a5fa' },
    { label: 'SLA Compliance', value: 98, trend: 0.8, color: '#6c63ff' },
  ])

  const averageTimes = ref([
    { label: 'First Response', value: '2.4m', trend: -12, color: '#34d399', iconType: 'clock' },
    { label: 'Resolution', value: '4.7h', trend: -8, color: '#60a5fa', iconType: 'check' },
    { label: 'Customer Reply', value: '1.2h', trend: 5, color: '#fbbf24', iconType: 'message' },
    { label: 'Ticket Lifetime', value: '6.3h', trend: -10, color: '#6c63ff', iconType: 'calendar' },
  ])

  const priorityData = ref({
    critical: { count: 18, color: '#f87171' },
    high: { count: 52, color: '#fb923c' },
    medium: { count: 98, color: '#60a5fa' },
    low: { count: 34, color: '#34d399' },
  })

  const recentTickets = ref([
    {
      id: '#TKT-3421',
      title: 'Login authentication failure after security update',
      department: 'Support',
      priority: 'critical',
      status: 'open',
      time: '2 min ago',
    },
    {
      id: '#TKT-3420',
      title: 'Unable to upload large profile pictures',
      department: 'Technical',
      priority: 'high',
      status: 'in-progress',
      time: '15 min ago',
    },
    {
      id: '#TKT-3419',
      title: 'Invoice INV-2024-0891 payment query',
      department: 'Finance',
      priority: 'high',
      status: 'open',
      time: '1 hour ago',
    },
    {
      id: '#TKT-3418',
      title: 'Feature request: Dark mode toggle for dashboard',
      department: 'Sales',
      priority: 'low',
      status: 'pending',
      time: '3 hours ago',
    },
    {
      id: '#TKT-3417',
      title: 'Database connection timeout errors on production',
      department: 'Technical',
      priority: 'critical',
      status: 'open',
      time: '5 hours ago',
    },
  ])

  const topDepartment = ref({
    name: 'Technical Support',
    responseRate: 97,
    avgResponseTime: '1.8m',
    ticketsResolved: 284,
    trend: 5.2,
  })

  const workload = ref({
    agentCapacity: 120,
    currentUtilization: 87,
  })

  const heatmapData = ref({
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    hours: ['6a', '9a', '12p', '3p', '6p', '9p'],
    values: [
      [5, 12, 18, 22, 15, 8, 3],
      [8, 20, 28, 25, 18, 10, 4],
      [12, 25, 32, 28, 20, 12, 5],
      [10, 22, 30, 26, 18, 10, 4],
      [7, 18, 24, 20, 14, 8, 3],
      [3, 8, 12, 10, 8, 5, 2],
    ],
  })

  const totalTickets = computed(() => {
    const dist = statusDistribution.value
    return dist.reduce((sum, s) => sum + s.value, 0)
  })

  function refresh() {
    loading.value = true
    error.value = null
    // Simulate API call
    setTimeout(() => {
      loading.value = false
    }, 800)
  }

  return {
    loading,
    error,
    kpiData,
    sparklines,
    trendData,
    departments,
    statusDistribution,
    slaMetrics,
    averageTimes,
    priorityData,
    recentTickets,
    topDepartment,
    workload,
    heatmapData,
    totalTickets,
    refresh,
  }
}
