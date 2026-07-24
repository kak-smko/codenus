<template>
  <div class="priority-section">
    <div class="section-header d-flex v-center h-space-between mb-2">
      <span class="section-label">Ticket Priority</span>
      <span class="section-total">{{ total }} tickets</span>
    </div>

    <div v-if="loading" class="priority-skeleton">
      <div v-for="n in 4" :key="n" class="mb-2">
        <r-skeleton loading height="10px" width="70px" type="line" class="mb-1"></r-skeleton>
        <r-skeleton loading height="6px" type="line" class="w-100"></r-skeleton>
      </div>
    </div>

    <div v-else class="priority-bars">
      <div v-for="(p, key) in items" :key="key" class="priority-row mb-1">
        <div class="priority-header d-flex v-center h-space-between mb-1">
          <div class="d-flex v-center">
            <span class="priority-dot" :style="{ background: p.color }"></span>
            <span class="priority-name">{{ p.label }}</span>
          </div>
          <span class="priority-count">{{ p.count }}</span>
        </div>
        <div class="priority-stack">
          <div class="priority-bar-track">
            <div class="priority-bar-fill" :style="{ width: p.percent + '%', background: p.color }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'priority-chart' })

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const items = computed(() => {
  const labels = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }
  const order = ['critical', 'high', 'medium', 'low']
  const total = Object.values(props.data).reduce((s, v) => s + (v.count || 0), 0) || 1
  return order.map(key => ({
    key,
    label: labels[key] || key,
    count: props.data[key]?.count || 0,
    percent: Math.round(((props.data[key]?.count || 0) / total) * 100),
    color: props.data[key]?.color || '#6c63ff',
  }))
})

const total = computed(() => Object.values(props.data).reduce((s, v) => s + (v.count || 0), 0))
</script>

<style scoped lang="scss">
.priority-section {
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

.section-total {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
}

.priority-row {
  // each row
}

.priority-header {
  margin-bottom: 1px;
}

.priority-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 6px;
}

.priority-name {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  text-transform: capitalize;
}

.priority-count {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
}

.priority-bar-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 2px;
  overflow: hidden;
}

.priority-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
