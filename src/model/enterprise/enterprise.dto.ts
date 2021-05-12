export interface Enterprise {
  id: number;
  enterprise: string;
}

export class EnterpriseDTO implements Enterprise {
  id = -1;
  enterprise = '';
}
