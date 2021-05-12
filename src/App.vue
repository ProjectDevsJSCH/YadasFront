<template data-app>
  <v-app :class="{ bg: useCustomBg }">
    <router-view />
    <!-- Messaging controller -->
    <messaging />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';
import Messaging from '@/components/global/Messaging.vue';

@Component({
  components: {
    Messaging,
  },
})
export default class App extends Vue {
  public useCustomBg = false;

  @Watch('$route', {
    immediate: true,
  })
  watchRoute(route: Route) {
    this.useCustomBg = route.name === 'AuthLogin';
  }
}
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}

html,
body {
  padding: 0;
  margin: 0;
  font-family: "Lato", sans-serif;
  width: 100%;
  height: 100%;
  overflow: hidden !important;
}

/* Background */

.bg {
  min-width: 100vw;
  min-height: 100vh;

  --upperColor: 205 0% 91%;
  --bottomColor: 207 34% 82%;

  background-image: radial-gradient(
      circle at top right,
      hsl(var(--upperColor)),
      hsl(var(--upperColor) / 0%)
    ),
    radial-gradient(
      circle at bottom left,
      hsl(var(--bottomColor)),
      hsl(var(--bottomColor) / 0%)
    ) !important;
}
</style>
