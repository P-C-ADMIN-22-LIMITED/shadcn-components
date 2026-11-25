export type TableFilter = {
    label: string;
    param: string;
    type:
        | 'select'
        | 'searchable'
        | 'input'
        | 'calendar'
        | 'status'
        | 'multiselect'
        | 'date-range';
    options?: Record<string, string | number>[];
    optionLabelKey?: string;
    optionValueKey?: string;
    includeInDropdown?: boolean;
};

export interface TableFilterEditorProps {
    filter: TableFilter;
    selectedValue: string | undefined;
    onValueChange: (value: string | undefined) => void;
}
