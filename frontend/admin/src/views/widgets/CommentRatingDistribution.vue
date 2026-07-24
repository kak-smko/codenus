<template>
  <div class="dist-card glass-panel-inner">
    <div class="section-label mb-2">Rating Distribution</div>

    <div class="dist-rows">
      <div v-for="(item, i) in distribution" :key="i" class="dist-row d-flex v-center">
        <div class="dist-stars d-flex v-center">
          <svg
            v-for="s in 5"
            :key="s"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            class="dist-star"
            :class="{ filled: s <= 6 - item.stars }"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              :fill="s <= 6 - item.stars ? '#fbbf24' : 'none'"
              :stroke="s <= 6 - item.stars ? '#fbbf24' : 'rgba(255,255,255,0.12)'"
              stroke-width="1"
            />
          </svg>
        </div>

        <div class="dist-bar-track">
          <div
            class="dist-bar-fill"
            :style="{ width: item.percentage + '%' }"
          ></div>
        </div>

        <span class="dist-percent">{{ item.percentage }}%</span>
        <span class="dist-count">{{ formatNumber(item.count) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'comment-rating-distribution' })

const props = defineProps({
  distribution: {
    type: Array,
    default: () => [],
  },
})

function formatNumber(val) {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (val >= 1_000) return (val / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return val.toLocaleString()
}
</script>

<style scoped lang="scss">
.dist-card {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--db-card-border, rgba(255,255,255,0.05));
  height: 100%;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--db-text-secondary, rgba(255,255,255,0.65));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.dist-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dist-row {
  gap: 10px;
}

.dist-stars {
  gap: 2px;
  min-width: 70px;
  flex-shrink: 0;
}

.dist-star {
  display: block;
  transition: transform 0.2s ease;
  &:hover { transform: scale(1.2); }
}

.dist-bar-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.dist-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.dist-percent {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255,255,255,0.92));
  min-width: 36px;
  text-align: right;
}

.dist-count {
  font-size: 0.6875rem;
  color: var(--db-text-muted, rgba(255,255,255,0.4));
  min-width: 40px;
  text-align: right;
}
</style>
