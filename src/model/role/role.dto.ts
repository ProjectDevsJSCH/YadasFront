export interface Role {
  id: number;
  role: string;
  roleId: number;
  description?: string;
  alias?: string;
}

export class RoleDTO implements Role {
  id = -1;
  role = '';
  roleId = -1;
  description = '';
  alias = '';
}
