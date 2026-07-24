<template>
  <div class="recent-section">
    <div class="section-header d-flex v-center h-space-between mb-2">
      <span class="section-label">Recent Tickets</span>
    </div>

    <div v-if="loading" class="recent-skeleton">
      <div v-for="n in 5" :key="n" class="d-flex v-center mb-2">
        <r-skeleton loading width="60px" height="10px" type="line" class="me-2 flex-shrink-0"></r-skeleton>
        <r-skeleton loading height="10px" type="line" class="flex-grow-1"></r-skeleton>
      </div>
    </div>

    <div v-else-if="!tickets || tickets.length === 0" class="recent-empty d-flex v-center h-center py-2">
      <span class="empty-text">No recent tickets</span>
    </div>

    <div v-else class="recent-list">
      <div v-for="(t, i) in tickets" :key="i" class="recent-row d-flex v-center" role="button" tabindex="0" @keydown.enter="">
        <span class="recent-id">{{ t.id }}</span>
        <span class="recent-title" :title="t.title">{{ t.title }}</span>
        <span class="recent-dept">{{ t.department }}</span>
        <span class="recent-badge priority-badge" :class="'pri--' + t.priority">{{ t.priority }}</span>
        <span class="recent-badge status-badge" :class="'stat--' + statusClass(t.status)">{{ t.status }}</span>
        <span class="recent-time">{{ t.time }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'recent-ticket-list' })

defineProps({
  tickets: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

function statusClass(status) {
  const map = { 'in-progress': 'in_progress', 'waiting-customer': 'waiting' }
  return map[status] || status
}
</script>

<style scoped lang="scss">
.recent-section {
  margin-bottom: 16px;
}

.section-header { margin-bottom: 8px; }

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.recent-list {
  display: flex;
  flex-direction: column;
}

.recent-row {
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.15s ease;
  cursor: pointer;
  outline: none;

  & + & {
    border-top: 1px solid rgba(255, 255, 255, 0.03);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--db-accent, #6c63ff);
  }
}

.recent-id {
  font-size: 0.5625rem;
  font-weight: 700;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.35));
  min-width: 58px;
  flex-shrink: 0;
  font-family: monospace;
}

.recent-title {
  flex: 1;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.recent-dept {
  font-size: 0.5625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  flex-shrink: 0;
  min-width: 48px;
  text-align: right;
  display: none;

  @media (min-width: 600px) {
    display: inline;
  }
}

.recent-badge {
  font-size: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 5px;
  border-radius: 4px;
  flex-shrink: 0;
  white-space: nowrap;
}

.priority-badge {
  &.pri--critical { background: rgba(248, 113, 113, 0.15); color: #f87171; }
  &.pri--high     { background: rgba(251, 191, 36, 0.15); color: #fb923c; }
  &.pri--medium   { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
  &.pri--low      { background: rgba(52, 211, 153, 0.15); color: #34d399; }
}

.status-badge {
  &.stat--open        { background: rgba(248, 113, 113, 0.15); color: #f87171; }
  &.stat--in_progress { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
  &.stat--pending     { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
  &.stat--waiting     { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
  &.stat--resolved    { background: rgba(52, 211, 153, 0.15); color: #34d399; }
  &.stat--closed      { background: rgba(108, 99, 255, 0.15); color: #6c63ff; }
}

.recent-time {
  font-size: 0.5625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.3));
  flex-shrink: 0;
  min-width: 52px;
  text-align: right;
}

.recent-empty .empty-text {
  font-size: 0.75rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
}
</style>
