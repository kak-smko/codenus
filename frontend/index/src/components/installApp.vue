<template>
  <r-btn
    v-if="$r.store.deferredPrompt"
    class="color-info"
    block
    :disabled="prompting"
    @click="add"
  >
    {{ $t("install_app") }}
  </r-btn>
</template>

<script>
export default {
  name: "installApp",
  data() {
    return {
      prompting: false
    };
  },
  methods: {
    async add() {
      const deferredPrompt = this.$r.store.deferredPrompt;
      if (!deferredPrompt || this.prompting) return;

      this.prompting = true;
      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } catch (error) {
        console.error("Unable to show the app install prompt", error);
      } finally {
        this.$r.store.deferredPrompt = null;
        this.prompting = false;
      }
    },
  },
};
</script>
