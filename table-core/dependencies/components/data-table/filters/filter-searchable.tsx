import SearchableSelect from '@/components/ui/searchable-select';
import { useTranslations } from '@/hooks/use-translations';
import type { TableFilterEditorProps } from './types';

export function TableFiltersSearchable({
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

    return (
        <SearchableSelect
            value={selectedValue}
            onValueChange={onValueChange}
            options={options}
            optionLabel={optionLabelKey}
            optionValue={optionValueKey}
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
            emptyMessage={trans(
                'admin.data_table.table_filters.empty_placeholder',
                {
                    label: filter.label.toLowerCase(),
                },
            )}
            contentClassName="max-w-[300px]"
            className="w-full"
        />
    );
}
