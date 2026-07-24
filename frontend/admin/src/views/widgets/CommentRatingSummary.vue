<template>
  <div class="rating-summary glass-panel-inner mb-3">
    <div class="rating-summary-content d-flex v-center">
      <!-- Star display -->
      <div class="rating-stars-section d-flex flex-column v-center">
        <div class="stars-row d-flex v-center">
          <svg
            v-for="s in 5"
            :key="s"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            class="star-icon"
            :class="{ filled: s <= Math.round(averageRating), half: s === Math.ceil(averageRating) && !Number.isInteger(averageRating) }"
          >
            <defs>
              <linearGradient :id="'star-grad-' + s">
                <stop offset="0%" stop-color="#fbbf24" />
                <stop offset="100%" stop-color="#f59e0b" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              :fill="s <= Math.round(averageRating) ? 'url(#star-grad-' + s + ')' : 'none'"
              :stroke="s <= Math.round(averageRating) ? '#fbbf24' : 'rgba(255,255,255,0.15)'"
              stroke-width="1.2"
            />
          </svg>
        </div>
        <div class="rating-number d-flex v-center">
          <span class="rating-value">{{ averageRating.toFixed(1) }}</span>
          <span class="rating-separator mx-1">/</span>
          <span class="rating-max">5</span>
        </div>
      </div>

      <!-- Totals -->
      <div class="rating-totals d-flex">
        <div class="total-item">
          <span class="total-value">{{ formatNumber(totalRatings) }}</span>
          <span class="total-label">Total Ratings</span>
        </div>
        <div class="total-divider"></div>
        <div class="total-item">
          <span class="total-value">{{ formatNumber(totalComments) }}</span>
          <span class="total-label">Total Comments</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'comment-rating-summary' })

const props = defineProps({
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalComments: { type: Number, default: 0 },
})

function formatNumber(val) {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (val >= 1_000) return (val / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return val.toLocaleString()
}
</script>

<style scoped lang="scss">
.rating-summary {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--db-card-border, rgba(255,255,255,0.05));
}

.rating-summary-content {
  gap: 24px;

  @media (max-width: 400px) {
    flex-direction: column;
    gap: 16px;
  }
}

.rating-stars-section {
  gap: 6px;
  min-width: 160px;
}

.stars-row {
  gap: 3px;
}

.star-icon {
  transition: transform 0.2s ease;
  &:hover { transform: scale(1.15); }
}

.rating-number {
  gap: 1px;
}

.rating-value {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255,255,255,0.93));
  letter-spacing: -0.02em;
}

.rating-separator {
  color: var(--db-text-muted, rgba(255,255,255,0.32));
  font-size: 0.875rem;
}

.rating-max {
  font-size: 1rem;
  color: var(--db-text-muted, rgba(255,255,255,0.32));
}

.rating-totals {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-left: 20px;
  border-left: 1px solid var(--db-card-border, rgba(255,255,255,0.06));

  @media (max-width: 400px) {
    padding-left: 0;
    border-left: none;
    padding-top: 12px;
    border-top: 1px solid var(--db-card-border, rgba(255,255,255,0.06));
  }
}

.total-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.total-value {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--db-text-primary, rgba(255,255,255,0.93));
  letter-spacing: -0.01em;
}

.total-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--db-text-muted, rgba(255,255,255,0.4));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.total-divider {
  width: 1px;
  height: 40px;
  background: var(--db-card-border, rgba(255,255,255,0.06));
}
</style>
