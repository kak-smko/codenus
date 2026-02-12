<template>
  <div
    class="template-panel h-end"
    :class="{
      'menu-open': open,
    }"
  >
    <header
      class="toolbar d-flex v-center"
    >
      <r-btn class="btn-menu" icon text @click.prevent="open = !open">
        <r-icon v-if="!open" v-html="$r.icons.menu"></r-icon>
        <r-icon v-else v-html="$r.icons.close"></r-icon>
      </r-btn>

      <img class="me-2" :src="'/pwa/logo?t=m&w=170&h=60'"/>

      <span
        v-if="$helper.ifHas($r.store, false, 'user', 'info', 'name')"
      >{{ $t(["welcome", [$r.store.user.info.name]]) }}</span
      >
      <r-spacer></r-spacer>
    </header>
    <aside class="menu-panel">
      <div class="list pe-2 pt-2">
        <admin-menus :items="menu"></admin-menus>
        <r-btn-confirm @click="logout()" text
                       :body="$t('logout_your_account')"
                       class="text-start color-error-text pt-1 px-2 cursor-pointer d-flex v-center">
          <svg class="me-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
               fill="none">
            <path
              d="M15.102 16.442c-.31 3.6-2.16 5.07-6.21 5.07h-.13c-4.47 0-6.26-1.79-6.26-6.26v-6.52c0-4.47 1.79-6.26 6.26-6.26h.13c4.02 0 5.87 1.45 6.2 4.99M8.999 12h11.38M18.15 15.352l3.35-3.35-3.35-3.35"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"></path>
          </svg>
          {{ $t('logout') }}
        </r-btn-confirm>
      </div>
      <div class="hover-div" @click.prevent="open = false"></div>
    </aside>
    <r-content :flipped="$r.breakpoint.lgAndUp" below-header="80px">
      <router-view v-slot="{ Component }">
        <transition name="slide-start" mode="out-in">
          <component :is="Component"/>
        </transition>
      </router-view>
    </r-content>
  </div>
</template>

<script>

import AdminMenus from '@/components/menus.vue'

export default {
  components: {AdminMenus},
  data() {
    return {
      open: false,
      menu: []
    };
  },
  created() {
    this.$axios.get('home/menu/admin/' + this.$r.lang).then(({data}) => {
      this.menu = data;
    })
  },
  methods: {
    logout() {
      this.$axios.post("/user/logout")
      this.$r.store.user = {
        login: false,
        info: {}
      };
      this.$storage.remove("user_login");
      this.$router.push({path: "/"});
    },
  },
  watch: {
    $route: function () {
      this.open = false;
    },
  },

};
</script>

<style lang="scss">
@use "sass:map";
@use "renusify/style/variables/base" as var;
@use "renusify/style/mixins" as mx;
@use "renusify/style/mixins/container" as mxc;

$menu-width: 300px;
.template-panel {
  display: flex;
  flex-direction: row;
  position: relative;

  .toolbar {
    position: fixed;
    top: 0;
    width: 100%;
    height: 80px;
    z-index: map.get(var.$z-index, "medium");
    background-color: var(--color-sheet);
    border-bottom: 1px solid;
  }

  &.menu-open {
    .menu-panel {
      width: 100vw;
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.4);
    }

    .hover-div {
      width: calc(100% - #{$menu-width});
      max-width: calc(100% - #{$menu-width});
      min-height: calc(100vh - 80px);
      transition: 0.1s all ease-in-out;
      position: absolute;
      top: 0;
      z-index: 2;
      @include mx.rtl() {
        left: 0;
      }
      @include mx.ltr() {
        right: 0;
      }
    }

    .list {
      @include mx.rtl() {
        right: 0 !important;
      }
      @include mx.ltr() {
        left: 0 !important;
      }
    }
  }

  .menu-panel {
    transition: 0.3s all ease-in-out;
    height: calc(100vh - 80px);
    top: 80px;
    position: fixed;
    z-index: map.get(var.$z-index, "medium");
    opacity: 0;
    @include mx.rtl() {
      right: 0;
    }
    @include mx.ltr() {
      left: 0;
    }

    .list {
      overflow-y: auto;
      width: $menu-width;
      transition: 0.3s all ease-in-out;
      height: 100%;
      position: absolute;
      top: 0;
      background-color: var(--color-sheet);
      @include mx.rtl() {
        right: -$menu-width;
        border-left: 1px solid;
      }
      @include mx.ltr() {
        left: -$menu-width;
        border-right: 1px solid;
      }
      font-weight: bold;
    }

  }

  @include mxc.media-breakpoint-up("lg") {
    .btn-menu {
      display: none;
    }
    .menu-panel {
      width: $menu-width !important;
      background-color: transparent;
      opacity: 1;
    }

    .hover-div {
      width: 0 !important;
    }
    .list {
      @include mx.rtl() {
        right: 0 !important;
      }
      @include mx.ltr() {
        left: 0 !important;
      }
    }
  }
}
</style>
