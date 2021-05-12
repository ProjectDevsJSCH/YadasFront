<template>
  <div>
    <v-card
      elevation="2"
    />
  </div>
</template>

<script lang="ts">
import { getTokenData } from '@/model/user/get-token-data';
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class Account extends Vue {
  beforeMount() {
    const token = getTokenData();

    if (!token) return;
  }
}
</script>
