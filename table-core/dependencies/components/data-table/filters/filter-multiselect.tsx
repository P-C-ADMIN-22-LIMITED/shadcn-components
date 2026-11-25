import { MultiselectExpandable } from '@/components/ui/multiselect-expandable';
import { useTranslations } from '@/hooks/use-translations';
import type { TableFilterEditorProps } from './types';

export function TableFiltersMultiselect({
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

    const selectedValues = selectedValue ? selectedValue.split(',') : [];

    const handleChange = (newSelectedValues: string[]) => {
        onValueChange(
            newSelectedValues.length > 0
                ? newSelectedValues.join(',')
                : undefined,
        );
    };

    return (
        <MultiselectExpandable
            options={options}
            valueKey={optionValueKey}
            labelKey={optionLabelKey}
            selectedValues={selectedValues}
            onChange={handleChange}
            placeholder={trans(
                'admin.data_table.table_filters.select_placeholder',
                {
                    label: filter.label.toLowerCase(),
                },
            )}
            searchPlaceholder={trans(
                'admin.data_table.table_filters.search_placeholder',
                {
                    label: filter.label.toLowerCase(),
                },
            )}
            className="w-full"
            maxShownItems={2}
            displayMode="summary"
        />
    );
}
