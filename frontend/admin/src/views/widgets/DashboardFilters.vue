<template>
  <div class="widgets-bar glass-panel">
    <div class="widgets-row d-flex v-center flex-wrap">
      <div class="widgets-actions d-flex v-center">
        <r-btn text size="sm" class="widget-settings-btn" @click.prevent="toggleWidgetSettings">
          <span class="settings-text">Widgets</span>
          <span class="settings-count ms-1">{{ enabledCount }}/7</span>
        </r-btn>
      </div>
    </div>

    <transition name="fade-slide">
      <div v-if="showWidgetSettings" class="widget-settings-panel mt-2">
        <div class="settings-title mb-2">Toggle Widgets</div>
        <div class="settings-grid">
          <div
            v-for="(enabled, key) in enabledWidgets"
            :key="key"
            class="setting-item"
            @click="toggleWidget(key)"
          >
            <div class="setting-toggle" :class="{ active: enabled }">
              <div class="toggle-dot"></div>
            </div>
            <span class="setting-label">{{ widgetLabels[key] }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

defineOptions({ name: 'dashboard-filters' })

const props = defineProps({
  enabledWidgets: {
    type: Object,
    required: true,
  },
  widgetLabels: {
    type: Object,
    default: () => ({
      kpi: 'KPI Cards',
      tickets: 'Tickets',
      comments: 'Comments',
      articles: 'Articles',
      files: 'Files & Storage',
      traffic: 'Traffic & Users',
      activity: 'Admin Activity',
    }),
  },
})

const emit = defineEmits(['toggle:widget'])

const showWidgetSettings = ref(false)
const localEnabled = ref({ ...props.enabledWidgets })

watch(
  () => props.enabledWidgets,
  (val) => {
    localEnabled.value = { ...val }
  },
  { deep: true },
)

const enabledCount = computed(() => Object.values(localEnabled.value).filter(Boolean).length)

function toggleWidgetSettings() {
  showWidgetSettings.value = !showWidgetSettings.value
}

function toggleWidget(key) {
  localEnabled.value[key] = !localEnabled.value[key]
  emit('toggle:widget', key, localEnabled.value[key])
}
</script>

<style scoped lang="scss">
.widgets-bar {
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.widgets-row {
  gap: 8px;
  justify-content: flex-end;
}

.widget-settings-btn {
  color: var(--db-text-muted, rgba(255, 255, 255, 0.4)) !important;

  .settings-text {
    font-size: 0.6875rem;
    font-weight: 500;
    text-transform: none;
  }
}

.settings-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: rgba(108, 99, 255, 0.2);
  color: #6c63ff;
  font-size: 0.5625rem;
  font-weight: 700;
}

.widget-settings-panel {
  background: rgba(16, 16, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.settings-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}

.setting-toggle {
  width: 28px;
  height: 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  position: relative;
  transition: background 0.3s ease;
  flex-shrink: 0;

  &.active {
    background: #6c63ff;
  }

  .toggle-dot {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.3s ease;
  }

  &.active .toggle-dot {
    transform: translateX(12px);
  }
}

.setting-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--db-text-secondary, rgba(255, 255, 255, 0.65));
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
