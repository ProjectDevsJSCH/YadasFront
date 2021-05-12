import { capitalize } from 'lodash';

/* HTTP Config */
import HttpConfig from '@/config/http-common';
import GlobalMessaging from '@/instance/global-messaging';

import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';

/* Tailwind */
import './assets/styles/index.css';
import { useLoader } from './instance/global-loader';
import { humanDateFormat, noData } from './filters';
import { moneyFormatter } from './utils/number-formatters/number-formatter';
import money from 'v-money';

Vue.config.productionTip = false;
Vue.prototype.$http = HttpConfig;
Vue.prototype.$report = GlobalMessaging;
Vue.prototype.$useLoader = useLoader;

/* Filters */
Vue.filter('humanDateFormat', humanDateFormat);
Vue.filter('capitalize', capitalize);
Vue.filter('noData', noData);
Vue.filter('toMoney', moneyFormatter);

/* Components */
Vue.use(money, { precision: 2 });

if (process.env.VUE_APP_BYPASS_HTTPS) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
