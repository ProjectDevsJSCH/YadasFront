import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

/* Routes */
import AuthRoutes from '@/views/auth/routes';
import ConfigRoutes from '@/views/config/routes';

/* Layouts */
import InnerLayout from '@/components/layouts/inner-layout/Layout.vue';
import authGuard from './guards';

Vue.use(VueRouter);

export const routes: Array<RouteConfig> = [
  {
    path: '',
    component: InnerLayout,
    children: [
      {
        path: '/',
        name: 'Home',
        meta: {
          alias: 'Inicio',
        },
        component: () => import('@/views/Home.vue'),
      },
      {
        path: 'notificaciones',
        name: 'Notifications',
        meta: {
          alias: 'Notificaciones',
        },
        component: () => import('@/views/notifications/Notifications.vue'),
      },
      {
        path: 'analisis-inventario',
        name: 'InventoryView',
        meta: {
          alias: 'Análisis de inventario',
        },
        component: () => import('@/views/inventory-view/InventoryView.vue'),
      },
      {
        path: 'promociones',
        name: 'Promos',
        meta: {
          content: 'promo',
          alias: 'Promociones',
        },
        component: () => import('@/views/Home.vue'),
      },
      ConfigRoutes,
      {
        path: '/gestor-de-cuentas',
        name: 'AccountManagementLogin',
        meta: {
          alias: 'Gestión de cuentas',
        },
        component: () => import('@/views/auth/AccountManagement.vue'),
      },
      {
        path: 'cuenta',
        name: 'Account',
        meta: {
          alias: 'Cuenta',
        },
        component: () => import('@/views/Account.vue'),
      },
      {
        path: 'test-route',
        name: 'test-route',
        meta: {
          omitDiscovery: true,
        },
        component: () => import('@/views/_Test.vue'),
      },
    ],
  },
  ...AuthRoutes,
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

/* Router guards */
router.beforeEach(authGuard);

export default router;
