<template>
  <div
    class="template-panel h-end"
    :class="{
      'menu-open': open,
      'mobile-layout': isMobile
    }"
  >
    <header class="toolbar d-flex v-center">
      <r-btn class="btn-menu" icon text @click.prevent="open = !open" v-if="!isMobile">
        <r-icon v-if="!open" v-html="$r.icons.menu"></r-icon>
        <r-icon v-else v-html="$r.icons.close"></r-icon>
      </r-btn>

      <div class="brand-wrapper d-flex v-center">
        <div class="logo-container">
          <img class="brand-logo" :src="'/pwa/logo?t=m&w=170&h=60'" alt="Logo" />
          <div class="logo-glow"></div>
        </div>

        <div class="brand-divider"></div>

        <div class="brand-text">
          <span class="brand-sub">Admin Dashboard</span>
        </div>
      </div>

      <r-spacer></r-spacer>

      <div class="header-actions d-flex v-center">
        <div class="user-profile" v-if="$helper.ifHas($r.store, false, 'user', 'info', 'name')">
          <div class="user-avatar">
            <span class="avatar-initials">
              {{ getInitials($r.store.user.info.name) }}
            </span>
            <div class="avatar-status online"></div>
          </div>
          <div class="user-info">
            <span class="user-name">{{ $r.store.user.info.name }}</span>
            <span class="user-role">Administrator</span>
          </div>
        </div>

        <div class="quick-actions">
          <r-btn icon text class="action-btn" title="help">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="notification-dot"></span>
          </r-btn>

          <r-btn icon text class="action-btn" title="Help">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
              <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.92694 12.4272 7.06543C13.1255 7.20392 13.7588 7.59595 14.2151 8.17128C14.6713 8.7466 14.9211 9.46434 14.92 10.2C14.92 12 12.32 12.9 12.32 12.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="1.8"/>
            </svg>
          </r-btn>
        </div>
      </div>
    </header>

    <!-- Sidebar is hidden on mobile -->
    <aside class="menu-panel" v-if="!isMobile">
      <div class="sidebar-content">
        <div class="sidebar-header">
          <div class="sidebar-brand">
            <div class="brand-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="2" width="28" height="28" rx="8" fill="currentColor" opacity="0.1"/>
                <path d="M10 10H22V14L18 18L22 22V26H10V22L14 18L10 14V10Z" fill="currentColor" opacity="0.8"/>
                <path d="M16 8V12M16 20V24M8 16H12M20 16H24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="sidebar-brand-text">Admin Dashboard</span>
          </div>
        </div>

        <div class="navigation-wrapper">
          <admin-menus :items="menu"></admin-menus>
        </div>

        <div class="sidebar-footer">
          <r-btn-confirm
            @click="logout()"
            text
            :body="$t('logout_your_account')"
            class="logout-btn"
          >
            <r-icon v-html="$r.icons.arrow_right" class="logout-icon" width="20" height="20"></r-icon>
            <span>{{ $t('logout') }}</span>
          </r-btn-confirm>
        </div>
      </div>
      <div class="sidebar-overlay" @click.prevent="open = false"></div>
    </aside>

    <!-- ===== MAIN CONTENT ===== -->
    <r-content :flipped="$r.breakpoint.lgAndUp" below-header="80px" :class="{ 'has-bottom-menu': isMobile }">
      <router-view v-slot="{ Component }">
        <transition name="slide-start" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </r-content>

    <!-- ===== BOTTOM MENU (ALWAYS VISIBLE IN MOBILE) ===== -->
    <div v-if="isMobile" class="bottom-menu-container">
      <admin-menus :items="menu"></admin-menus>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminMenus from '@/components/menus.vue'

defineOptions({
  name: 'AdminLayout',
})

// ── Inject Renusify Globals ────────────────────────────────
const { $r, $t, $storage, $helper } = inject('renusify')
const axios = inject('axios')
const router = useRouter()

// ── Reactive State ─────────────────────────────────────────
const open = ref(false)
const menu = ref([])
const isMobile = ref(false)

