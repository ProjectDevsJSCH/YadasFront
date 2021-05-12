<template>
  <div>
    <div class="flex">
      <v-combobox
        v-model="searchElements"
        :search-input.sync="searchChip"
        :items="hints"
        :filter="customFilter"
        label="Búsqueda general"
        outlined
        item-text="hint"
        item-value="hint"
        hide-no-data
        clearable
        small-chips
        hide-selected
        ref="autocomplete"
        @keydown.enter="detect"
      >
        <template v-slot:item="{ item }">
          <v-list-item-content
            ref="filterItem"
          >
            <div
              class="v-list-item__title"
              v-html="highlightSearchMatch(item.hint)"
            />
            <v-list-item-subtitle
              v-text="item.source"
            />
          </v-list-item-content>
        </template>
      </v-combobox>

      <slot name="search-bars" />
    </div>
    <div class="flex my-2">
      <v-btn
        @click="applyFilters"
        color="primary"
      >
        Filtrar
      </v-btn>
      <slot :removeFilters="removeFilters" />
    </div>

    <div class="chip-container">
      <v-chip
        v-for="(value, key) in foundFilters"
        :key="key"
        class="ma-2"
        color="green"
        text-color="white"
      >
        <v-avatar
          left
          class="green darken-4"
        >
          {{ value.tables.size }}
        </v-avatar>
        <v-avatar
          left
          class="green darken-4"
        >
          {{ value.ocurrences }}
        </v-avatar>
        {{ key }}
      </v-chip>
    </div>

    <!-- Prev chips -->
    <div
      v-show="localFilters.size > 0"
      class="preview"
    >
      <v-chip
        v-for="(value) in localFilters"
        :key="value"
        class="ma-2"
        color="light-green darken-1"
        text-color="white"
        @click="removeFilter(value)"
      >
        {{ value }}
      </v-chip>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { GenericObject } from '../utils/generic.interface';

@Component({
  model: {
    prop: 'filters',
    event: 'set',
  },
})
export default class Filters extends Vue {
  @Prop({
    required: true,
  })
  public filters!: string[];
  @Prop({
    required: false,
  })
  public foundFilters!: GenericObject<{ tables: Set<string>; ocurrences: number }>;
  @Prop({
    required: false,
  })
  public hints!: string[];
  public localFilters: Set<string> = new Set();
  public searchChip = '';
  public aux = '';
  public searchElements: string | Record<string, string> = '';

  highlightSearchMatch(fullMatch: string) {
    if (!this.searchChip) return fullMatch;

    const queryWords = this.searchChip.trim().split(/\s+/);

    let matchHtml = fullMatch;

    queryWords.forEach((word) => {
      matchHtml = matchHtml.replaceAll(word.toUpperCase(), `<span class="bg-gray-300 rounded-md" style="padding: 1px">${word.toUpperCase()}</span>`);
    });

    return matchHtml;
  }

  customFilter(item: any, queryText: string, itemText: string) {
    const queryWords = queryText.trim().split(/\s+/);

    return queryWords.every(
      (word) => this.normalizeData(itemText).includes(this.normalizeData(word)),
    );
  }

  addFilter(filter: string) {
    const data = this.normalizeData(filter);

    this.localFilters.add(data);
    this.applyFilters();
  }

  detect() {
    if (this.searchElements === '') return;

    const filterData = typeof this.searchElements === 'object'
      ? this.searchElements.hint
      : this.searchElements;

    const data = this.normalizeData(filterData);

    this.localFilters.add(data);
    this.applyFilters();

    this.searchElements = '';
  }

  blurFields() {
    (this.$refs.autocomplete as any).blur();
  }

  removeFilter(filter: string) {
    const data = this.normalizeData(filter);

    this.localFilters.delete(data);
    this.localFilters = new Set(this.localFilters);
  }

  removeFilters() {
    this.localFilters = new Set();
  }

  applyFilters() {
    this.$emit('set', [...this.localFilters]);
    setTimeout(() => { this.searchChip = ''; });
  }

  normalizeData(data: string): string {
    return data
      .toLowerCase()
      .trim();
  }
}
</script>

<style lang="scss" scoped>

.chip-container {
  display: flex;
}

.preview {
  border-radius: 20px;
  border: 1px dashed rgb(218, 218, 218);
  margin: 15px 0;
}

.cs__filter-search-match {
  padding: 1px 2px;
  border-radius: 3px;
  background: red;
}

</style>
