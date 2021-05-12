import axios from '@/config/http-common';

import {
  InventoryItems, Inventory, InventoryDTO,
} from '@/model';
import { Enterprise } from '@/model/enterprise/enterprise.enum';
import { GeneralResponse } from '@/interfaces/responses/general-response.interface';
import { InventoryMovementDetail, InventoryMovementDTO } from '@/model/inventory-movement/inventory-movement.dto';
import { InventoryMovement } from '@/model/inventory-movement/inventory-movement.model';
import { InventoryFilterDto } from '@/model/inventory/inventory-filter.dto';
import { PromosDto } from '@/model/inventory/promo.dto';
import { UnipartesStock } from '@/model/inventory/unipartes-stock.dto';
import { queryBuilder } from '@/utils/request-helpers/request-helpers';

export interface InventoryAllRequest {
  [key: string]: InventoryItems;
}

export abstract class InventoryApi {
  static async getAll(enterprise: Enterprise = Enterprise.YADAS, filterDto: InventoryFilterDto = {}): Promise<Inventory[]> {
    const { data }: { data: InventoryDTO[]; } = await axios.get(`/inventory/${enterprise}/all${queryBuilder(filterDto)}`);

    return data.map((value) => new Inventory(value));
  }

  static async getPromosByProduct(id: number) {
    const { data }: { data: PromosDto[]; } = await axios.get(`/inventory/${id}/prices`);

    return data;
  }

  static async getAllPromos() {
    const { data }: { data: { [key: number]: PromosDto[]; }; } = await axios.get('/inventory/promotions');

    return data;
  }

  static async getInventoryMovements(searchParams: Record<string, string> = {}) {
    const params = new URLSearchParams(searchParams);
    const { data }: { data: InventoryMovementDTO[]; } = await axios.get(`/inventory/inventory_view?${params}`);

    return data.map((item) => new InventoryMovement(item));
  }

  static async getInventoryMovementDetail(id: number, searchParams: Record<string, string> = {}) {
    const params = new URLSearchParams({
      idInventory: String(id),
      ...searchParams,
    });
    const { data }: { data: InventoryMovementDetail; } = await axios.get(`/inventory/inventory_detail?${params}`);

    return data;
  }

  static async getUnipartesInventory() {
    const { data }: { data: GeneralResponse<UnipartesStock> } = await axios.get('/inventory/unipartes-stock');

    return data;
  }

  static async getAllBrands() {
    const { data }: { data: string[]; } = await axios.get('/inventory/brands');

    return data;
  }

  static async getAllCategories() {
    const { data }: { data: string[]; } = await axios.get('/inventory/groups');

    return data;
  }
}
