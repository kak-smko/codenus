<template>
  <footer class="home-footer mt-5">
    <r-container>
      <r-row>
        <r-col class="col-6 md-4"> </r-col>
        <r-col class="col-6 md-4">
          <div class="display-5 mb-3 font-weight-bold">{{ $t("pages") }}</div>
        </r-col>
        <r-col class="col-12 md-4">
          <span class="display-5 font-weight-bold">{{ $t("be_with_us") }}</span>
          <div>
            <r-btn
              v-for="(item, i) in social_media"
              :key="i"
              icon
              outlined
              class="ma-2 br-lg btn-icon"
              v-title="i"
              :href="item"
              target="_blank"
            >
              <r-img
                :src="`/api/storage/logos/${i}.svg`"
                :alt="i"
                width="25"
                height="25"
                is-svg
              />
            </r-btn>
          </div>
          <install-app class="mt-5"></install-app>
        </r-col>
      </r-row>
    </r-container>

    <div class="color-black color-white-text text-center title pa-2">
       {{ $t("footer_copyright_msg") }}
    </div>
  </footer>
</template>

<script>
import InstallApp from "./installApp.vue";
export default {
  name: "homeFooter",
  components: { InstallApp },
  data() {
    return {
      social_media: {},
    };
  },
  methods: {
    go(hash) {
      if (this.$route.name !== hash.to.name) {
        this.$router.push(hash.to);
        setTimeout(() => {
          const el = document.getElementById(hash.id);
          if (el !== null) {
            el.scrollIntoView();
          }
        }, 1000);
      } else {
        setTimeout(() => {
          const el = document.getElementById(hash.id);
          if (el !== null) {
            el.scrollIntoView();
          }
        }, 100);
      }
    }
  },
};
</script>

<style lang="scss">

.home-footer {
  border-top: 1px solid var(--color-on-sheet);

  .btm-line {
    width: 150px;
    height: 4px;
  }
  .btn-icon {
    opacity: 0.5;
    &:hover {
      background-color: var(--color-one);
      color: var(--color-on-one);
      opacity: 1;
    }
  }
}
</style>
