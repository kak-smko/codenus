<template>
  <r-app>
    <div
      v-if="!lang_added"
      class="d-flex h-center v-center color-one h-full"
    >
      <r-progress-circle size="100" indeterminate width="5"></r-progress-circle>
    </div>
    <router-view v-else />
    <pwa-badge></pwa-badge>
  </r-app>
</template>
<script>
import { App } from "./mixins/app.js";
import PwaBadge from "@/components/pwaBadge.vue"



export default {
  components: {PwaBadge},
  mixins: [App],
  created() {
    this.setDefault();
    this.getDefault();
    this.userInfo();
    window.addEventListener("beforeinstallprompt", e => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      console.log("beforeinstallprompt");
      e.preventDefault();
      this.$r.store.deferredPrompt = e;
    });
  }
};
</script>
