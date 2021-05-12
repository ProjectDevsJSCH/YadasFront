import { RouteConfig } from 'vue-router';

export default [
  {
    path: '/login',
    name: 'AuthLogin',
    meta: {
      omitDiscovery: true,
    },
    component: () => import('@/views/auth/Login.vue'),
  },
  {
    path: '/password-set',
    name: 'PasswordSetup',
    meta: {
      omitDiscovery: true,
    },
    component: () => import('@/views/auth/PasswordSetup.vue'),
  },
] as RouteConfig[];
