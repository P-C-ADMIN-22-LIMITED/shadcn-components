import type { ReactNode } from 'react';
import { TableFilter } from '@/components/data-table/filters/types';
import { TableFiltersSelect } from '@/components/data-table/filters/filter-select';
import { TableFiltersSearchable } from '@/components/data-table/filters/filter-searchable';
import { TableFiltersMultiselect } from '@/components/data-table/filters/filter-multiselect';
import { TableFiltersStatus } from '@/components/data-table/filters/filter-status';
import { TableFiltersCalendar } from '@/components/data-table/filters/filter-calendar';
import { TableFiltersDateRange } from '@/components/data-table/filters/filter-date-range';
import { TableFiltersInput } from '@/components/data-table/filters/filter-input';

export interface TableFilterEditorProps {
    filter: TableFilter;
    selectedValue: string | undefined;
    onValueChange: (value: string | undefined) => void;
}

const EDITORS = {
    select: TableFiltersSelect,
    searchable: TableFiltersSearchable,
    multiselect: TableFiltersMultiselect,
    status: TableFiltersStatus,
    input: TableFiltersInput,
    calendar: TableFiltersCalendar,
    'date-range': TableFiltersDateRange,
} satisfies Record<
    TableFilterEditorProps['filter']['type'],
    (props: TableFilterEditorProps) => ReactNode
>;

export function TableFilterEditor(props: TableFilterEditorProps) {
    const Editor = EDITORS[props.filter.type];

    return <Editor {...props} />;
}
