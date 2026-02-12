<template>
  <div class="ps-2 user-menus">
    <div v-for="(item, i) in items" :key="i">
      <div class="d-flex h-space-between v-center cursor-pointer">
        <r-card class="user-menu-item title-3 d-flex v-center flex-grow-1"
                :to="item.to"
                @click.prevent=" open === item.id ? (open = null) : (open = item.id) "
                flat>
          <r-img v-if="item.icon.length>0"
                 class="me-1"
                 :src="item.icon[0]" is-svg width="24" height="24" alt="icon"></r-img>
          {{ item.title }}
        </r-card>
        <r-icon v-if="item.children.length>0" class="me-1 cursor-pointer"
                v-html="open === item.id? $r.icons.minus : $r.icons.plus"
                @click.prevent.stop=" open === item.id ? (open = null) : (open = item.id) "></r-icon>
      </div>
      <user-menus v-if="item.children" :class="{ 'user-menus-hide': open !== item.id}"
                   :items="item.children"
                   class="ms-1"></user-menus>
    </div>
  </div>

</template>
<script>
export default {
  name: 'user-menus',
  props: {
    items: Array
  },
  data() {
    return {
      open: null
    }
  }

}
</script>
<style lang="scss">
.user-menus {
  transition: 0.3s all ease;
  min-width: 200px;
  max-height: 100vh;
  overflow: auto;


  .user-menu-item {
    padding: 4px;
  }

  .router-link-exact-active {
    background-color: var(--color-one) !important;
    color: var(--color-on-one) !important;
    border-radius: 20px 0 0 20px;
    padding: 4px 4px 4px 8px !important;

    path {
      stroke: var(--color-on-one) !important;
    }
  }

  .user-menus-hide {
    max-height: 0;
    overflow: hidden;
  }
}
</style>
