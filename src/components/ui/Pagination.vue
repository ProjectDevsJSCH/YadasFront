<template>
  <div>
    slot

    <v-pagination
      v-model="currentPage"
      :length="pagesCount"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import InventoryTable from '@/components/tables/InventoryTable.vue';

@Component({
  name: 'Pagination',
  inheritAttrs: false,
  components: {
    InventoryTable,
  },
})
export default class Pagination extends Vue {
  @Prop({
    type: Number,
    default: 1,
  })
  public elementsPerPage!: number;
  @Prop({
    type: String,
  })
  public component!: string;
  /* Key value to improve reactivity */
  @Prop({
    type: String,
  })
  public trackKey!: string;
  @Prop({
    type: Array,
    default: () => [],
  })
  public data!: Array<any>;

  public currentPage = 1;

  get paginatedData() {
    const start = (this.currentPage - 1) * this.elementsPerPage;

    return this.data.slice(start, start + this.elementsPerPage);
  }

  get pagesCount() {
    if (this.data.length === 0) return 1;

    const length = Math.ceil(this.data.length / this.elementsPerPage);

    return length;
  }

  componentKey(data: any, index: number) {
    if (this.trackKey) {
      return data[this.trackKey];
    }

    return index;
  }
}
</script>
