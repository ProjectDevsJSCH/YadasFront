import { Role } from '../role/role.model';

export interface Route {
  id: number;
  route: string;
  path: string;
  enterprise?: Array<{ id: number; enterprise: string; }>;
  roles?: Array<Role>;
  rolesEnterprise?: Array<{
    id: number;
    roleId: number;
    enterpriseId: number;
  }>;
}

export class RouteDTO implements Route {
  id = -1;
  route = '';
  path = '';
  enterprise: Array<{ id: number; enterprise: string; }> = [];
  roles: Array<Role> = [];
  rolesEnterprise = [];
}