// ── Methods ────────────────────────────────────────────────
function checkScreenSize() {
  isMobile.value = window.innerWidth < 1200
  if (isMobile.value) {
    open.value = false
  }
}

function logout() {
  axios.post('/user/logout')
  $r.store.user = {
    login: false,
    info: {},
  }
  $storage.remove('user_login')
  router.push({ path: '/' })
}

function getInitials(name) {
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// ── Lifecycle ──────────────────────────────────────────────
onMounted(() => {
  axios.get('home/menu/admin/' + $r.lang).then(({ data }) => {
    menu.value = data
  })
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// ── Watchers ───────────────────────────────────────────────
watch(
  () => router.currentRoute.value,
  () => {
    open.value = false
  },
)
</script>

<style lang="scss">
@use "sass:map";
@use "renusify/style/variables/base" as var;
@use "renusify/style/mixins" as mx;
@use "renusify/style/mixins/container" as mxc;
@use '../styles/mixins/glass' as glass;
@import url('../styles/fonts/inter-regular.woff2');

$menu-width: 320px;
$header-height: 80px;
$bottom-menu-height: 52px;

// ============================================
// Keep original structure
// ============================================
.template-panel {
  display: flex;
  flex-direction: row;
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2f7 50%, #e8edf4 100%);
  font-family: 'Inter', sans-serif;

  // ============================================
  // HEADER - Keep original styles + enhancements
  // ============================================
  .toolbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: $header-height;
    z-index: map.get(var.$z-index, "medium");
    background: rgba(255, 255, 255);
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 8px 32px rgba(0, 0, 0, 0.04);
    padding: 0 28px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .brand-wrapper {
      gap: 16px;
      margin-left: 24px;

      .logo-container {
        position: relative;
        display: flex;
        align-items: center;

        .brand-logo {
          height: 38px;
          width: auto;
          object-fit: contain;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.06));
          transition: filter 0.3s ease;
        }

        .logo-glow {
          position: absolute;
          inset: -8px;
          background: radial-gradient(circle at center, rgba(0, 0, 0, 0.04) 0%, transparent 70%);
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        &:hover .logo-glow {
          opacity: 1;
        }
      }

      .brand-divider {
        width: 1px;
        height: 32px;
        background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%);
      }

      .brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1.2;

        .brand-name {
          font-size: 16px;
          font-weight: 700;
          color: #0a0a0a;
          letter-spacing: -0.02em;
        }

        .brand-sub {
          font-size: 10px;
          font-weight: 500;
          color: #64748b;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          opacity: 0.7;
        }
      }
    }

    .header-actions {
      gap: 16px;

      .user-profile {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 12px 4px 16px;
        border-radius: 100px;
        background: rgba(0, 0, 0, 0.02);
        border: 1px solid rgba(0, 0, 0, 0.04);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: default;

        &:hover {
          background: rgba(0, 0, 0, 0.04);
          border-color: rgba(0, 0, 0, 0.08);
        }

        .user-avatar {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          .avatar-initials {
            color: white;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.02em;
          }

          .avatar-status {
            position: absolute;
            bottom: -1px;
            right: -1px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 2px solid white;
            background: #22c55e;

            &.online {
              background: #22c55e;
            }
          }
        }

        .user-info {
          display: flex;
          flex-direction: column;

          .user-name {
            font-size: 13px;
            font-weight: 600;
            color: #0a0a0a;
            letter-spacing: -0.01em;
          }

          .user-role {
            font-size: 10px;
            font-weight: 500;
            color: #94a3b8;
            letter-spacing: 0.02em;
          }
        }
      }

      .quick-actions {
        display: flex;
        gap: 4px;

        .action-btn {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          color: #64748b;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            background: rgba(0, 0, 0, 0.04);
            color: #0a0a0a;
            transform: translateY(-1px);
          }

          &:active {
            transform: scale(0.92);
          }

          .notification-dot {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #ef4444;
            border: 2px solid white;
            animation: pulse-dot 2s ease-in-out infinite;
          }
        }
      }
    }
  }

  // ============================================
  // SIDEBAR - Only for desktop
  // ============================================
  .menu-panel {
    position: fixed;
    top: $header-height;
    height: calc(100vh - #{$header-height});
    z-index: map.get(var.$z-index, "medium");
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    @include mx.rtl() { right: 0; }
    @include mx.ltr() { left: 0; }

    .sidebar-content {
      width: $menu-width;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255);
      border-right: 1px solid rgba(0, 0, 0, 0.04);
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      @include mx.rtl() {
        border-right: none;
        border-left: 1px solid rgba(0, 0, 0, 0.04);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg,
          rgba(255,255,255,0.5) 0%,
          transparent 20%,
          transparent 80%,
          rgba(255,255,255,0.3) 100%
        );
        pointer-events: none;
      }

      .sidebar-header {
        padding: 20px 20px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        flex-shrink: 0;

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;

          .brand-icon {
            color: #0a0a0a;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.03);
            border: 1px solid rgba(0, 0, 0, 0.04);
          }

          .sidebar-brand-text {
            font-size: 15px;
            font-weight: 700;
            color: #0a0a0a;
            letter-spacing: -0.02em;
          }

          .sidebar-version {
            margin-left: auto;
            font-size: 10px;
            font-weight: 600;
            color: #94a3b8;
            background: rgba(0, 0, 0, 0.04);
            padding: 2px 10px;
            border-radius: 100px;
            letter-spacing: 0.03em;
          }
        }
      }

      .navigation-wrapper {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
        @include glass.glass-scrollbar;

        &::-webkit-scrollbar {
          width: 1px;
        }
      }

      .sidebar-footer {
        padding: 12px 16px 20px;
        border-top: 1px solid rgba(0, 0, 0, 0.04);
        flex-shrink: 0;

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 12px;
          color: #dc2626;
          font-weight: 500;
          font-size: 13px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          border: none;
          cursor: pointer;

          &:hover {
            background: rgba(220, 38, 38, 0.06);
            transform: translateX(4px);

            .logout-icon {
              transform: translateX(-2px);
            }
          }

          &:active {
            transform: scale(0.97);
          }

          .logout-icon {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0;
          }
        }
      }
    }

    .sidebar-overlay {
      display: none;
      position: absolute;
      top: 0;
      @include mx.rtl() { right: $menu-width; }
      @include mx.ltr() { left: $menu-width; }
      width: calc(100vw - #{$menu-width});
      height: 100%;
      background: rgba(0, 0, 0, 0.2);
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  // ============================================
  // MOBILE SIDEBAR
  // ============================================
  &.menu-open {
    .menu-panel {
      .sidebar-content {
        @include mx.rtl() { transform: translateX(0); }
        @include mx.ltr() { transform: translateX(0); }
      }
      .sidebar-overlay {
        display: block;
        animation: fadeIn 0.3s ease;
      }
    }
  }

  // ============================================
  // BOTTOM MENU CONTAINER (Mobile only)
  // ============================================
  .bottom-menu-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    padding: 0;
    overflow: visible;

    // The admin-menus component inside will handle the rest
    .admin-menus {
      width: 100% !important;
      height: 100% !important;
      max-height: 62px !important;
      min-height: 62px !important;
      padding: 0 !important;
      margin: 0 !important;
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      display: flex !important;
      align-items: center !important;


      &::-webkit-scrollbar {
        height: 2px !important;
      }

      &::-webkit-scrollbar-track {
        background: transparent !important;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.1) !important;
        border-radius: 10px !important;
      }

      &::before {
        display: none !important;
      }
    }
  }
  // ============================================
  // DESKTOP
  // ============================================
  @media (min-width: 1200px) {
    .btn-menu {
      display: none !important;
    }

    .menu-panel {
      width: $menu-width !important;
      background: transparent;
      opacity: 1;

      .sidebar-content {
        transform: translateX(0) !important;
      }

      .sidebar-overlay {
        display: none !important;
      }
    }

    .bottom-menu-container {
      display: none !important;
    }
  }

  // ============================================
  // TABLET & MOBILE
  // ============================================

  @media (max-width: 1199.98px) {
    .btn-menu {
      display: none !important;
    }

    .menu-panel {
      display: none !important;
    }

    .toolbar {
      padding: 0 16px;

      .brand-wrapper {
        .brand-text {
          display: none;
        }
        .brand-divider {
          display: none;
        }
      }

      .header-actions {
        .user-profile {
          padding: 4px 8px;

          .user-info {
            display: none;
          }
        }
        .quick-actions {

          .action-btn {
            display: flex !important;
            width: 32px;
            height: 32px;

            svg {
              width: 18px;
              height: 18px;
            }
          }
        }
      }
    }

    &.mobile-layout {
      flex-direction: column;
      min-height: 100vh;

      r-content.has-bottom-menu {
        margin-bottom: $bottom-menu-height;
        min-height: calc(100vh - #{$header-height} - #{$bottom-menu-height});
      }
    }
  }

  @media (max-width: 575.98px) {
    .toolbar {
      padding: 0 12px;

      .brand-wrapper {
        gap: 8px;
        margin-left: 8px;

        .logo-container {
          .brand-logo {
            height: 30px;
          }
        }
      }

      .header-actions {
        .user-profile {
          padding: 4px 6px;

          .user-avatar {
            width: 30px;
            height: 30px;

            .avatar-initials {
              font-size: 10px;
            }
          }
        }
      }
    }
  }
}

