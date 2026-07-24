<template>
  <div class="recent-section glass-panel-inner">
    <div class="section-header d-flex v-center h-space-between mb-2">
      <span class="section-label">Recent Comments</span>
      <span v-if="comments.length" class="comment-count">{{ comments.length }} items</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-list">
      <div v-for="n in 4" :key="'sk-' + n" class="d-flex v-center mb-3">
        <r-skeleton loading type="avatar" width="32px" height="32px" class="me-2"></r-skeleton>
        <div class="flex-grow-1">
          <r-skeleton loading height="10px" width="60%" type="line" class="mb-1"></r-skeleton>
          <r-skeleton loading height="8px" width="80%" type="line"></r-skeleton>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!comments.length" class="empty-state d-flex flex-column v-center h-center py-4">
      <div class="empty-icon mb-2" v-html="emptySvg"></div>
      <p class="empty-text">No comments found</p>
    </div>

    <!-- List -->
    <div v-else class="comments-scroll">
      <div
        v-for="(comment, i) in comments"
        :key="comment.id || i"
        class="comment-item"
        :class="'item--' + comment.status"
      >
        <div class="comment-avatar">
          <div class="avatar-placeholder" :style="{ background: comment.avatarBg }">
            {{ comment.author.charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="comment-body">
          <div class="comment-top d-flex v-center h-space-between">
            <div class="d-flex v-center gap-1">
              <span class="comment-author">{{ comment.author }}</span>
              <!-- Rating stars -->
              <svg
                v-for="s in 5"
                :key="s"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                class="comment-star"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  :fill="s <= comment.rating ? '#fbbf24' : 'none'"
                  :stroke="s <= comment.rating ? '#fbbf24' : 'rgba(255,255,255,0.12)'"
                  stroke-width="1"
                />
              </svg>
            </div>
            <span class="comment-status" :class="'status--' + comment.status">
              {{ comment.status }}
            </span>
          </div>

          <p class="comment-text">{{ comment.text }}</p>

          <div class="comment-meta d-flex v-center h-space-between">
            <span v-if="comment.article" class="comment-article">on: {{ comment.article }}</span>
            <span class="comment-time">{{ comment.relativeTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'comment-recent-list' })

defineProps({
  comments: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emptySvg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
</script>

<style scoped lang="scss">
.recent-section {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--db-card-border, rgba(255,255,255,0.05));
}

.section-header {
  margin-bottom: 8px;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--db-text-secondary, rgba(255,255,255,0.65));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.comment-count {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255,255,255,0.4));
}

/* ── Loading ──────────────────────── */
.loading-list {
  padding: 4px 0;
}

/* ── Scrollable list ──────────────── */
.comments-scroll {
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.06) transparent;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
}

/* ── Comment item ─────────────────── */
.comment-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  transition: background 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    padding-left: 4px;
    padding-right: 4px;
  }

  & + & {
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }
}

/* ── Avatar ───────────────────────── */
.comment-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
}

/* ── Body ─────────────────────────── */
.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-top {
  margin-bottom: 3px;
  gap: 4px;
}

.comment-author {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--db-text-primary, rgba(255,255,255,0.92));
}

.comment-star {
  display: inline-block;
  vertical-align: middle;
}

.comment-status {
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 7px;
  border-radius: 4px;
  flex-shrink: 0;

  &.status--approved { background: rgba(52,211,153,0.15); color: #34d399; }
  &.status--pending  { background: rgba(251,191,36,0.15); color: #fbbf24; }
  &.status--rejected { background: rgba(248,113,113,0.15); color: #f87171; }
}

.comment-text {
  font-size: 0.6875rem;
  color: var(--db-text-secondary, rgba(255,255,255,0.65));
  line-height: 1.5;
  margin: 0 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-meta {
  gap: 4px;
}

.comment-article {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255,255,255,0.4));
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-time {
  font-size: 0.625rem;
  color: var(--db-text-muted, rgba(255,255,255,0.35));
  flex-shrink: 0;
}

/* ── Empty ──────────────────── */
.empty-state {
  .empty-icon {
    width: 40px;
    height: 40px;
    opacity: 0.2;
    color: var(--db-text-muted, rgba(255,255,255,0.4));
  }

  .empty-text {
    font-size: 0.75rem;
    color: var(--db-text-muted, rgba(255,255,255,0.4));
  }
}
</style>
