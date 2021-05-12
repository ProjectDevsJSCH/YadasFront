import Vue from 'vue';
import Vuex from 'vuex';

/* Modules */
import GlobalMessaging from './messaging';
import Loader from './loader';
import Cart from './cart';
import currency from './currency';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    messaging: GlobalMessaging,
    loader: Loader,
    cart: Cart,
    currency,
  },
});
