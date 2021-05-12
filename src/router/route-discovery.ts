import { AxiosInstance } from 'axios';
import { RouteConfig } from 'vue-router';

interface BaseRoute {
  route: string;
  path: string;
  alias: string;
  enterprise?: Array<{ id: number; }>;
}

function buildPaths(routeConfig: RouteConfig[], base = '', baseRoutes: BaseRoute[] = []) {
  routeConfig.forEach((route) => {
    if (!route.children) {
      baseRoutes.push({
        route: route.name ?? '',
        path: `${base}${route.path}`,
        alias: route?.meta?.alias ?? '',
      });

      return;
    }

    buildPaths(route.children, route.path, baseRoutes);
  });

  return baseRoutes;
}

export async function registerPaths(axios: AxiosInstance, routeConfig: RouteConfig[]) {
  const discoverableRoutes = buildPaths(routeConfig.filter((route) => !route?.meta?.omitDiscovery));

  try {
    discoverableRoutes.forEach((route) => { route.enterprise = [{ id: 1 }, { id: 2 }]; });
    await axios.post('/routes/bulk', {
      bulk: discoverableRoutes,
    });
  } catch (error) {
    console.error('Route update failed', error);
  }
}
