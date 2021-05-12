<template>
  <v-toolbar
    elevation="1"
    class="flex-grow-0"
    :color="enterpriseColor"
    :dark="enterpriseName === 'Unipartes'"
  >
    <v-app-bar-nav-icon
      @click="$emit('navbar-click')"
    />
    <v-toolbar-title>{{ enterpriseName }}</v-toolbar-title>
    <v-spacer />

    <!-- CART -->
    <InventoryCart v-if="topbarAccess.includes('cart')" />

    <!-- NOTIFICATIONS -->
    <NotificationsResume v-if="topbarAccess.includes('notifications')" />

    <v-btn icon>
      <v-icon>mdi-dots-vertical</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import { getTokenData } from '@/model/user/get-token-data';
import { NotificationUI } from '@/model/notification/notification.model';
import InventoryCart from '@/views/inventory-view/InventoryCart.vue';
import NotificationsResume from '@/views/notifications/NotificationsResume.vue';
import { Enterprise } from '@/model/enterprise/enterprise.enum';
import { AccessControl } from '@/access-control/access-control';
import { UserRoles } from '@/model/user/user-rol.enum';

const TOBAR_FEATURES = [
  'cart',
  'notifications',
];

@Component({
  components: {
    InventoryCart,
    NotificationsResume,
  },
})
export default class TopBar extends Vue {
  public enterprise = '';
  public notifications: NotificationUI[] = [];
  public topbarAccess: string[] = []

  get enterpriseName() {
    if (this.enterprise === Enterprise.UNIPARTES) {
      return 'Unipartes';
    }

    return 'Yadas W.T. Importaciones';
  }

  get enterpriseColor() {
    if (this.enterprise === Enterprise.UNIPARTES) {
      return 'light-blue darken-4';
    }

    return '';
  }

  async beforeMount() {
    this.enterprise = getTokenData().enterprise || '';
    this.setAccessControl();
  }

  private setAccessControl() {
    const BASE_INGORE = [
      'cart',
    ];

    this.topbarAccess = AccessControl.omitFeatures<string>(
      TOBAR_FEATURES,
      {
        [UserRoles.VENDOR]: BASE_INGORE,
        [UserRoles.WAREHOUSE]: BASE_INGORE,
      },
    );
  }
}
</script>
