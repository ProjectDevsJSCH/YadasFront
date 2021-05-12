export interface InventoryConfig {
  columns: string[];
  config: InventoryConfigTables[];
}

export interface InventoryConfigTables {
  id: number;
  table: string;
  column: string;
  ascendant: boolean;
}

export class InventoryConfigDTO implements InventoryConfig {
  columns = [];
  config: InventoryConfigTables[] = [];
}
