<template>
  <div>
    <div
      v-for="(currency, name) in models"
      :key="name"
      class="flex items-center mx-2 my-1 border border-gray-400 rounded-sm pa-2"
    >
      <img
        class="w-6 h-6 mr-2"
        :src="require('@/assets/currency_flags/' + currencyImage[name])"
      >
      <span><b>{{ name }}:</b> <money @input="setInput($event, name)" v-model="models[name]" v-bind="money" /></span>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Vue, Component, Prop,
} from 'vue-property-decorator';
import { mapState } from 'vuex';
import { CurrencyConstants } from '../cart/Currencies.constants';

@Component({
  model: {
    prop: 'baseValue',
    event: 'change',
  },
  computed: {
    ...mapState('cart', [
      'cartItems',
    ]),
  },
  watch: {
    'models.COP': {
      immediate: true,
      handler(value: number) {
        this.$emit('change', value);
      },
    },
  },
})
export default class InventoryCartCurrency extends Vue {
  @Prop()
  public baseValue!: number; // COP

  public money = {
    decimal: ',',
    thousands: '.',
    prefix: '',
    suffix: ' ',
    precision: 2,
    masked: false,
  }

  public models: Record<string, any> = {};
  public currencies: Record<string, number> = {
    ...this.$store.state.currency,
  }
  public currencyImage = CurrencyConstants.CURRENCIES_IMAGES;

  beforeMount() {
    this.$nextTick(() => {
      this.buildStructure();
    });
  }

  private buildStructure() {
    this.models = {};

    CurrencyConstants.CURRENCIES_LIST.forEach((currency) => {
      this.$set(this.models, currency, 0);
    });
  }

  setInput(value: number, localCurrency: string) {
    const baseValue = value / this.currencies[localCurrency];

    CurrencyConstants.CURRENCIES_LIST.forEach((currency) => {
      if (currency === localCurrency) return;

      this.$set(this.models, currency, baseValue * this.currencies[currency]);
    });
  }
}
</script>
