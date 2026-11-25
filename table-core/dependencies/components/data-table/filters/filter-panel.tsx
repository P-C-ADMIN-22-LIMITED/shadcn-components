import { cn } from '@/lib/utils';
import { RefObject } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { TableFilterEditor } from '@/components/data-table/filters/filter-editor';
import { TableFilter } from '@/components/data-table/filters/types';

interface FilterPanelProps {
    filters: TableFilter[];
    selectedValues: Record<string, string | undefined>;
    hasActiveFilters: boolean;
    isMobile: boolean;
    panelRef: RefObject<HTMLDivElement | null>;
    onValueChange: (param: string, value: string | undefined) => void;
    onReset: () => void;
    onApply: () => void;
}

export function FilterPanel({
    filters,
    selectedValues,
    hasActiveFilters,
    isMobile,
    panelRef,
    onValueChange,
    onReset,
    onApply,
}: FilterPanelProps) {
    const { trans } = useTranslations();

    return (
        <div className={cn('flex min-h-0 flex-col', isMobile && 'flex-1')}>
            <div
                className={cn(
                    'flex items-center justify-between gap-2 border-b px-3 py-2',
                    isMobile && 'px-4',
                )}
            >
                <span
                    className={cn(
                        'text-sm font-medium',
                        isMobile && 'text-base',
                    )}
                >
                    {trans('admin.data_table.table_filters.label')}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 px-2 text-muted-foreground"
                    disabled={!hasActiveFilters}
                    onClick={onReset}
                >
                    Reset
                </Button>
            </div>
            <div
                ref={panelRef}
                data-testid="filters-panel-body"
                className={cn(
                    'grid max-h-[min(70vh,32rem)] gap-4 overflow-y-auto overscroll-contain p-3',
                    isMobile && 'max-h-none flex-1 content-start px-4 pb-6',
                )}
            >
                {filters.map((filter) => (
                    <div
                        key={filter.param}
                        data-filter-param={filter.param}
                        className="grid gap-1.5"
                    >
                        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {filter.label}
                        </span>
                        <TableFilterEditor
                            filter={filter}
                            selectedValue={selectedValues[filter.param]}
                            onValueChange={(value) =>
                                onValueChange(filter.param, value)
                            }
                        />
                    </div>
                ))}
            </div>
            <div className={cn('border-t p-3', isMobile && 'px-4')}>
                <Button size="sm" className="w-full" onClick={onApply}>
                    Apply
                </Button>
            </div>
        </div>
    );
}
