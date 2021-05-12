import { EnterpriseDTO } from './enterprise.dto';

export class Enterprise extends EnterpriseDTO {
  constructor(dto: EnterpriseDTO) {
    super();
    Object.assign(this, dto);
  }
}
