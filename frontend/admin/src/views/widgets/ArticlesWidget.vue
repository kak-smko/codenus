<template>
  <div class="widget glass-panel">
    <div class="widget-header d-flex v-center h-space-between mb-3">
      <div class="d-flex v-center">
        <div class="widget-title-icon color-one-text" v-html="iconSvg"></div>
        <h3 class="widget-title ms-2">Recent Articles</h3>
      </div>
      <r-btn text size="sm" class="widget-action-btn" @click.prevent="viewAll">
        <span class="action-text">View All</span>
        <r-icon v-html="$r.icons.chevron_right" width="16" height="16"></r-icon>
      </r-btn>
    </div>

    <div v-if="loading" class="loading-state">
      <r-skeleton v-for="n in 4" :key="n" loading height="44px" type="line" class="mb-2"></r-skeleton>
    </div>

    <div v-else-if="articles.length === 0" class="empty-state d-flex flex-column v-center h-center py-5">
      <div class="empty-icon mb-2" v-html="iconSvg"></div>
      <p class="empty-text">No articles published</p>
    </div>

    <div v-else class="articles-list">
      <div
        v-for="(article, index) in articles"
        :key="index"
        class="article-item"
      >
        <div class="article-info">
          <div class="article-title">{{ article.title }}</div>
          <div class="article-meta d-flex v-center">
            <span class="article-category">{{ article.category }}</span>
            <span class="meta-dot">·</span>
            <span class="article-views">{{ article.views }} views</span>
            <span class="meta-dot">·</span>
            <span class="article-date">{{ article.date }}</span>
          </div>
        </div>
        <div class="article-status" :class="'status--' + article.status">
          {{ article.status }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const $r = inject('renusify').$r

defineOptions({
  name: 'articles-widget',
})

const emit = defineEmits(['view-all'])

const loading = ref(false)

const articles = ref([
  {
    title: 'Getting Started with Renusify v3',
    category: 'Documentation',
    status: 'published',
    views: 2847,
    date: '1 day ago',
  },
  {
    title: 'Advanced Component Patterns in Vue 3',
    category: 'Tutorial',
    status: 'published',
    views: 1532,
    date: '3 days ago',
  },
  {
    title: 'API Authentication Best Practices',
    category: 'Security',
    status: 'draft',
    views: 0,
    date: '1 week ago',
  },
  {
    title: 'Building Responsive Layouts with CSS Grid',
    category: 'Tutorial',
    status: 'published',
    views: 984,
    date: '1 week ago',
  },
])

const iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'

function viewAll() {
  emit('view-all')
}
</script>

<style scoped lang="scss">
.widget {
  padding: 20px;
  border-radius: 14px;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    transform: translateY(-2px);
  }
}

.widget-header {
  .widget-title-icon {
    display: inline-flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(108, 99, 255, 0.12);
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

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.article-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  & + & {
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }
}

.article-info {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--db-text-primary, rgba(255, 255, 255, 0.92));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.article-meta {
  font-size: 0.6875rem;
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  gap: 4px;
}

.meta-dot {
  opacity: 0.4;
}

.article-status {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 6px;
  margin-left: 12px;
  flex-shrink: 0;

  &.status--published {
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;
  }

  &.status--draft {
    background: rgba(251, 191, 36, 0.15);
    color: #fbbf24;
  }

  &.status--archived {
    background: rgba(148, 163, 184, 0.15);
    color: #94a3b8;
  }
}

.loading-state,
.empty-state {
  .empty-icon {
    width: 48px;
    height: 48px;
    opacity: 0.2;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  }

  .empty-text {
    font-size: 0.8125rem;
    color: var(--db-text-muted, rgba(255, 255, 255, 0.4));
  }
}
</style>
