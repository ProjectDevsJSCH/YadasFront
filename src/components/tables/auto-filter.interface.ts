export enum TableAutoFilterTypes {
    SELECT = 'select',
    INPUT = 'input',
    CONDITION = 'condition'
}

export enum TableAutoFilterComponents {
    SELECT = 'v-autocomplete',
    INPUT = 'v-text-field'
}

export enum TableAutoFilterCondition {
    lt = 'lt',
    gt = 'gt',
    lte = 'lte',
    gte = 'gte',
    diff = 'diff',
    eq = 'eq'
}

type ItemValue = number | string | { text: string; value: number | string | object; };

export interface TableAutoFilter {
    header: string;
    customHeader?: string;
    type: TableAutoFilterTypes;
    fieldType: 'number' | 'string';
    itemBuilder?: (item: number | string) => ItemValue;
    itemSort?: 'asc' | 'desc' | ((a: ItemValue, b: ItemValue) => number);
}
