import { RoleDTO } from './role.dto';

export class Role extends RoleDTO {
  constructor(dto: RoleDTO) {
    super();
    Object.assign(this, dto);
  }
}
