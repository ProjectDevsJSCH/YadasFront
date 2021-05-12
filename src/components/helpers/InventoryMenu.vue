<template>
  <div
    class="fixed"
    style="width: 2px; height: 2px; overflow: hidden"
  >
    <div
      class="w-screen bg-white" id="inventory-menu"
      style=" width: 800px"
    >
      <table
        id="table-menu"
        style="width: 800px; height: 900px;"
      >
        <tr
          v-for="(pair, index) in columnTypes"
          :key="pair[0].name"
          :class="['bg-opacity-50', index % 2 === 0 ? 'bg-blue-100' : '']"
        >
          <td class="px-4">{{ pair[0].name | firstLetterUppercase }}</td>
          <td class="px-2">{{ validateExistence(pair[0] && pair[0].pageStart) }} - {{ validateExistence(pair[0] && pair[0].pageEnd) }}</td>
          <td class="px-8">{{ pair[1] ? pair[1].name : '' | firstLetterUppercase }}</td>
          <td class="px-4">{{ validateExistence(pair[1] && pair[1].pageStart) }} - {{ validateExistence(pair[1] && pair[1].pageEnd ) }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Inventory } from '@/model';

function firstLetterUppercase(str: string) {
  if (!str[0]) { return ''; }

  return `${(str[0] as string).toUpperCase()}${[...str].slice(1).map((l) => l.toLowerCase()).join('')}`;
}

function validateExistence(object: any) {
  if (!object) { return ''; }

  return object;
}

@Component({
  filters: {
    firstLetterUppercase,
  },
})
export default class InventoryMenu extends Vue {
  @Prop({})
  inventoryList!: Inventory[];

  get columnTypes(): Array<Array<{ name: string; pageStart: number; pageEnd: number }>> {
    if (!this.inventoryList.length) return [];

    const types: Array<Array<{ name: string; pageStart: number; pageEnd: number }>> = [];
    const rowsPerPage = 25;
    let currentRows = 0;

    for (let i = 0; i < this.inventoryList.length; i += 2) {
      types.push(
        // eslint-disable-next-line no-loop-func
        this.inventoryList.slice(i, i + 2).map((v) => {
          const pageStart = Math.floor(currentRows / rowsPerPage) + 2;
          currentRows += v.items.length + 2;
          const pageEnd = Math.floor(currentRows / rowsPerPage) + 2;
          currentRows += 1;

          return {
            name: v.group,
            pageStart,
            pageEnd,
          };
        }),
      );
    }

    return types;
  }

  validateExistence = validateExistence;
}
</script>

<style lang="scss" scoped>

</style>
