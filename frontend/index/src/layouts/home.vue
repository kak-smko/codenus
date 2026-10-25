<template>
  <div class="template-home">
    <header class="home-header">
      <div class="home-header__inner">
        <router-link
          class="home-brand"
          :to="{ name: 'base' }"
          aria-label="Home"
        >
          <r-img src="/api/storage/img/logo.png" :width="180" :height="60" alt="logo" />
        </router-link>
        <nav v-if="baseMenu.length" class="home-nav" aria-label="Main navigation">
          <router-link
            v-for="item in baseMenu"
            :key="item.id || item.title"
            class="home-nav__link"
            :to="item.to"
          >
            {{ item.title }}
          </router-link>
        </nav>
      </div>
    </header>
    <main id="main-content" class="home-main" tabindex="-1">
      <r-content>
        <router-view v-slot="{ Component }">
          <transition name="slide-end" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </r-content>
    </main>
    <home-footer></home-footer>
  </div>
</template>

<script>
import HomeFooter from "../components/homeFooter.vue";

export default {
  components: { HomeFooter },
  data() {
    return {
      baseMenu: [],
    };
  },
  created() {
    this.$axios.get("/api/home/menu/home/" + this.$r.lang).then(({ data }) => {
      this.baseMenu = data;
    });
  },
};
</script>

<style lang="scss">
.template-home {
  display: flex;
  min-height: 100vh;
  min-height: 100svh;
  flex-direction: column;
}

.home-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid color-mix(in srgb, var(--color-on-sheet) 12%, transparent);
  background: color-mix(in srgb, var(--color-sheet) 94%, transparent);
  backdrop-filter: blur(12px);
}

.home-header__inner {
  display: flex;
  width: min(100% - 2rem, 1440px);
  min-height: 4.5rem;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-inline: auto;
}

.home-brand {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  border-radius: 0.5rem;

  img {
    display: block;
    width: auto;
    max-width: 9rem;
    height: 2.75rem;
    object-fit: contain;
  }

  &:focus-visible {
    outline: 2px solid var(--color-one);
    outline-offset: 4px;
  }
}

.home-nav {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.375rem;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.home-nav__link {
  flex: 0 0 auto;
  padding: 0.625rem 0.875rem;
  border-radius: 999px;
  color: var(--color-on-sheet);
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover,
  &:focus-visible,
  &.router-link-active {
    background: color-mix(in srgb, var(--color-one) 12%, transparent);
    color: var(--color-one);
  }

  &:focus-visible {
    outline: 2px solid var(--color-one);
    outline-offset: 2px;
  }
}

.home-main {
  flex: 1 0 auto;
  outline: none;
}

.r-content {
  min-height: 80vh;
}

.home-skip-link {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  padding: 0.75rem 1rem;
  transform: translateY(-200%);
  border-radius: 0.5rem;
  background: var(--color-sheet);
  color: var(--color-on-sheet);
  box-shadow: 0 2px 12px rgb(0 0 0 / 18%);
  transition: transform 0.2s ease;

  &:focus {
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .home-header__inner {
    width: calc(100% - 1rem);
    min-height: 4rem;
    gap: 0.5rem;
  }

  .home-brand img {
    max-width: 6rem;
    height: 2.25rem;
  }

  .home-nav__link {
    padding: 0.5rem 0.625rem;
    font-size: 0.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-skip-link,
  .home-nav__link {
    transition: none;
  }
}
</style>
