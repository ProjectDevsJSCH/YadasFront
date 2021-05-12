export interface VuetifyTable {
  headers: {
    text: string;
    value: string;
    align?: string;
    sortable?: boolean;
  }[];
  body: {
    [key: string]: string;
  }[];
}
