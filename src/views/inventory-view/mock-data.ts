const BASE_ROW = {
  referencia: 'ABC-123',
  descripcion: 'PISTON MAZDA',
  ultimoMovimiento: Date.now(),
  inventarioActual: 12,
  unidadesEntrantes: 10,
  unidadesSalientes: 10,
  precio: 10000,
};

export class InventoryViewMock {
  static readonly INVENTORY_DATA = [
    { ...BASE_ROW, descripcion: 'TEST' },
    ...Array(30).fill(BASE_ROW),
  ];
}
