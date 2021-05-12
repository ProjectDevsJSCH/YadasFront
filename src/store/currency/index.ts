import { CurrencyApi } from '@/api';

export default {
  namespaced: true,

  state: () => ({
    COP: 1,
    USD: null, // Dolar
    CNY: null, // Renminbi - China
    EUR: null, // Euro
    JPY: null, // Yen
  }),

  mutations: {
    setCurrencies(state: any, currencyData: Record<string, number>) {
      Object.assign(state, currencyData);
    },
  },

  actions: {
    async fetchCurrencies({ state, commit }: { commit: any; state: any; }) {
      if (state.USD) return;

      commit('setCurrencies', await CurrencyApi.getCurrencyConvertions());
    },
  },
};
