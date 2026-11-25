import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/use-translations';
import { useMemo } from 'react';
import type { TableFilterEditorProps } from './types';

export function TableFiltersSelect({
    filter,
    selectedValue,
    onValueChange,
}: TableFilterEditorProps) {
    const {
        options = [],
        optionLabelKey = 'label',
        optionValueKey = 'value',
    } = filter;
    const { trans } = useTranslations();

    const currentValue = selectedValue ?? '';

    const optionItems = useMemo(
        () =>
            options.map((option, index) => (
                <SelectItem
                    key={`${option[optionValueKey]}-${index}`}
                    value={String(option[optionValueKey])}
                    className="max-w-[280px]"
                >
                    {String(option[optionLabelKey])}
                </SelectItem>
            )),
        [options, optionLabelKey, optionValueKey],
    );

    const handleValueChange = (value: string) => {
        if (value === '__clear__' || value === '') {
            onValueChange(undefined);
            return;
        }
        onValueChange(value);
    };

    return (
        <Select onValueChange={handleValueChange} value={currentValue}>
            <SelectTrigger className="w-full">
                <SelectValue
                    placeholder={trans(
                        'admin.data_table.table_filters.select_placeholder',
                        {
                            label: filter.label.toLowerCase(),
                        },
                    )}
                />
            </SelectTrigger>
            <SelectContent
                position="popper"
                align="start"
                className="max-h-80 w-[var(--radix-select-trigger-width)] p-0"
            >
                <SelectItem value="__clear__">—</SelectItem>
                {optionItems}
            </SelectContent>
        </Select>
    );
}
