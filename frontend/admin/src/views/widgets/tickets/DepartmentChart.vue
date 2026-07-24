<template>
  <div class="dept-section">
    <div class="section-header d-flex v-center h-space-between mb-2">
      <span class="section-label">Tickets by Department</span>
      <span class="section-total">{{ total }} total</span>
    </div>

    <div v-if="loading" class="dept-skeleton">
      <div v-for="n in 5" :key="n" class="dept-skel-row d-flex v-center mb-2">
        <r-skeleton loading width="60px" height="10px" type="line" class="me-2"></r-skeleton>
        <r-skeleton loading height="8px" type="line" class="flex-grow-1" style="border-radius:4px"></r-skeleton>
        <r-skeleton loading width="30px" height="10px" type="line" class="ms-2"></r-skeleton>
      </div>
    </div>

    <div v-else-if="!departments || departments.length === 0" class="dept-empty d-flex v-center h-center py-2">
      <span class="empty-text">No department data</span>
    </div>

    <div v-else class="dept-list">
      <div v-for="(dept, i) in departments" :key="i" class="dept-row">
        <div class="dept-info d-flex v-center h-space-between mb-1">
          <span class="dept-name">{{ dept.name }}</span>
          <span class="dept-meta">
            <span class="dept-count">{{ dept.count }}</span>
            <span class="dept-pct">{{ dept.percent }}%</span>
          </span>
        </div>
        <div class="dept-bar-track">
          <div class="dept-bar-fill" :style="{ width: dept.percent + '%', background: dept.color }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'department-chart' })

const props = defineProps({
  departments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const total = props.departments?.reduce((s, d) => s + d.count, 0) || 0
</script>

<style scoped lang="scss">
.dept-section {
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

.dept-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dept-row {
  // each row
}

.dept-info {
  margin-bottom: 2px;
}

.dept-name {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
}

.dept-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dept-count {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
}

.dept-pct {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  min-width: 28px;
  text-align: right;
}

.dept-bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.dept-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

// Skeletons
.dept-skel-row {
  .r-skeleton {
    border-radius: 4px;
  }
}

.dept-empty .empty-text {
  font-size: 0.75rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
}
</style>
