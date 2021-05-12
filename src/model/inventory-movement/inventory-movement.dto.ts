export interface InventoryMovement {
  id: number;

  referencia: string;

  descripcion: string;

  ultimoMovimiento: Date;

  unidadesEntrantes: number;

  unidadesSalientes: number;

  inventario: number;

  precio: number;
}

export interface InventoryMovementDaily {
  incomming: number;
  outcomming: number;
  day: number;
}

export interface InventoryMovementMonhtly {
  incomming: number;
  outcomming: number;
  month: number;
  daysMovement: InventoryMovementDaily[];
}

export interface InventoryMovementDetail {
  yearsMovement: {
    incomming: number;
    outcomming: number;
    year: number;
    monthsMovement: InventoryMovementMonhtly[];
  }[];
}

export class InventoryMovementDTO implements InventoryMovement {
  id!: number;

  referencia!: string;

  descripcion!: string;

  ultimoMovimiento!: Date;

  unidadesEntrantes!: number;

  unidadesSalientes!: number;

  inventario!: number;

  precio!: number;
}
