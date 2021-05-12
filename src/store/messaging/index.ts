const module = {
  namespaced: true,

  state: () => ({
    type: '',
    title: '',
    message: '',
    time: null,
  }),

  mutations: {
    setGlobalMessage(state: any, payload: any) {
      Object.assign(state, payload);
    },
  },
};

export default module;
