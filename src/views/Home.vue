<template>
  <div class="home">
    <!-- Filters -->
    <Filters
      v-model="filters"
      :foundFilters="foundFilters"
      :hints="hints"
      @set="page = 1"
      ref="filters"
    >
      <template #default="{ removeFilters }">
        <v-btn
          class="mx-2"
          dark
          color="blue lighten-3"
          v-show="filters.length > 0"
          @click="cleanFilters(); removeFilters()"
        >
          <v-icon>mdi-filter-off-outline</v-icon>
        </v-btn>
        <v-switch
          class="mt-0 ml-4"
          label="Búsqueda estricta"
          v-model="matchAllFilters"
        />
      </template>
    </Filters>

    <v-btn
      v-if="false"
      class="white--text"
      small color="pink darken-1"
      @click="generatePdf"
    >
      Generar PDF
    </v-btn>

    <!-- LIST FOR SELECTING PRODUCT -->
    <div class="max-w-4xl mx-auto my-0 sticky-products">
      <v-autocomplete
        label="Menú de productos"
        :items="productTypes"
        v-model="currentProductType"
        dense
        solo
        @mousedown="handleProductTypeChange"
        clearable
      />
    </div>

    <v-dialog
      v-model="showExcelDialog"
      max-width="500"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="white--text"
          small color="teal darken-1"
          v-on="on"
          v-bind="attrs"
          @click="fetchConfig"
        >
          Generar Excel
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline">Generar Excel</v-card-title>
        <v-divider />
        <div class="px-8 py-4">
          <v-switch
            v-model="useDefaultOrder"
            inset
            label="Usar orden predeterminado"
          />
          <v-switch
            v-model="omitUnavailable"
            inset
            label="Omitir agotados"
          />

          <template v-if="!useDefaultOrder">
            <div
              v-for="(config, index) in inventoryConfig.config"
              :key="index"
            >
              <div class="mr-4 text-blue-700">
                {{ config.table }}
              </div>
              <div class="flex">
                <v-select
                  style="width: 150px"
                  v-model="config.column"
                  :items="inventoryConfig.columns"
                  label="Columna"
                  dense
                  solo
                />
                <v-switch
                  class="ml-4"
                  v-model="config.ascendant"
                  label="ASC"
                />
              </div>
            </div>
          </template>
        </div>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text @click="showExcelDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="blue darken-1"
            text @click="showExcelDialog = false; generateExcel()"
          >
            Descargar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- HELPERS -->
    <inventory-menu
      :inventoryList="filteredData"
    />

    <v-btn
      v-if="accessControl.includes('Inventario unipartes')"
      small
      dark
      color="blue darken-4"
      class="mx-2"
      :loading="loadingUnipartesStock"
      @click="getInventoryStock"
    >
      Cargar inventario Unipartes
    </v-btn>

    <!-- TABLES -->
    <div
      v-for="table in paginatedVuetifyTable"
      :key="table.title"
      class="table-item"
    >
      <inventory-table
        :title="table.title"
        :headers="table.headers"
        :items="table.items"
      />
    </div>
    <v-pagination
      v-model="page"
      :length="paginationLength"
      circle
      :total-visible="7"
    />
  </div>
</template>

<script lang="ts">
import domtoimage from 'dom-to-image';

import { Component, Vue, Watch } from 'vue-property-decorator';
import InventoryTable from '@/components/tables/InventoryTable.vue';
import Pagination from '@/components/ui/Pagination.vue';

import { InventoryApi, InventoryConfigApi } from '@/api';
import { GenericObject } from '../utils/generic.interface';
import { Inventory } from '@/model';

import Filters from '../components/Filters.vue';
import InventoryMenu from '@/components/helpers/InventoryMenu.vue';
import { InventoryConfig, InventoryConfigTables } from '@/model/inventory-config/inventory-config.dto';
import { ProductTypeSelect } from '@/interfaces/product-type-select.interface';
import { Enterprise } from '@/model/enterprise/enterprise.enum';
import { AccessControl } from '@/access-control/access-control';

@Component({
  components: {
    Filters,
    InventoryTable,
    Pagination,
    InventoryMenu,
  },
})
export default class Home extends Vue {
  public tables: Array<any> = [];
  public progress = 0;
  public page = 1;
  public tablesPerPage = 4;
  public filters: string[] = [];
  public foundFilters: GenericObject<{ tables: Set<string>; ocurrences: number }> = {};
  public matchAllFilters = false;
  public hints: any[] = [];
  public productTypes: ProductTypeSelect[] = [];
  public currentProductType: any = '';

  /* Excel */
  public showExcelDialog = false;
  public useDefaultOrder = true;
  public omitUnavailable = false;

  public inventoryConfig: InventoryConfig = { columns: [], config: [] };

  private inventoryList: Inventory[] = [];
  private originalInventoryConfig: InventoryConfigTables[] = [];

  private referenceTableLink!: HTMLAnchorElement;

  public accessControl = AccessControl.omitFeatures<string>(
    [
      'Inventario unipartes',
    ],
    {},
    {
      [Enterprise.YADAS]: [
        'Inventario unipartes',
      ],
    },
  );
  /* Unipartes */
  public loadingUnipartesStock = false;

