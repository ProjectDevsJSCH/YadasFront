import { VuetifyTable } from '@/utils/vuetify-table.interface';

export interface TableModel {
  toVuetifyTable?: () => VuetifyTable<any>;
  toExcelSheet?: () => Promise<void> | void;
  toPdfList?: () => Promise<void> | void;
}
