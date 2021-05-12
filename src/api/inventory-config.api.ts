import axiosInstance from '@/config/http-common';
import { InventoryConfigTables } from '@/model/inventory-config/inventory-config.dto';

import { InventoryConfig } from '@/model/inventory-config/inventory-config.model';

export abstract class InventoryConfigApi {
  static async getConfig(): Promise<InventoryConfig> {
    const { data }: { data: InventoryConfig; } = await axiosInstance.get('/inventory-config/config');

    return new InventoryConfig(data);
  }

  static async saveConfig(config: InventoryConfigTables) {
    await axiosInstance.put(`/inventory-config/${config.id}`, config);
  }
}
