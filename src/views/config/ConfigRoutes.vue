<template>
  <div>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">
              Ruta
            </th>
            <th class="text-left">
              Path
            </th>
            <th class="text-left">
              Permisos
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="route in routes"
            :key="route.id"
          >
            <td>{{ route.alias }}</td>
            <td><code>{{ route.path }}</code></td>
            <td>
              <v-checkbox
                v-for="role in roles"
                :key="role.id"
                v-model="route.roles"
                @change="updateRoute($event, route.id)"
                :label="role.alias"
                :value="role.id"
              />
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import { RolesApi, RoutesApi } from '@/api';
import { MessageTypes } from '@/instance/global-messaging';
import { RoleDTO } from '@/model/role/role.dto';
import { Role } from '@/model/role/role.model';
import { getTokenData } from '@/model/user/get-token-data';

@Component({})
export default class ConfigRoutes extends Vue {
  public routes: any[] = [];
  public roles: Role[] = [];

  async beforeMount() {
    await this.$useLoader(this.initializeData());
  }

  private async initializeData() {
    const params = 'join=rolesEnterprise';

    this.routes = (await RoutesApi.getAllRoutes(params))
      .map((route) => ({
        ...route,
        roles: route.rolesEnterprise.map((role: RoleDTO) => role.roleId),
      }));

    this.roles = await RolesApi.getAll();
  }

  async updateRoute(rolesId: number[], routeId: number) {
    const token = getTokenData();

    if (!token || !token.enterpriseId || !token.rolId) return;

    try {
      const relations = await Promise
        .all(rolesId.map((roleId) => RolesApi.getRoleEnterprise(roleId, token.enterpriseId!)));

      await this.$useLoader(RoutesApi.patchRoute(routeId, {
        rolesEnterprise: relations.map((id) => ({ id })),
      }));

      this.$report({
        title: 'Permisos actualizados',
        message: 'Los permisos de las rutas han sido correctamente actualizados',
        type: MessageTypes.SUCCESS,
      });
    } catch (error) {
      this.$report({
        title: 'Error en la actualización de permisos',
        message: error,
        type: MessageTypes.ERROR,
      });
    }
  }
}
</script>
