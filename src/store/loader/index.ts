export default {
  namespaced: true,

  state: () => ({
    isLoading: false,
  }),

  mutations: {
    setLoading(state: any, payload: any) {
      state.isLoading = payload;
    },
  },
};
