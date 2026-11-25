import { useTranslations } from '@/hooks/use-translations';
import { XIcon } from 'lucide-react';
import { describeFilterValue } from './table-filters.utils';
import { TableFilter } from '@/components/data-table/filters/types';

interface FilterChipsProps {
    filters: TableFilter[];
    selectedValues: Record<string, string | undefined>;
    onEdit: (param: string) => void;
    onRemove: (param: string) => void;
}

export function FilterChips({
    filters,
    selectedValues,
    onEdit,
    onRemove,
}: FilterChipsProps) {
    const { trans } = useTranslations();

    return (
        // on phones the chips keep to one row that scrolls sideways instead of wrapping down over the table
        <div className="flex flex-wrap items-center gap-2 max-md:order-last max-md:basis-full max-md:[scrollbar-width:none] max-md:flex-nowrap max-md:overflow-x-auto">
            {filters.map((filter) => (
                <span
                    key={filter.param}
                    className="inline-flex h-8 max-w-64 shrink-0 items-center rounded-md border bg-muted/50 text-sm max-md:max-w-52"
                >
                    <button
                        type="button"
                        className="flex min-w-0 items-center gap-1 py-1 pl-2.5 hover:text-foreground"
                        onClick={() => onEdit(filter.param)}
                    >
                        <span className="shrink-0 text-muted-foreground">
                            {filter.label}:
                        </span>
                        <span className="truncate font-medium">
                            {describeFilterValue(
                                filter,
                                selectedValues[filter.param] as string,
                            )}
                        </span>
                    </button>
                    <button
                        type="button"
                        aria-label={trans(
                            'admin.data_table.table_filters.remove',
                            { label: filter.label },
                        )}
                        className="flex h-full items-center px-1.5 text-muted-foreground hover:text-foreground"
                        onClick={() => onRemove(filter.param)}
                    >
                        <XIcon className="size-3.5" />
                    </button>
                </span>
            ))}
        </div>
    );
}
