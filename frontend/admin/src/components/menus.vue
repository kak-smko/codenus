<template>
  <ul class="admin-menus">
    <li
      v-for="(item, index) in items"
      :key="item.id ?? item.title ?? index"
      class="admin-menu-node"
      :class="{ 'has-children': hasChildren(item), 'is-expanded': isExpanded(item) }"
    >
      <div class="admin-menu-row">
        <router-link
          v-if="item.to"
          :to="item.to"
          class="admin-menu-item"
          active-class="is-active"
          exact-active-class="is-current"
        >
          <r-img
            v-if="item.icon"
            class="admin-menu-icon"
            :src="item.icon"
            is-svg
            width="20"
            height="20"
            alt=""
          ></r-img>
          <span class="admin-menu-title">{{ item.title }}</span>
        </router-link>
        <button
          v-else-if="hasChildren(item)"
          type="button"
          class="admin-menu-item admin-menu-parent"
          :aria-expanded="isExpanded(item)"
          @click="toggle(item)"
        >
          <r-img
            v-if="item.icon"
            class="admin-menu-icon"
            :src="item.icon"
            is-svg
            width="20"
            height="20"
            alt=""
          ></r-img>
          <span class="admin-menu-title">{{ item.title }}</span>
          <r-icon
            class="admin-menu-chevron"
            :class="{ 'is-rotated': isExpanded(item) }"
            v-html="$r.icons.chevron_down"
          ></r-icon>
        </button>
        <span v-else class="admin-menu-item admin-menu-label">
          <r-img
            v-if="item.icon"
            class="admin-menu-icon"
            :src="item.icon"
            is-svg
            width="20"
            height="20"
            alt=""
          ></r-img>
          <span class="admin-menu-title">{{ item.title }}</span>
        </span>

        <button
          v-if="item.to && hasChildren(item)"
          type="button"
          class="admin-menu-toggle"
          :aria-label="`${isExpanded(item) ? 'Collapse' : 'Expand'} ${item.title} submenu`"
          :aria-expanded="isExpanded(item)"
          @click="toggle(item)"
        >
          <r-icon
            class="admin-menu-chevron"
            :class="{ 'is-rotated': isExpanded(item) }"
            v-html="$r.icons.chevron_down"
          ></r-icon>
        </button>
      </div>

      <div
        v-if="hasChildren(item)"
        v-show="isExpanded(item)"
        class="admin-submenu"
        :aria-hidden="!isExpanded(item)"
        :inert="!isExpanded(item)"
      >
        <admin-menus :items="item.children"></admin-menus>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'admin-menus',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      open: null
    }
  },
  methods: {
    hasChildren(item) {
      return Array.isArray(item.children) && item.children.length > 0
    },
    toggle(item) {
      this.open = this.open === item.id ? null : item.id
    },
    hasActiveRoute(items) {
      return items.some(item => {
        if (item.to && this.$router.resolve(item.to).path === this.$route.path) {
          return true
        }

        return this.hasChildren(item) && this.hasActiveRoute(item.children)
      })
    },
    isExpanded(item) {
      return this.open === item.id || (this.hasChildren(item) && this.hasActiveRoute(item.children))
    }
  }
}
</script>

<style lang="scss">
.admin-menus {
  list-style: none;
  margin: 0;
  min-width: 0;
  padding: 0;
}

.admin-menu-node {
  margin: 2px 0;
}

.admin-menu-row {
  align-items: center;
  display: flex;
  gap: 4px;
}

.admin-menu-item {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex: 1 1 auto;
  font: inherit;
  gap: 12px;
  min-height: 42px;
  min-width: 0;
  padding: 8px 12px;
  text-align: start;
  text-decoration: none;
  transition: background-color 160ms ease, color 160ms ease;
  width: 100%;

  &:hover {
    background-color: var(--color-sheet-container);
  }

  &:focus-visible {
    outline: 2px solid var(--color-one);
    outline-offset: 2px;
  }
}

.admin-menu-icon {
  flex: 0 0 20px;
  opacity: 0.82;
}

.admin-menu-title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-menu-label {
  cursor: default;
}

.admin-menu-parent {
  .admin-menu-chevron {
    margin-inline-start: auto;
  }
}

.admin-menu-toggle {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex: 0 0 38px;
  height: 38px;
  justify-content: center;
  padding: 0;

  &:hover {
    background-color: var(--color-sheet-container);
  }

  &:focus-visible {
    outline: 2px solid var(--color-one);
    outline-offset: 2px;
  }
}

.admin-menu-chevron {
  flex: 0 0 18px;
  height: 18px;
  transition: transform 160ms ease;
  width: 18px;

  &.is-rotated {
    transform: rotate(180deg);
  }
}

.admin-menu-item.is-active {
  color: var(--color-one);
  font-weight: 600;
}

.admin-menu-item.is-current {
  background-color: var(--color-one);
  color: var(--color-on-one);
  font-weight: 600;

  .admin-menu-icon {
    opacity: 1;
  }

  path {
    stroke: currentColor !important;
  }
}

.admin-submenu {
  border-inline-start: 1px solid var(--color-border-low);
  margin: 4px 0 6px 20px;
  padding: 0 0 0 8px;
}

@media (prefers-reduced-motion: reduce) {
  .admin-menu-item,
  .admin-menu-toggle,
  .admin-menu-chevron {
    transition: none;
  }
}
</style>
