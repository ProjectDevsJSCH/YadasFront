<template>
  <div class="px-8 pb-8 mt-4">
    <!-- Date formats -->
    <div class="flex justify-center mx-auto mb-4">
      <div class="flex max-w-4xl bg-white rounded shadow-md"
           :class="{ 'cs-date-centered': showCenteredDate }"
      >
        <div
          v-for="(dateSelector, idx) in dateSelectors"
          :key="idx"
          class="px-4 pt-4 pb-2 mx-4 max-w-42"
        >
          <v-menu
            ref="menu"
            v-model="dateSelector.menu"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="dateSelector.date"
                :label="dateSelector.label"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
                dense
              />
            </template>
            <v-date-picker
              v-model="dateSelector.date"
              type="month"
              no-title
              scrollable
              :min="minDate[idx]"
              :max="todayDate"
              :disabled="dateSelectors[0].date === null && idx !== 0"
            />
          </v-menu>
        </div>

        <!-- Brand, categories selectors -->
        <transition name="tr-fade-in-move-x">
          <div
            class="flex px-4 pt-4 pb-2 mx-2 bg-white rounded"
            v-if="!showCenteredDate"
          >
            <v-autocomplete
              :items="brands"
              label="Marca"
              class="mx-2"
              clearable
              dense
              v-model="brand"
            />
            <v-autocomplete
              :items="categories"
              label="Categoría"
              class="mx-2"
              clearable
              dense
              v-model="category"
            />

            <!-- Buttons -->
            <v-btn
              small
              color="secondary"
              dark
              class="mt-2 ml-2"
              @click="handleQueryDependencies"
            >
              Buscar
            </v-btn>
          </div>
        </transition>
      </div>
    </div>

    <!-- Search bar -->
    <!-- <transition name="tr-fade-in-move">
      <div
        v-if="!showCenteredDate"
        class="flex max-w-4xl mx-auto"
      >
        <v-text-field
          class="px-4 py-2 my-4 rounded shadow white"
          v-model="search"
          append-icon="mdi-magnify"
          label="Buscar"
          single-line
          hide-details
        />
      </div>
    </transition> -->

    <!-- FILTERS -->
    <transition name="tr-fade-in-move">
      <auto-filter
        v-if="dataLoaded"
        :filters="filters"
        :headers="inventoryTable.headers"
        :values="inventoryTable.items"
        @headersBuild="onHeadersBuild"
      />
    </transition>

    <!-- Data -->
    <transition name="tr-fade-in-move">
      <v-data-table
        v-if="isValidDate"
        :headers="headers"
        :items="inventoryTable.items"
        :items-per-page="15"
        :search="search"
        :item-class="setReviewedRowStyle"
      >
        <!-- HEADERS -->
        <template v-slot:header.ultimoMovimiento="{ header }">
          <span>{{ header.text }}</span>
        </template>

        <!-- ROWS -->
        <template v-slot:item.unidades="{ item }">
          <div class="w-12">
            <v-text-field
              v-model="item.unidades"
              type="number"
              dense
              min="0"
              class="pt-2"
              @change="onUnitChanged(item)"
            />
          </div>
        </template>

        <template v-slot:item.id="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                color="indigo"
                v-on="on"
                @click="viewDetails(item)"
              >
                <v-icon>mdi-poll</v-icon>
              </v-btn>
            </template>
            <span>ID: {{ item.id }}</span>
          </v-tooltip>
        </template>

        <template v-slot:item.reviewed="{ item }">
          <v-checkbox
            v-model="item.reviewed"
            color="primary"
            :value="true"
            hide-details
            class="ma-0"
          />
        </template>

        <template v-slot:item.ultimoMovimiento="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on">{{ item.ultimoMovimiento | humanDateFormat | capitalize }}</span>
            </template>
            <span>{{ item.ultimoMovimiento | dateFormat }}</span>
          </v-tooltip>
        </template>

        <template v-slot:item.precio="{ item }">
          {{ item.precio | toMoney }}
        </template>

        <template v-slot:item.inventario="{ item }">
          <span
            :class="{'text-red-500': item.inventario <= 0}"
          >
            {{ item.inventario }}
          </span>
        </template>
      </v-data-table>
    </transition>

    <v-dialog
      v-model="rowSelected"
      max-width="1000"
    >
      <InventoryViewDetail
        v-if="rowSelected"
        :inventoryMovement="selectedProduct"
        :dateRange="dateSelectors"
      />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { mapMutations, mapState } from 'vuex';

import moment from 'moment';

