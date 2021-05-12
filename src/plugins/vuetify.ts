import Vue from 'vue';
import Vuetify from 'vuetify';
// @ts-ignore
import es from 'vuetify/es5/locale/es';

Vue.use(Vuetify);

const opts = {
  lang: {
    locales: { es },
    current: 'es',
  },
};

export default new Vuetify(opts);
