import { Paginator } from './paginator';

interface VuetifyTable {
  toVuetifyTable: Function;
}

export class FactoryPaginator<T extends VuetifyTable> {
  public static createPaginator<T>(elements: T[]) {
    // return new Paginator<T>();
  }
}
