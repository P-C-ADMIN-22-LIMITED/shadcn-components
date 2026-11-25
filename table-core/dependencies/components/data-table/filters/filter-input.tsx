import { Input } from '@/components/ui/input';
import { ChangeEvent } from 'react';
import type { TableFilterEditorProps } from './types';
import { toFilterText } from '@/components/data-table/filters/table-filters.utils';

export function TableFiltersInput({
    filter,
    selectedValue,
    onValueChange,
}: TableFilterEditorProps) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onValueChange(event.target.value || undefined);
    };

    return (
        <Input
            id={filter.label}
            key={filter.label}
            placeholder={filter.label}
            type="text"
            value={toFilterText(selectedValue)}
            onChange={handleChange}
        />
    );
}
