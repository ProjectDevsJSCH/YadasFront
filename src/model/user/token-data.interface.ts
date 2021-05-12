import { Enterprise } from '../enterprise/enterprise.enum';
import { UserRoles } from './user-rol.enum';

export interface TokenData {
  rol: UserRoles;
  enterprise: Enterprise;
  rolId: number;
  enterpriseId: number;
  email: string;
  iat: number;
  exp: number;
}