  get filteredData(): Inventory[] {
    /* Initialize found filters */
    this.foundFilters = {};
    this.filters.forEach((filter) => {
      this.$set(this.foundFilters, filter, {
        tables: new Set(),
        ocurrences: 0,
      });
    });

    if (!this.inventoryList) return [];

    if (this.filters.length === 0) return this.inventoryList;

    const filteredData: Inventory[] = [];
    this.inventoryList.forEach((iventoryElement) => {
      const filteredItems = iventoryElement.items.filter((row) => {
        const inventoryValues = Object.values(row);
        let includeRow = false;
        let includeCount = 0;

        this.filters.forEach((filter) => {
          const localFilterMatch = inventoryValues
            .some(
              (value) => String(value).toLowerCase().includes(filter.toLowerCase()),
            );

          includeRow = localFilterMatch || includeRow;

          if (localFilterMatch) {
            includeCount += 1;
            this.foundFilters[filter].tables.add(iventoryElement.group);
            this.foundFilters[filter].ocurrences += 1;
          }
        });

        return this.matchAllFilters
          ? includeCount === this.filters.length
          : includeRow;
      }) || [];

      if (filteredItems.length === 0) return;

      filteredData.push(new Inventory({
        group: iventoryElement.group,
        items: filteredItems,
      }));
    });

    return filteredData;
  }

  get testPagination() {
    return this.filteredData.map((v) => v.toVuetifyTable());
  }

  get paginatedVuetifyTable() {
    const initialValue = (this.page - 1) * this.tablesPerPage;

    return this.filteredData
      .slice(initialValue, initialValue + this.tablesPerPage)
      .map((inventory: Inventory) => {
        try {
          return inventory.toVuetifyTable();
        } catch (error) {
          console.log('Failed in');
          console.log(inventory);
        }
      });
  }

  get paginationLength() {
    if (!this.filteredData) return 0;
    const length = Math.ceil(this.filteredData.length / this.tablesPerPage);

    return length;
  }

  async beforeMount() {
    const showOnlyPromotions = this.$route.meta.content === 'promo';
    const inventoryRequest = await this.$useLoader(InventoryApi.getAll(Enterprise.YADAS, {
      showOnlyPromotions,
    }));

    this.inventoryList = inventoryRequest;

    const hintColumns: any[] = [
      { column: 'Referencia', values: [] },
      { column: 'Descripción', values: [] },
    ];

    this.inventoryList.forEach((list, index) => {
      list.items.forEach((item) => {
        hintColumns.forEach((col) => {
          col.values.push({
            hint: (item as any)[col.column],
            source: col.column,
          });
        });
      });

      this.productTypes.push({
        text: list.group,
        value: {
          page: Math.floor(index / this.tablesPerPage),
          tableTitle: list.group.replace(/\s/g, ''),
        },
      });
    });

    hintColumns.forEach((col) => {
      this.hints.push(...col.values);
    });

    this.referenceTableLink = document.createElement('a');
  }

  async getInventoryStock() {
    this.loadingUnipartesStock = true;

    const stock = await InventoryApi.getUnipartesInventory();

    this.inventoryList.forEach((inventoryItem) => {
      inventoryItem.items.forEach((item) => {
        this.$set(
          item,
          'UnipartesExistencia',
          item.IdInventario in stock.data
            ? stock.data[item.IdInventario].stock ?? '-'
            : '-',
        );
      });
    });

    this.loadingUnipartesStock = false;
  }

  mounted() {
    this.handleQueries();
  }

  @Watch('currentProductType')
  handleProductTypeChange() {
    if (this.currentProductType === '' || this.currentProductType === undefined) return;

    this.page = this.currentProductType.page + 1;

    setTimeout(() => {
      const table = document.querySelector(`#${this.currentProductType.tableTitle}`);

      if (!table) { return; }

      table.scrollIntoView({
        behavior: 'smooth',
      });
    }, 100);
  }

  async fetchConfig() {
    const res = await this.$useLoader(InventoryConfigApi.getConfig());

    this.originalInventoryConfig = res.config;
    res.config = res.config.sort((a, b) => a.table.localeCompare(b.table));
    this.inventoryConfig = res;
  }

  handleQueries() {
    const { query } = this.$route;
    const { s } = query;
    const { filters } = this.$refs;

    if (s && filters) {
      (filters as any).addFilter(s);
    }
  }

  cleanFilters() {
    this.filters = [];
  }

  generatePdf() {
    Inventory.toPdfList(this.filteredData);
  }

  async generateExcel() {
    const menuSelector = '#table-menu';
    const table = document.querySelector(menuSelector);

    if (!table) return;

    const imgB64 = await domtoimage.toPng(table);

    const sortConfig = this.useDefaultOrder
      ? this.originalInventoryConfig
      : this.inventoryConfig.config;

    Inventory.toExcelSheet(this.filteredData, sortConfig, this.omitUnavailable, imgB64);
  }
}
</script>

<style lang="scss" scoped>

.home {
  margin: 30px;
  scroll-behavior: smooth;
}

.table-item {
  margin-bottom: 50px;
}

h2 {
  position: relative;
}

.logo {
  position: absolute;
  height: 150px;
  left: 50%;
  top: 50%;
  transform: translateY(-50%);
}

.address {
  text-align: center;
}

.sticky-products {
  position: sticky;
  top: 10px;
  z-index: 5;
}

</style>
