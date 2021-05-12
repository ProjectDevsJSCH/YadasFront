<template>
  <v-navigation-drawer
    class="rounded-none"
    v-model="drawer"
    :mini-variant="miniVariant"
    permanent
  >
    <v-divider />

    <v-list
      dense
      nav
      class="py-0 pt-4"
    >
      <!-- Menu elements -->
      <v-list-item
        v-for="item in items"
        :key="item.title"
        link
        @click="item.action ? item.action() : toRoute(item.route)"
        :class="item.route === $route.name ? 'bg-gray-300' : ''"
      >
        <v-list-item-icon>
          <v-tooltip right>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
              >
                {{ item.icon }}
              </v-icon>
            </template>
            <span>{{ item.title }}</span>
          </v-tooltip>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import {
  Vue, Component, Prop,
} from 'vue-property-decorator';

import axios from '@/config/http-common';

import { Enterprise } from '@/model/enterprise/enterprise.enum';
import { getTokenData } from '@/model/user/get-token-data';
import { RoutesApi } from '@/api';

@Component({})
export default class NavigationBar extends Vue {
  @Prop({
    type: Boolean,
    default: true,
  })
  miniVariant!: boolean;

  userRole = '';

  drawer = true;

  items = [
    { title: 'Inicio', icon: 'mdi-view-dashboard', route: 'Home' },
    { title: 'Promociones', icon: 'mdi-sale', route: 'Promos' },
    { title: 'Análisis', icon: 'mdi-finance', route: 'InventoryView' },
    { title: 'Notificaciones', icon: 'mdi-bell-ring', route: 'Notifications' },
    { title: 'Configuraciones', icon: 'mdi-cog', route: 'InventoryConfig' },
    { title: 'Cuenta', icon: 'mdi-shield-account', route: 'Account' },
    { title: 'Gestión de cuentas', icon: 'mdi-account-multiple', route: 'AccountManagementLogin' },
    { title: 'Cerrar sesión', icon: 'mdi-exit-to-app', action: this.logout },
  ];

  async beforeMount() {
    const token = getTokenData();

    if (!token.rol || !token.enterprise) return;

    const { rolId, enterpriseId } = token;
    const params = `join=rolesEnterprise&filter=rolesEnterprise.roleId||$eq||${rolId}&filter=rolesEnterprise.enterpriseId||$eq||${enterpriseId}`;

    const routes = await RoutesApi.getAllRoutes(params);

    this.userRole = token.rol;
    this.items = this.items.filter((item) => {
      if (!item.route) return true;

      return routes.some((route) => route.route === item.route);
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.$report({
      title: 'Sesión finalizada',
    });
    this.$router.push({ name: 'AuthLogin' });
  }

  toRoute(route: string) {
    this.$router.push({ name: route })
      .catch((err) => {
        if (
          err.name !== 'NavigationDuplicated'
          && !err.message.includes('Avoided redundant navigation to current location')
        ) {
          console.error(err);
        }
      });
  }
}
</script>
