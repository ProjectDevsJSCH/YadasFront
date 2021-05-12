import { InventoryConfigDTO } from './inventory-config.dto';

export class InventoryConfig extends InventoryConfigDTO {
  constructor(dto: InventoryConfigDTO) {
    super();
    Object.assign(this, dto);
  }
}
