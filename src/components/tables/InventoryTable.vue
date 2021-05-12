<template>
  <div :id="tableId" class="scroll-helper">
    <div class="flex">
      <div class="inline-flex items-center px-4 py-2 my-4 font-bold rounded-full shadow white">
        <span>{{ title }}</span>
      </div>
      <v-spacer />
      <v-text-field
        class="px-4 py-2 my-4 rounded-full shadow white"
        v-model="search"
        append-icon="mdi-magnify"
        label="Buscar"
        single-line
        hide-details
      />
    </div>
    <v-data-table
      :search="search"
      v-on="$listeners"
      v-bind="$attrs"
      :headers="filteredHeaders"
      :expanded.sync="expandedTable"
      item-key="IdInventario"
      :show-expand="includePromoData"
      class="shadow-lg"
    >
      <!-- VISUAL MODIFICATIONS TO VALUES -->
      <!-- Set stock warning -->
      <template v-slot:item.Existencia="{ item }">
        <div class="flex justify-between w-100" style="max-width: 140px">
          <template v-if="item.Existencia > 0">
            <span>{{ item.Existencia }}</span>
          </template>

          <v-chip
            v-else-if="title === 'BIELETAS' && item.Marca === 'JGK'"
            color="green" dark
          >
            Disponible
          </v-chip>
          <v-chip
            v-else
            color="red" dark
          >
            Agotado
          </v-chip>
        </div>
      </template>
      <!-- Promotions -->
      <template v-slot:item.CantidadPrecios="{ item }">
        <template v-if="item.CantidadPrecios <= 0"> - </template>
        <v-chip
          v-else
          color="yellow darken-3" dark
        >
          Promoción
        </v-chip>
      </template>
      <!-- Price -->
      <template v-slot:item.Precio="{ item }">
        {{ item.Precio | toMoney }}
      </template>

      <!-- Set filter helpers -->
      <template
        v-if="includePromoData"
        v-slot:body.append
      >
        <tr>
          <td
            class="w-full"
            colspan="100%"
          >
            <v-select
              class="my-8"
              style="max-height: 50px"
              v-model="selectedBrands"
              :items="brandList"
              label="Lista de marcas"
              multiple
              hint="Marcas"
              persistent-hint
              chips
            />
          </td>
          <td />
        </tr>

        <tr>
          <td>
            <v-switch
              v-model="showOnlyPromos"
              label="Mostrar solo promociones"
              color="yellow darken-3"
            />
          </td>
        </tr>
      </template>

      <!-- Expandable data -->
      <!-- PROMOS -->
      <template
        v-if="includePromoData"
        v-slot:expanded-item="{ headers, item }"
      >
        <td
          :colspan="headers.length"
        >
          <v-progress-linear
            indeterminate
            color="blue"
            v-if="!promosByProduct[item.IdInventario]"
          />
          <div
            v-else
            class="flex flex-wrap items-start justify-center py-8"
          >
            <!-- Before price -->
            <div class="p-4 mb-4 mr-8 border border-gray-400 rounded-md shadow-md sm:mb-0">
              <div>Antes</div>
              <span class="text-2xl">&nbsp;{{ item.Precio | toMoney }}</span>
            </div>
            <!-- Comparison prices -->
            <div>
              <div
                class="px-4 mb-3 text-base sm:text-lg"
                v-for="(promo, idx) in promosByProduct[item.IdInventario]"
                :key="idx"
              >
                <span
                  class="px-2 py-1 font-bold text-white rounded-md yellow darken-3"
                >${{ promo.Precio | toMoney }}</span>
                <span>
                  &nbsp;por compra de
                </span>
                <span
                  class="inline-block w-12 px-1 text-center text-white rounded-md yellow darken-2"
                >
                  {{ promo.RangoIni }}
                </span>
                <span>&nbsp;{{ promo.RangoIni === 1 ? 'unidad' : 'unidades' }}&nbsp;en adelante</span>
                <span class="inline-block px-2 mx-2 text-center text-white rounded-md red">
                  -{{ promo.Dcto }}% <b>aplicado</b>
                </span>
              </div>
            </div>
          </div>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { InventoryApi } from '@/api';
import { InventoryItems } from '@/model';
import {
  Vue, Component, Prop, Watch,
} from 'vue-property-decorator';
import { DataTableHeader } from 'vuetify';

import { moneyFormatter } from '@/utils/number-formatters/number-formatter';
import { getTokenData } from '@/model/user/get-token-data';
import { Enterprise } from '@/model/enterprise/enterprise.enum';

@Component({
  name: 'inventory-table',
  inheritAttrs: false,
  filters: {
    toMoney: moneyFormatter,
  },
})
export default class InventoryTable extends Vue {
  @Prop({
    type: String,
    default: '',
  })
  public title!: string;
  public search = '';

  public showOnlyPromos = false;
  public selectedBrands: Array<string> = [];
  public expandedTable = [];
  public promosByProduct: Record<string, any> = {};
  public includePromoData = false;

  get brandList() {
    const uniqueBrands = new Set();

    ((this.$attrs as any).items as InventoryItems[])
      .forEach((item) => uniqueBrands.add(item.Marca));

    return [...uniqueBrands] as string[];
  }

  get filteredHeaders() {
    return ((this.$attrs as any).headers as Array<DataTableHeader>)
      .map((headerValues) => {
        switch (headerValues.text) {
          case 'Marca':
            return {
              ...headerValues,
              filter: (value: string) => this.selectedBrands.includes(value),
            };

          case 'Promociones':
            return {
              ...headerValues,
              filter: (value: string) => (this.showOnlyPromos ? parseInt(value, 10) >= 1 : true),
            };
          default:
            return headerValues;
        }
      });
  }

  get tableId() {
    return this.title.replace(/\s/g, '');
  }

  @Watch('expandedTable', { deep: true })
  async fetchPromosByProduct(newValue: Array<InventoryItems>) {
    /* Check if promos is not  */
    let getProductId;

    // eslint-disable-next-line no-restricted-syntax
    for (const product of newValue) {
      if (!(product.IdInventario in this.promosByProduct)) {
        getProductId = product.IdInventario;
        break;
      }
    }

    if (!getProductId) return;

    this.$set(
      this.promosByProduct,
      getProductId,
      await InventoryApi.getPromosByProduct(getProductId),
    );
  }

  @Watch('$attrs')
  onAttrChange() {
    this.selectedBrands = this.brandList;
  }

  listeners() {
    return {
      ...this.$listeners,
    };
  }

  mounted() {
    const token = getTokenData();

    this.selectedBrands = this.brandList;
    this.includePromoData = token.enterprise! === Enterprise.YADAS;
  }
}
</script>

<style lang="scss" scoped>

.scroll-helper {
  scroll-margin-top: 20px;
}

.v-data-table__expanded .v-data-table__expanded__content {
  box-shadow: none !important;
}

.v-text-field--box .v-input__slot, .v-text-field--outline .v-input__slot{
  min-height:56px;
}

@media (max-width: 630px) {
  .brand-list-filter {
    display: none;

    & ~ td {
      column-span: 0;
    }
  }
}
</style>
