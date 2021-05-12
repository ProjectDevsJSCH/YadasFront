import { DataTableHeader } from 'vuetify';

// ? Probably rawData is a disposable element here
export interface VuetifyTable<T> {
  title: string;
  headers: Array<DataTableHeader>;
  items: Array<T>;
  rawData?: Array<Map<string, any>>;
}