// ============================================
// ANIMATIONS
// ============================================
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.7; }
}

// Keep original transition
.slide-start-enter-active,
.slide-start-leave-active {
  transition: all 0.3s ease;
}

.slide-start-enter-from,
.slide-start-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

// ============================================
// DARK MODE
// ============================================
@media (prefers-color-scheme: dark) {
  .template-panel {
    background: linear-gradient(135deg, #0f1117 0%, #171b24 50%, #1a1f2b 100%);

    .toolbar {
      background: rgba(15, 17, 23, 0.92);
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

      .brand-wrapper {
        .brand-divider {
          background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
        }

        .brand-text {
          .brand-name {
            color: #f1f5f9;
          }
          .brand-sub {
            color: #94a3b8;
          }
        }
      }

      .header-actions {
        .user-profile {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.06);

          &:hover {
            background: rgba(255, 255, 255, 0.08);
          }

          .user-avatar {
            background: linear-gradient(135deg, #2a2f3a 0%, #3a3f4a 100%);
          }

          .user-info {
            .user-name {
              color: #f1f5f9;
            }
          }
        }

        .quick-actions {
          .action-btn {
            color: #94a3b8;

            &:hover {
              background: rgba(255, 255, 255, 0.06);
              color: #f1f5f9;
            }

            .notification-dot {
              border-color: #0f1117;
            }
          }
        }
      }
    }

    .menu-panel {
      .sidebar-content {
        background: rgba(15, 17, 23, 0.95);
        border-right-color: rgba(255, 255, 255, 0.04);

        &::before {
          background: linear-gradient(180deg,
            rgba(255,255,255,0.03) 0%,
            transparent 20%,
            transparent 80%,
            rgba(255,255,255,0.02) 100%
          );
        }

        .sidebar-header {
          border-bottom-color: rgba(255, 255, 255, 0.04);

          .sidebar-brand {
            .brand-icon {
              color: #f1f5f9;
              background: rgba(255, 255, 255, 0.04);
              border-color: rgba(255, 255, 255, 0.06);
            }

            .sidebar-brand-text {
              color: #f1f5f9;
            }

            .sidebar-version {
              color: #64748b;
              background: rgba(255, 255, 255, 0.06);
            }
          }
        }

        .sidebar-footer {
          border-top-color: rgba(255, 255, 255, 0.04);

          .logout-btn {
            &:hover {
              background: rgba(220, 38, 38, 0.12);
            }
          }
        }
      }
    }

    // Bottom menu dark mode
    .bottom-menu-container {
      background: rgba(15, 17, 23, 0.98);
      border-top-color: rgba(255, 255, 255, 0.06);
      box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
