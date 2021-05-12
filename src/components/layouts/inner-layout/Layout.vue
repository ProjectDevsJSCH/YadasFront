<template>
  <div class="h-screen parent">
    <!-- Topbar -->
    <topbar
      @navbar-click="miniBar = !miniBar"
      class="z-10 topbar"
    />
    <!-- Navigation -->
    <div class="lateral-bar">
      <navigation-bar
        class="menu-bar"
        :miniVariant="miniBar && !isMobile"
      />
    </div>
    <!-- Content -->
    <div class="relative overflow-y-auto content blue-grey lighten-5">
      <transition name="fade">
        <div
          v-if="isLoading"
          class="fixed flex items-center justify-center w-full h-full bg-gray-600 bg-opacity-25 loader"
        >
          <v-progress-circular
            :size="50"
            color="primary"
            :indeterminate="isLoading"
          />
        </div>
      </transition>

      <router-view :key="$route.name" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import Topbar from './Topbar.vue';
import NavigationBar from './NavigationBar.vue';
import { mapState } from 'vuex';

@Component({
  components: {
    Topbar,
    NavigationBar,
  },
  computed: {
    ...mapState('loader', [
      'isLoading',
    ]),
  },
})
export default class Layout extends Vue {
  public miniBar = true;
  public isLoading!: boolean;
  public isMobile = false;

  private mobileMediaQuery!: MediaQueryList;
  private mediaQueryListener!: (event: MediaQueryListEvent) => void;

  mounted() {
    this.mobileMediaQuery = matchMedia('(max-width: 630px)');

    this.isMobile = this.mobileMediaQuery.matches;
    this.mediaQueryListener = (event: MediaQueryListEvent) => {
      this.isMobile = event.matches;
      console.log(this.isMobile);
    };
  }

  destroyed() {
    this.mobileMediaQuery.removeListener(this.mediaQueryListener);
  }
}
</script>

<style lang="scss" scoped>
@import '@/animations/fade-animation.scss';

.parent {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  grid-template-areas: "topbar topbar"
                        "lateral content";
}

.loader {
  z-index: 250;
}

.topbar {
  grid-area: topbar;
}

.lateral-bar {
  grid-area: lateral;
}

.content {
  grid-area: content;
}

@media (max-width: 630px) {
  .parent {
    grid-template-areas: "topbar topbar"
                         "content content";
  }

  .lateral-bar {
    display: none;
  }
}
</style>
