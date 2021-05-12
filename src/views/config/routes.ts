import { RouteConfig } from 'vue-router';

export default {
  path: 'configuracion',
  name: 'InventoryConfig',
  meta: {
    alias: 'Configuración',
  },
  component: () => import('@/views/config/Config.vue'),
} as RouteConfig;
