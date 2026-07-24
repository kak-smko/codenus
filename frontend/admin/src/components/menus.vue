<template>
  <div class="ps-2 admin-menus" :class="{ 'mobile-bottom-menu': isMobile }">
    <div v-for="(item, i) in items" :key="i" class="menu-item-wrapper ">
      <div class="d-flex h-space-between v-center cursor-pointer menu-item-container"
           :class="{ 'has-children': item.children && item.children.length > 0 }">
        <r-card class="admin-menu-item d-flex v-center flex-grow-1 py-1"
                :to="item.to"
                @click.prevent="handleItemClick(item)"
                flat
                :class="{ 'active-item': isActive(item) }">

          <span class="menu-title">{{ item.title }}</span>
          <div class="menu-badge" v-if="item.badge">{{ item.badge }}</div>
        </r-card>
        <div v-if="item.children && item.children.length > 0"
             class="toggle-icon-wrapper me-1 cursor-pointer"
             @click.prevent.stop="toggleMenu(item.id)">
          <r-icon class="toggle-icon"
                  v-html="open === item.id ? $r.icons.chevron_up : $r.icons.chevron_down"
                  :class="{ 'rotated': open === item.id }"></r-icon>
        </div>
      </div>
      <admin-menus v-if="item.children && item.children.length > 0"
                   :class="{ 'admin-menus-hide': open !== item.id, 'menu-enter': open === item.id }"
                   :items="item.children"
                   class="ms-2 children-menu"></admin-menus>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineOptions({
  name: 'AdminMenus',
})

// ── Props ──────────────────────────────────────────────────
const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
})

// ── Inject Renusify Globals ────────────────────────────────
const { $r } = inject('renusify')
const route = useRoute()
const router = useRouter()

function getIcon(iconName) {
  if (!iconName) {
    return $r.icons.circle || getFallbackIcon()
  }

  if (Array.isArray(iconName)) {
    iconName = iconName[0] || ''
  }

  iconName = String(iconName).trim()

  const iconMap = {
    'menu': 'menu',
    'close': 'close',
    'chevron_up': 'chevron_up',
    'chevron_down': 'chevron_down',
    'dashboard': 'star',
    'activity': 'star',
    'storage': 'file',
    'settings': 'setting',
    'pages': 'file',
    'sms': 'send',
    'permissions': 'check',
    'roles': 'menu_dot',
    'users': 'menu_dot',
    'translates': 'code_tags',
  }

  let mappedName = iconMap[iconName] || iconName
  let iconHtml = $r.icons[mappedName]

  if (!iconHtml) {
    iconHtml = $r.icons[iconName]
  }

  if (!iconHtml) {
    console.warn(`⚠️ Icon "${iconName}" not found. Using the default icon.`)
    iconHtml = $r.icons.circle || getFallbackIcon()
  }

  return iconHtml
}

function getFallbackIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`
}

// ── Reactive State ─────────────────────────────────────────
const open = ref(null)
const activePath = ref('')
const isMobile = ref(false)

// ── Methods ────────────────────────────────────────────────
function checkScreenSize() {
  isMobile.value = window.innerWidth < 1200
}

function toggleMenu(id) {
  open.value = open.value === id ? null : id
}

function handleItemClick(item) {
  if (isMobile.value && item.children && item.children.length > 0) {
    toggleMenu(item.id)
  }
  if (item.to) {
    router.push(item.to)
  }
}



function isActive(item) {
  if (!item.to || !route) return false
  return route.path === item.to || route.path.startsWith(item.to + '/')
}

// ── Lifecycle ──────────────────────────────────────────────
onMounted(() => {
  activePath.value = route?.path || ''
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// ── Watchers ───────────────────────────────────────────────
watch(
  () => route.path,
  (newPath) => {
    activePath.value = newPath
  },
)
</script>

<style lang="scss">
@use '../styles/mixins/glass' as glass;
@import url('../styles/fonts/inter-regular.woff2');

.admin-menus {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 240px;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  @include glass.glass-scrollbar;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg,
      transparent 0%,
      #000 20%,
      #000 80%,
      transparent 100%
    );
    opacity: 0.3;
    z-index: 10;
  }

  .menu-item-wrapper {
    margin: 4px 12px;
    border-radius: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 14px;
      background: linear-gradient(135deg,
        rgba(255,255,255,0.1) 0%,
        rgba(255,255,255,0) 100%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.03);
      transform: translateX(2px);

      &::after {
        opacity: 1;
      }
    }

    &:has(.active-item) {
      background: rgba(0, 0, 0, 0.04);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }
  }

  .menu-item-container {
    position: relative;
    border-radius: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.has-children {
      .admin-menu-item {
        padding-right: 8px;
      }
    }
  }

  .admin-menu-item {
    padding: 12px 18px;
    border-radius: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
    font-size: 14px;
    color: #64748b;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.01em;
    position: relative;
    overflow: hidden;
    background: transparent;
    border: none;
    min-height: 58px !important;
    text-decoration: none;
    cursor: pointer;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%) scaleY(0);
      width: 3.5px;
      height: 24px;
      background: linear-gradient(180deg,
        rgba(0,0,0,0.8) 0%,
        rgba(0,0,0,0.4) 100%
      );
      border-radius: 0 4px 4px 0;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      opacity: 0;
      transform-origin: center;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 14px;
      background: radial-gradient(circle at 30% 50%,
        rgba(255,255,255,0.1) 0%,
        transparent 70%
      );
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #000000;
      transform: translateX(6px);

      &::before {
        transform: translateY(-50%) scaleY(1);
        opacity: 1;
      }

      &::after {
        opacity: 1;
      }

      .icon-wrapper {
        transform: scale(1.08) rotate(-4deg);

        .icon-backdrop {
          opacity: 0.3;
          transform: scale(1.1) rotate(4deg);
        }
      }

      .menu-icon {
        color: #000000;
        opacity: 1;
        transform: scale(1.05);
      }

      .menu-badge {
        transform: scale(1.08);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }
    }

    &.active-item {
      background: rgba(0, 0, 0, 0.07);
      color: #000000;
      font-weight: 600;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

      &::before {
        transform: translateY(-50%) scaleY(1);
        opacity: 1;
        height: 28px;
        background: linear-gradient(180deg,
          #000000 0%,
          rgba(0,0,0,0.5) 100%
        );
      }

      &::after {
        opacity: 0.5;
        background: radial-gradient(circle at 20% 50%,
          rgba(0,0,0,0.06) 0%,
          transparent 70%
        );
      }

      .icon-wrapper {
        transform: scale(1.05);

        .icon-backdrop {
          opacity: 0.4;
          transform: scale(1);
          background: rgba(0, 0, 0, 0.12);
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.05);
        }
      }

      .menu-icon {
        color: #000000;
        opacity: 1;
        transform: scale(1.02);
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
      }

      .menu-title {
        color: #000000;
        letter-spacing: -0.02em;
      }
    }

    &:active {
      transform: scale(0.98);

      .icon-wrapper {
        transform: scale(0.95);
      }
    }
  }

  .icon-wrapper {
    position: relative;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    flex-shrink: 0;

    .icon-backdrop {
      position: absolute;
      inset: 0;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.04);
      opacity: 0;
      transform: scale(0.7) rotate(-10deg);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: 1px solid rgba(0, 0, 0, 0.02);
    }

    .menu-icon {
      position: relative;
      z-index: 1;
      opacity: 0.5;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: scale(1);

      svg {
        width: 22px;
        height: 22px;
        stroke-width: 1.8;
        transition: all 0.3s ease;
      }
    }

    .default-icon {
      position: relative;
      z-index: 1;
      opacity: 0.3;
      color: #94a3b8;
      transform: scale(0.9);

      svg {
        width: 22px;
        height: 22px;
      }
    }
  }

  .menu-title {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13.5px;
    letter-spacing: -0.01em;
  }

  .menu-badge {
    margin-left: auto;
    padding: 3px 12px;
    border-radius: 20px;
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    color: white;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg,
        transparent 30%,
        rgba(255,255,255,0.1) 50%,
        transparent 70%
      );
      animation: shimmer 3s ease-in-out infinite;
    }
  }

  .toggle-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-right: 4px;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      transform: scale(1.05);

      .toggle-icon {
        color: #000000;
      }
    }

    &:active {
      transform: scale(0.92);
    }

    .toggle-icon {
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 18px;
        height: 18px;
        stroke-width: 2.2;
        transition: all 0.3s ease;
      }

      &.rotated {
        transform: rotate(180deg);
        color: #000000;

        svg {
          stroke-width: 2.5;
        }
      }
    }
  }

  .children-menu {
    position: relative;
    margin-top: 6px;
    border-left: 2px solid rgba(0, 0, 0, 0.08);
    padding-left: 12px;
    margin-left: 16px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      left: -2px;
      top: 0;
      width: 2px;
      height: 100%;
      background: linear-gradient(180deg,
        rgba(0,0,0,0.15) 0%,
        rgba(0,0,0,0.05) 50%,
        rgba(0,0,0,0.15) 100%
      );
      opacity: 0.5;
    }

    .admin-menu-item {
      padding: 8px 14px;
      font-size: 13px;
      min-height: 50px;
      border-radius: 10px;
      margin: 2px 0;

      &::before {
        height: 16px;
        width: 2.5px;
      }

      .icon-wrapper {
        width: 30px;
        height: 30px;

        .menu-icon {
          opacity: 0.4;

          svg {
            width: 18px;
            height: 18px;
          }
        }
      }

      &:hover {
        transform: translateX(4px);
      }

      &.active-item {
        background: rgba(0, 0, 0, 0.06);

        .icon-wrapper {
          transform: scale(1);
        }
      }
    }

    .children-menu {
      margin-left: 12px;
      padding-left: 10px;
      border-left-color: rgba(0, 0, 0, 0.06);
    }
  }

  .admin-menus-hide {
    max-height: 0 !important;
    opacity: 0;
    transform: translateY(-12px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    border-left-color: transparent;

    & + .admin-menus-hide {
      transition-delay: 0.05s;
    }
  }

  .menu-enter {
    max-height: 1200px;
    opacity: 1;
    transform: translateY(0);
    animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  // ============================================
    // MOBILE BOTTOM MENU - COMPLETE FIX WITH SCROLL
    // ============================================
    &.mobile-bottom-menu {
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      top: auto !important;
      height: auto !important;
      min-height: 75px !important;
      max-height: 80px !important;
      min-width: 100% !important;
      width: 100% !important;
      background: rgba(255, 255, 255, 0.98) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border-top: 1px solid rgba(0, 0, 0, 0.06) !important;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06) !important;
      padding: 10px 0 12px 0 !important;
      margin: 0 !important;
      border-radius: 0 !important;
      z-index: 1000 !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      display: flex !important;
      align-items: center !important;

      justify-content: flex-start !important;
      flex-wrap: nowrap !important;
      flex-direction: row !important;

      &::-webkit-scrollbar {
        height: 3px !important;
        width: 3px !important;
      }

      &::-webkit-scrollbar-track {
        background: transparent !important;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.15) !important;
        border-radius: 10px !important;
      }

      scrollbar-width: thin !important;

      &::before {
        display: none !important;
      }

      .menu-item-wrapper {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 56px !important;
        max-width: 90px !important;
        width: auto !important;
        min-height: 60px !important;
        height: 100% !important;
        margin: 0 2px !important;
        padding: 2px 4px !important;
        border-radius: 0 !important;
        background: transparent !important;
        flex: 0 0 auto !important;
        flex-shrink: 0 !important;
        flex-grow: 0 !important;
        transition: all 0.2s ease !important;
        position: relative !important;

        &::after {
          display: none !important;
        }

        &:hover {
          background: rgba(0, 0, 0, 0.04) !important;
          transform: translateY(-1px) !important;
        }

        .menu-item-container {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: transparent !important;
          box-shadow: none !important;

          .admin-menu-item {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 6px 6px 4px 6px !important;
            margin: 0 !important;
            min-height: auto !important;
            height: 100% !important;
            width: 100% !important;
            border-radius: 8px !important;
            background: transparent !important;
            box-shadow: none !important;
            transform: none !important;

            &::before {
              display: none !important;
            }

            &::after {
              display: none !important;
            }

            &:hover {
              background: transparent !important;
              transform: none !important;
            }

            .menu-title {
              font-size: 12px !important;
              font-weight: 500 !important;
              color: #64748b !important;
              margin: 4px 0 2px 0 !important;
              padding: 0 !important;
              line-height: 1.1 !important;
              text-align: center !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              max-width: 80px !important;
              width: 100% !important;
            }

            .menu-badge {
              font-size: 7px !important;
              padding: 0 4px !important;
              min-width: 12px !important;
              height: 12px !important;
              line-height: 12px !important;
              position: absolute !important;
              top: 0 !important;
              right: 2px !important;
              border-radius: 50% !important;
              background: #ef4444 !important;
              color: white !important;
              box-shadow: 0 1px 4px rgba(239, 68, 68, 0.3) !important;

              &::after {
                display: none !important;
              }
            }

            &.active-item {
              background: rgba(0, 0, 0, 0.06) !important;

              .menu-icon {
                opacity: 1 !important;
                color: #000000 !important;
              }

              .menu-title {
                color: #000000 !important;
                font-weight: 600 !important;
              }
            }
          }

          .toggle-icon-wrapper {
            display: none !important;
          }
        }

        .children-menu {
          position: fixed !important;
          bottom: 72px !important;
          left: 50% !important;
          transform: translateX(-50%) scale(0.95) !important;
          min-width: 200px !important;
          max-width: 85vw !important;
          width: auto !important;
          max-height: 55vh !important;
          overflow-y: auto !important;
          background: rgba(255, 255, 255, 0.98) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-radius: 14px !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.12) !important;
          padding: 6px 8px !important;
          margin: 0 !important;
          z-index: 1001 !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          border-left: none !important;
          display: block !important;

          &::before {
            display: none !important;
          }

          &.menu-enter {
            opacity: 1 !important;
            pointer-events: auto !important;
            transform: translateX(-50%) scale(1) !important;
          }

          &.admin-menus-hide {
            opacity: 0 !important;
            pointer-events: none !important;
            transform: translateX(-50%) scale(0.95) translateY(8px) !important;
            max-height: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          .admin-menu-item {
            padding: 6px 12px !important;
            font-size: 12px !important;
            min-height: 32px !important;
            border-radius: 8px !important;
            margin: 1px 0 !important;
            background: transparent !important;
            box-shadow: none !important;

            &::before, &::after {
              display: none !important;
            }

            &:hover {
              background: rgba(0, 0, 0, 0.04) !important;
            }

            .menu-title {
              font-size: 12px !important;
              max-width: none !important;
              text-align: right !important;
            }
          }
        }
      }
    }
}

// ===== ANIMATIONS =====
@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) rotate(25deg);
  }
  100% {
    transform: translateX(100%) rotate(25deg);
  }
}

// ===== CUSTOM SCROLLBAR =====
.admin-menus::-webkit-scrollbar {
  width: 4px;
}

.admin-menus::-webkit-scrollbar-track {
  background: transparent;
  margin: 12px 0;
}

.admin-menus::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.admin-menus::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

// ===== RESPONSIVE =====
@media (max-width: 768px) {
  .admin-menus:not(.mobile-bottom-menu) {
    min-width: 100%;
    max-height: calc(100vh - 140px);
    padding: 8px 0;

    .menu-item-wrapper {
      margin: 3px 8px;
    }

    .admin-menu-item {
      padding: 14px 16px;
      font-size: 15px;
      min-height: 60px;
      border-radius: 12px;

      .icon-wrapper {
        width: 40px;
        height: 40px;

        .menu-icon svg {
          width: 24px;
          height: 24px;
        }
      }
    }

    .children-menu {
      .admin-menu-item {
        font-size: 14px;
        min-height: 44px;
        padding: 10px 14px;
      }
    }
  }
}

// ===== DARK MODE SUPPORT =====
@media (prefers-color-scheme: dark) {
  .admin-menus {
    .menu-item-wrapper {
      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      &:has(.active-item) {
        background: rgba(255, 255, 255, 0.06);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }
    }

    .admin-menu-item {
      color: #94a3b8;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;
      }

      &::before {
        background: linear-gradient(180deg,
          rgba(255,255,255,0.8) 0%,
          rgba(255,255,255,0.4) 100%
        );
      }

      &.active-item {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);

        .menu-icon {
          color: #ffffff;
        }

        .menu-title {
          color: #ffffff;
        }

        .icon-backdrop {
          background: rgba(255, 255, 255, 0.1);
        }
      }

      .menu-icon {
        color: #94a3b8;
      }

      .icon-backdrop {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    .menu-badge {
      background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
      color: #000000;
      box-shadow: 0 2px 12px rgba(255, 255, 255, 0.1);
    }

    .toggle-icon-wrapper {
      &:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      .toggle-icon {
        color: #64748b;

        &.rotated {
          color: #ffffff;
        }
      }
    }

    .children-menu {
      border-left-color: rgba(255, 255, 255, 0.1);

      .admin-menu-item {
        &.active-item {
          background: rgba(255, 255, 255, 0.06);
        }
      }
    }

    // Mobile bottom menu dark mode
    &.mobile-bottom-menu {
      background: rgba(15, 17, 23, 0.98) !important;
      border-top-color: rgba(255, 255, 255, 0.06) !important;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3) !important;

      .menu-item-wrapper {
        &:hover {
          background: rgba(255, 255, 255, 0.06) !important;
        }

        .admin-menu-item {
          .menu-title {
            color: #94a3b8 !important;
          }

          &.active-item {
            background: rgba(255, 255, 255, 0.08) !important;

            .menu-title {
              color: #ffffff !important;
            }

            .menu-icon {
              color: #ffffff !important;
            }
          }
        }
      }

      .children-menu {
        background: rgba(15, 17, 23, 0.98) !important;
        border-color: rgba(255, 255, 255, 0.06) !important;
      }
    }
  }
}
</style>
