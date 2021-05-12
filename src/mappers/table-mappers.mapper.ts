import { VuetifyTable } from '@/utils/vuetify-table.interface';
import _ from 'lodash';

export class TableMapper {
  static toVuetifyTable<T>(title: string, elements: Array<T>, omit: string[] = []): VuetifyTable<T> {
    let headers: any[];

    if (elements.length > 0) {
      headers = Object.keys(elements[0])
        // @ts-ignore
        .filter((key) => !omit.includes(key))
        .map((key) => ({
          text: key,
          value: key,
          sortable: true,
          filterable: true,
        }));
    } else {
      headers = [];
    }

    return {
      title,
      headers,
      items: elements,
    };
  }

  toPdf() {

  }
}
