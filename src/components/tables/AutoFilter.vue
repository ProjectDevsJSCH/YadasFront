<template>
  <div class="grid max-w-screen-xl px-4 mx-auto my-4 gap-x-8 gap-y-2 grid-cols-fill-4 v-auto-filter-fields">
    <div
      class="flex px-1 pt-1 bg-white rounded-md"
      v-for="filter in filterModel"
      :key="filter.header"
    >
      <component
        class="ma-1 pa-2"
        v-model="filter.value"
        :label="filter.label"
        :is="filter.component"
        :items="filter.items"
        :type="filter.type"
        clearable
      />

      <div
        v-if="filter.filterType === 'condition'"
        class="w-32 pr-2 -mt-1"
      >
        <v-select
          label="Condición"
          v-model="filter.selectedCondition"
          :items="conditionalOptions"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Vue,
} from 'vue-property-decorator';

import { DataTableHeader } from 'vuetify';
import _ from 'lodash';

import {
  TableAutoFilter,
  TableAutoFilterComponents,
  TableAutoFilterCondition,
  TableAutoFilterTypes,
} from './auto-filter.interface';

interface FilterModel {
  header: string;
  label: string;
  value: any;
  filterType: TableAutoFilterTypes;
  component: TableAutoFilterComponents;
  selectedCondition?: TableAutoFilterCondition;
  type: 'text' | 'number';
  items?: {
    text: string;
    value: string | number | object;
  }[] | undefined;
}

@Component({})
export default class AutoFilter extends Vue {
  @Prop({
    required: true,
  })
  public filters!: Array<TableAutoFilter>;
  @Prop({
    required: true,
  })
  public headers!: Array<DataTableHeader>;
  @Prop()
  public values!: Array<Record<string, any>>;

  public filterModel: Array<FilterModel> = [];
  public conditionalOptions = [
    { text: '<', value: 'lt' },
    { text: '>', value: 'gt' },
    { text: '\u22DC', value: 'gte' },
    { text: '\u22DD', value: 'lte' },
    { text: '\u2260', value: 'diff' },
    { text: '=', value: 'eq' },
  ];

  beforeMount() {
    this.initializeModel();
    this.setFilters();
  }

  private setFilters() {
    const headers = this.headers.map((header) => {
      const filterConfig = this.filters.find((filter) => filter.header === header.value);

      if (!filterConfig) return header;

      const filter = this.generateFilterFunction(filterConfig);

      return {
        ...header,
        filter,
      };
    });

    this.$emit('headersBuild', headers);
  }

  private initializeModel() {
    this.filterModel = this.filters.map((filter) => {
      const sortFn = (() => {
        /* Use custom function */
        if (typeof filter.itemSort === 'function') {
          return filter.itemSort;
        }

        /* Use default ASC or DESC */
        if (typeof filter.itemSort === 'string') {
          return (a: number | string, b: number | string) => {
            if (typeof a === 'string' && typeof b === 'string') {
              return filter.itemSort === 'asc'
                ? a.localeCompare(b)
                : b.localeCompare(a);
            }

            return filter.itemSort === 'asc'
              ? +a - +b
              : +b - +a;
          };
        }

        /* Use default order */
        return () => 1;
      })();
      const items = filter.type === TableAutoFilterTypes.SELECT
        ? [...new Set(this.values.map((value) => value[filter.header] ?? null))]
          .sort(sortFn)
        : undefined;

      return {
        header: filter.header,
        label: filter.customHeader ?? _.capitalize(filter.header),
        component: TableAutoFilterComponents[
          filter.type === TableAutoFilterTypes.SELECT
            ? 'SELECT'
            : 'INPUT'
        ],
        filterType: filter.type,
        type: filter.fieldType === 'string'
          ? 'text'
          : 'number',
        value: null,
        selectedCondition: undefined,
        items,
      };
    });
  }

  private generateFilterFunction(filterConfig: TableAutoFilter) {
    const modelFilter = this.filterModel.find((model) => model.header === filterConfig.header);

    switch (filterConfig.type) {
      case TableAutoFilterTypes.SELECT:
      case TableAutoFilterTypes.INPUT:
        return (value: string | number) => {
          if (!modelFilter?.value) return true;

          if (filterConfig.fieldType === 'string') {
            return String(value).toLowerCase()
              .includes(String(modelFilter?.value).toLowerCase());
          }

          if (filterConfig.fieldType === 'number') {
            return String(value) === String(modelFilter.value);
          }

          return true;
        };
      case TableAutoFilterTypes.CONDITION:
        return (value: number) => {
          if (!modelFilter?.value) return true;

          switch (modelFilter?.selectedCondition) {
            case TableAutoFilterCondition.lt:
              return value < +modelFilter?.value;
            case TableAutoFilterCondition.gt:
              return value > +modelFilter?.value;
            case TableAutoFilterCondition.lte:
              return value >= +modelFilter?.value;
            case TableAutoFilterCondition.gte:
              return value <= +modelFilter?.value;
            case TableAutoFilterCondition.diff:
              return value !== +modelFilter?.value;
            case TableAutoFilterCondition.eq:
              return value === +modelFilter?.value;
            default:
              return () => true;
          }
        };

      default:
        return () => true;
    }
  }
}
</script>

<style lang="scss">

/* Vuetify override */

.v-auto-filter-fields {
  .v-text-field__details {
    display: none !important;
  }
}

</style>
