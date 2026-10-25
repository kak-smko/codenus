<template>
  <div class="template-panel" :class="{ 'menu-open': open }" @keydown.esc="open = false">
    <header class="toolbar d-flex v-center">
      <r-btn
        class="btn-menu"
        icon
        text
        aria-label="Toggle navigation menu"
        :aria-expanded="open"
        aria-controls="user-navigation"
        @click.prevent="open = !open"
      >
        <r-icon v-if="!open" v-html="$r.icons.menu"></r-icon>
        <r-icon v-else v-html="$r.icons.close"></r-icon>
      </r-btn>

      <r-img class="user-logo" :src="'/api/storage/img/logo.png'" :width="180" :height="60" alt="logo" />

      <span
        v-if="$helper.ifHas($r.store, false, 'user', 'info', 'name')"
        class="user-welcome"
      >{{ $t(["welcome", [$r.store.user.info.name]]) }}</span>
      <r-spacer></r-spacer>
    </header>

    <aside id="user-navigation" class="menu-panel" aria-label="user navigation">
      <button
        class="menu-backdrop"
        type="button"
        aria-label="Close navigation menu"
        tabindex="-1"
        @click="open = false"
      ></button>
      <div class="list">
        <user-menus :items="menu" class="navigation-list"></user-menus>
        <r-btn-confirm
          @click="logout()"
          text
          :body="$t('logout_your_account')"
          class="logout-button text-start color-error-text"
        >
          <svg class="logout-icon me-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" aria-hidden="true">
            <path
              d="M15.102 16.442c-.31 3.6-2.16 5.07-6.21 5.07h-.13c-4.47 0-6.26-1.79-6.26-6.26v-6.52c0-4.47 1.79-6.26 6.26-6.26h.13c4.02 0 5.87 1.45 6.2 4.99M8.999 12h11.38M18.15 15.352l3.35-3.35-3.35-3.35"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            ></path>
          </svg>
          {{ $t('logout') }}
        </r-btn-confirm>
      </div>
    </aside>

    <r-content :flipped="$r.breakpoint.lgAndUp" below-header="80px" class="user-content">
      <router-view v-slot="{ Component }">
        <transition name="slide-start" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </r-content>
  </div>
</template>

<script>
import userMenus from '@/components/menus.vue'

export default {
  components: { userMenus },
  data() {
    return {
      open: false,
      menu: []
    }
  },
  created() {
    this.$axios.get('/api/home/menu/user/' + this.$r.lang).then(({ data }) => {
      if (data) {
        this.menu = this.to_json(data)
      }
    })
  },
  methods: {
    to_json(data) {
      if (!Array.isArray(data)) return data
    
      data.forEach(item => {
        if (item && item.to) {
          try {
            item.to = JSON.parse(this.$helper.cleanText(item.to))
          } catch {
            item.to = null
          }
        }
    
        if (item && Array.isArray(item.children)) {
          this.to_json(item.children)  
        }
      })
    
      return data
    },
    logout() {
      this.$axios.post('/api/user/logout')
      this.$r.store.user = {
        login: false,
        info: {}
      }
      this.$storage.remove('user_login')
      this.$router.push({ path: '/' })
    }
  },
  watch: {
    $route() {
      this.open = false
    }
  }
}
</script>

<style lang="scss">
@use "sass:map";
@use "renusify/style/variables/base" as var;
@use "renusify/style/mixins" as mx;
$menu-width: 300px;
$header-height: 80px;

.template-panel {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  position: relative;

  .toolbar {
    align-items: center;
    border-bottom: 1px solid var(--color-border-low);
    box-sizing: border-box;
    display: flex;
    gap: 12px;
    height: $header-height;
    padding-inline: 16px;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: map.get(var.$z-index, "medium");
    background-color: var(--color-sheet);
  }

  .btn-menu {
    flex: 0 0 auto;
    min-width: 40px;
  }

  .user-logo {
    display: block;
    height: 44px;
    max-width: min(180px, 35vw);
    object-fit: contain;
    object-position: start center;
    width: auto;
  }

  .user-welcome {
    color: var(--color-border);
    font-size: 0.95rem;
    margin-inline-start: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .menu-panel {
    height: calc(100vh - #{$header-height});
    inset-block-start: $header-height;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    transition: opacity 180ms ease;
    visibility: hidden;
    width: 100%;
    z-index: map.get(var.$z-index, "medium");

    @include mx.rtl() {
      right: 0;
    }
    @include mx.ltr() {
      left: 0;
    }
  }

  .menu-backdrop {
    background: rgba(0, 0, 0, 0.42);
    border: 0;
    cursor: pointer;
    inset: 0;
    opacity: 0;
    position: absolute;
    transition: opacity 180ms ease;
    width: 100%;
  }

  .list {
    background-color: var(--color-sheet);
    box-shadow: 0 12px 32px var(--color-border-low);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    padding: 14px 12px 12px;
    pointer-events: auto;
    position: absolute;
    top: 0;
    transition: transform 220ms ease;
    width: min($menu-width, calc(100vw - 48px));

    @include mx.rtl() {
      border-left: 1px solid var(--color-border-low);
      right: 0;
      transform: translateX(100%);
    }
    @include mx.ltr() {
      border-right: 1px solid var(--color-border-low);
      left: 0;
      transform: translateX(-100%);
    }
  }

  .navigation-list {
    flex: 1 1 auto;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0 2px 12px;
  }

  .logout-button {
    align-items: center;
    border-top: 1px solid var(--color-border-low);
    display: flex;
    flex: 0 0 auto;
    gap: 10px;
    margin-top: auto;
    min-height: 48px;
    padding: 10px 12px;
    text-align: start;
    width: 100%;

    &:hover {
      background-color: var(--color-sheet-container);
    }
  }

  .logout-icon {
    flex: 0 0 20px;
    height: 20px;
    width: 20px;
  }

  &.menu-open {
    .menu-panel {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    .menu-backdrop {
      opacity: 1;
    }

    .list {
      transform: translateX(0);
    }
  }

  @media (min-width: 1200px) {
    .btn-menu {
      display: none;
    }

    .menu-panel {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
      width: $menu-width;
    }

    .menu-backdrop {
      display: none;
    }

    .list {
      box-shadow: none;
      transform: none;
      width: $menu-width;
    }

  }
}

@media (min-width: 1200px) {
  .app-ltr .template-panel .list,
  .app-rtl .template-panel .list {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .template-panel .menu-panel,
  .template-panel .menu-backdrop,
  .template-panel .list {
    transition: none;
  }
}
</style>
