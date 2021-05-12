import { TableMapper } from '@/mappers/table-mappers.mapper';
import { InventoryMovementUi } from '@/views/inventory-view/inventory-movement-ui.interface';
import { InventoryMovementDTO } from './inventory-movement.dto';

export class InventoryMovement extends InventoryMovementDTO {
  constructor(inventoryMovement: InventoryMovementDTO) {
    super();
    Object.assign(this, inventoryMovement);
  }

  static toVuetifyTable(items: InventoryMovement[]) {
    /* Aditional data */
    const itemsMap = items.map((item) => ({
      reviewed: false,
      unidades: 0,
      ...item,
    }));

    const table = TableMapper.toVuetifyTable<InventoryMovementUi>('Movimientos', itemsMap);
    const headerNameMapping: Record<string, string> = {
      reviewed: 'Visto',
      unidades: 'UNDS',
      id: 'ID',
      referencia: 'Referencia',
      descripcion: 'Descripción',
      ultimoMovimiento: 'Último movimiento',
      unidadesEntrantes: 'Unidades entrantes',
      unidadesSalientes: 'Unidades salientes',
      precio: 'Precio',
      inventario: 'Inventario actual',
    };

    table.headers.forEach((header) => {
      header.text = headerNameMapping[header.value];
    });

    return table;
  }
}
