import axios from '@/config/http-common';

import { RoleDTO } from '@/model/role/role.dto';
import { Role } from '@/model/role/role.model';

export abstract class RolesApi {
  static async getAll() {
    const { data }: { data: RoleDTO[]; } = await axios.get('/roles');

    return data.map((role) => new Role(role));
  }

  static async getRoleEnterprise(roleId: number, enterpriseId: number) {
    const params = `roles-enterprise?join=enterprise&join=role&filter=roleId||$eq||${roleId}&filter=enterpriseId||$eq||${enterpriseId}`;

    const { data }: {
      data: {
        id: number;
        [key: string]: any;
      }[];
    } = await axios.get(`/roles-enterprise?${params}`);

    return data[0].id;
  }
}