import { CurrencyApi, InventoryApi } from '@/api';
import { InventoryMovement } from '@/model/inventory-movement/inventory-movement.model';
import { VuetifyTable } from '@/utils/vuetify-table.interface';
import InventoryViewDetail from './InventoryViewDetail.vue';
import InventoryCart from './InventoryCart.vue';
import AutoFilter from '@/components/tables/AutoFilter.vue';
import { TableAutoFilter, TableAutoFilterTypes } from '@/components/tables/auto-filter.interface';
import { InventoryMovementUi } from './inventory-movement-ui.interface';
import { InventoryCartItem } from '@/components/tables/inventory-cart.interface';

@Component({
  components: {
    AutoFilter,
    InventoryCart,
    InventoryViewDetail,
  },
  filters: {
    dateFormat(date: string) {
      return moment(date).format('YYYY/MM/DD');
    },
  },
  computed: {
    ...mapState('cart', [
      'lastDeletedItem',
    ]),
  },
  methods: {
    ...mapMutations('cart', {
      addCartItem: 'addItem',
    }),
  },
})
export default class InventoryView extends Vue {
  public inventoryData: Array<InventoryMovement> = [];
  public inventoryTable: VuetifyTable<any> = { headers: [], items: [] } as any;
  public todayDate = '';
  public dateSelectors = [
    { menu: false, date: null, label: 'Fecha inicial' },
    { menu: false, date: null, label: 'Fecha final' },
  ];
  public rowSelected = false;
  public brands: string[] = [];
  public categories: string[] = [];
  public search = '';
  public brand = '';
  public category = '';
  public selectedProduct: InventoryMovement | null = null;
  public headers = [];
  public filters: Array<TableAutoFilter> = [
    {
      header: 'referencia',
      type: TableAutoFilterTypes.SELECT,
      fieldType: 'string',
      itemSort: 'asc',
    },
    {
      header: 'descripcion',
      customHeader: 'Descripción',
      type: TableAutoFilterTypes.INPUT,
      fieldType: 'string',
    },
    {
      header: 'inventario',
      customHeader: 'Inventario actual',
      type: TableAutoFilterTypes.CONDITION,
      fieldType: 'number',
    },
  ]
  public dataLoaded = false;
  public unitRules = [
    (v: number) => v >= 0,
  ];

  private firstQuery = true;

  /* CART */
  private addCartItem!: (item: InventoryMovementUi) => void;
  private cartItems!: InventoryCartItem[];

  get minDate() {
    return [
      '2018-01-01',
      this.dateSelectors[0].date ?? '2018-01-01',
    ];
  }

  get isValidDate() {
    return this.dateSelectors.every((selector) => selector.date !== null);
  }

  get showCenteredDate() {
    return !this.isValidDate;
  }

  async beforeMount() {
    this.todayDate = moment().format('YYYY-MM-DD');

    [this.brands, this.categories] = await this.$useLoader(
      Promise.all([
        InventoryApi.getAllBrands(),
        InventoryApi.getAllCategories(),
      ]),
    );
  }

  onHeadersBuild(headers: any) {
    this.headers = headers;
  }

  viewDetails(inventoryMovement: InventoryMovement) {
    this.selectedProduct = inventoryMovement;
    this.rowSelected = true;
  }

  @Watch('dateSelectors.0.date', { deep: true })
  @Watch('dateSelectors.1.date', { deep: true })
  handleFirstQuery() {
    if (this.isValidDate && this.firstQuery) {
      this.firstQuery = false;
    } else {
      return;
    }

    this.handleQueryDependencies();
  }

  @Watch('lastDeletedItem')
  onLastDeletedItemChange(deletedId: number) {
    const movement = (this.inventoryTable.items as InventoryMovementUi[])
      .find((item) => item.id === deletedId);

    if (movement) {
      movement.unidades = 0;
    }
  }

  async handleQueryDependencies() {
    const params = {
      fechaInicio: `${this.dateSelectors[0].date}-01`,
      fechaFinal: moment(`${this.dateSelectors[1].date}-28`).endOf('month').format('YYYY-MM-DD'),
      marca: this.brand ?? '',
      categoria: this.category ?? '',
    };

    if (!this.isValidDate) return;

    this.dataLoaded = false;
    this.inventoryData = await this.$useLoader(InventoryApi.getInventoryMovements(params));
    this.inventoryTable = InventoryMovement.toVuetifyTable(this.inventoryData);
    this.dataLoaded = true;
  }

  setReviewedRowStyle(item: InventoryMovement & { reviewed: boolean }) {
    return item.reviewed ? 'bg-blue-100' : '';
  }

  onUnitChanged(item: InventoryMovementUi) {
    if (item.unidades > 0) {
      item.reviewed = item.unidades > 0;
      this.addCartItem(item);
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/_transitions';

.cs-date-centered {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
}

</style>
