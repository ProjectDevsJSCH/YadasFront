export interface InventoryItems {
  IdInventario: number;
  Referencia: string;
  'Descripción': string;
  Precio: number;
  Marca: string;
  Existencia: number;
  CantidadPrecios: number;
  UnipartesExistencia?: number | null;
}

export interface InventoryGroup {
  group: string;
  items: Array<InventoryItems>;
}

export class InventoryDTO implements InventoryGroup {
  group = '';
  items: Array<InventoryItems> = [];
}
