import { InventoryMovement } from '@/model/inventory-movement/inventory-movement.model';

export interface InventoryMovementUi extends InventoryMovement {
  reviewed: boolean;
  unidades: number;
}
