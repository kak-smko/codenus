<template>
  <div class="actions-section">
    <div class="actions-grid">
      <r-btn text size="sm" class="action-btn" @click.prevent="$emit('view-all')">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <span>View All</span>
      </r-btn>
      <r-btn text size="sm" class="action-btn" @click.prevent="$emit('create')">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>Create</span>
      </r-btn>
      <r-btn text size="sm" class="action-btn" @click.prevent="$emit('assign')">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        <span>Assign</span>
      </r-btn>
      <r-btn text size="sm" class="action-btn" @click.prevent="$emit('export')">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Export</span>
      </r-btn>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'ticket-quick-actions' })

defineEmits(['view-all', 'create', 'assign', 'export'])
</script>

<style scoped lang="scss">
.actions-section {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 12px;
  margin-top: 4px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.action-btn {
  color: var(--db-text-muted, rgba(255, 255, 255, 0.45)) !important;
  border: 1px solid rgba(255, 255, 255, 0.04) !important;
  border-radius: 8px !important;
  padding: 6px 4px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease !important;
  font-size: 0.625rem !important;
  font-weight: 500 !important;
  text-transform: none !important;

  &:hover {
    background: rgba(255, 255, 255, 0.04) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: var(--db-text-primary, rgba(255, 255, 255, 0.92)) !important;
  }
}
</style>
