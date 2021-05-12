import { InventoryCartItem } from '@/components/tables/inventory-cart.interface';
import { InventoryMovementUi } from '@/views/inventory-view/inventory-movement-ui.interface';

export default {
  namespaced: true,

  state: () => ({
    cartItems: [],
    lastDeletedItem: null,
  }),

  getters: {
    cartLength: (state: any) => state.cartItems.length,
  },

  mutations: {
    addItem(state: any, item: InventoryMovementUi) {
      const foundItem = (state.cartItems as InventoryCartItem[])
        .find((cart) => cart.id === item.id);

      if (foundItem) {
        foundItem.amount = item.unidades;
        return;
      }

      (state.cartItems as InventoryCartItem[]).push({
        amount: item.unidades,
        description: item.descripcion,
        id: item.id,
        referencia: item.referencia,
      });
    },
    removeItem(state: any, index: number) {
      const cart = state.cartItems as InventoryCartItem[];

      const deleted = cart.splice(index, 1);
      state.lastDeletedItem = deleted[0].id;
    },
  },
};
