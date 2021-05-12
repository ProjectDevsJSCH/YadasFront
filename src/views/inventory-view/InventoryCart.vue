<template>
  <v-menu
    offset-y
    transition="slide-y-transition"
    bottom
    right
    z-index="100"
    min-width="400px"
    :close-on-content-click="false"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        icon
        class="relative"
        v-bind="attrs"
        v-on="on"
      >
        <v-badge
          :content="cartLength"
          :value="cartLength"
          color="red"
          overlap
        >
          <v-icon large>
            mdi-cart-outline
          </v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card max-height="70vh" class="bg-white">
      <div class="max-w-xl pb-2 bg-white">
        <v-card-text>
          <div class="ml-2 text-lg font-weight-bold">
            Pedidos
          </div>
        </v-card-text>

        <v-divider />

        <div
          v-if="cartLength === 0 "
          class="text-center"
        >
          <v-chip
            class="ma-2"
          >
            No hay items en el carrito
          </v-chip>
        </div>

        <div
          v-for="(item, index) in cartItemsUi"
          :key="item.id"
          class="relative bg-white border border-gray-400 rounded ma-2"
          elevation="1"
        >
          <v-btn
            class="absolute cs-btn-close"
            x-small
            icon
            color="red"
            @click="removeCartItem(index)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>

          <v-card-title>
            {{ item.referencia }}
          </v-card-title>

          <v-card-subtitle>
            <div class="flex justify-between">
              <span>
                {{ item.description }}
              </span>
              <v-btn
                class="ma-2"
                outlined
                small
                color="indigo"
              >
                {{ item.amount }}
              </v-btn>
            </div>
          </v-card-subtitle>

          <v-card-actions>
            <v-btn
              color="blue"
              text
            >
              Precios
            </v-btn>

            <v-spacer />

            <v-btn
              icon
              @click="item.showCurrencies = !item.showCurrencies"
            >
              <v-icon>{{ item.showCurrencies ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <InventoryCartCurrency
              v-show="item.showCurrencies"
              v-model="item.baseValue"
            />
          </v-expand-transition>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { mapGetters, mapMutations, mapState } from 'vuex';

import { InventoryCartItem } from '@/components/tables/inventory-cart.interface';
import { CurrencyConstants } from '@/views/cart/Currencies.constants';
import InventoryCartCurrency from '@/views/inventory-view/InventoryCartCurrency.vue';

interface CartItemsUi extends InventoryCartItem {
  showCurrencies?: boolean;
  baseValue?: number;
}

@Component({
  components: {
    InventoryCartCurrency,
  },
  computed: {
    ...mapState('cart', [
      'cartItems',
    ]),
    ...mapGetters('cart', [
      'cartLength',
    ]),
  },
  methods: {
    ...mapMutations('cart', {
      removeCartItem: 'removeItem',
    }),
  },
  filters: {
    trimFloat(value: number) {
      return value.toFixed(2);
    },
  },
})
export default class InventoryCart extends Vue {
  public cartLength!: number;
  public cartItems!: InventoryCartItem[];
  public cartItemsUi: CartItemsUi[] = [];

  public currencies: Record<string, number> = {
    ...this.$store.state.currency,
  }

  public imagePath = '../../assets/currency_flags/'
  public currencyImage = CurrencyConstants.CURRENCIES_IMAGES;
  private removeCartItem!: (index: number) => void;
  public currenciesLocal: Record<string, number> = {};

  constructor() {
    super();
  }

  async beforeMount() {
    await this.$store.dispatch('currency/fetchCurrencies');
  }

  @Watch('cartItems', { immediate: true })
  onCartItemsChange() {
    this.cartItemsUi = this.cartItems.map((item) => ({
      ...item,
      showCurrencies: false,
      baseValue: 0,
    }));
  }
}
</script>

<style lang="scss" scoped>

$btn-distance: 4px;

.cs-btn-close {
  top: $btn-distance;
  right: 20px;
  transform: translate(-50, -50%);
}

</style>
