import { useTranslations } from '@/hooks/use-translations';
import { useIsMobile } from '@/hooks/use-mobile';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilterPanel } from '@/components/data-table/filters/filter-panel';
import { FilterIcon, FilterXIcon } from 'lucide-react';
import { FilterChips } from '@/components/data-table/filters/filter-chips';
import {
    COMPACT_SHEET_MAX_FILTERS,
    FilterSheet,
    SHEET_FULL,
    SHEET_PEEK,
    SheetSnap,
} from '@/components/data-table/filters/filter-sheet';
import { FilterPopover } from '@/components/data-table/filters/filter-popover';
import { TableFilter } from '@/components/data-table/filters/types';

export interface TableFiltersProps {
    filters?: TableFilter[];
    selectedValues: Record<string, string | undefined>; // keyed by filter.param
    onFilterChange: (param: string, value: unknown) => void;
    onClearAll: () => void;
    hasActiveFilters: boolean;
    activeFiltersCount?: number;
    showChips?: boolean;
}

function TableFiltersComponent({
    filters,
    selectedValues,
    onFilterChange,
    onClearAll,
    showChips = true,
}: TableFiltersProps) {
    const { trans } = useTranslations();
    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = useState(false);
    const [focusParam, setFocusParam] = useState<string | null>(null);
    const [sheetSnap, setSheetSnap] = useState<SheetSnap>(SHEET_PEEK);
    // edits in the panel stay a draft until Apply, so the table only reloads once
    const [draftValues, setDraftValues] = useState(selectedValues);
    const panelRef = useRef<HTMLDivElement>(null);

    const panelFilters = useMemo(
        () =>
            filters ? filters.filter((f) => f.includeInDropdown !== false) : [],
        [filters],
    );
    const activeFilters = panelFilters.filter(
        (filter) => selectedValues[filter.param],
    );

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setDraftValues(selectedValues);
            setSheetSnap(SHEET_PEEK);
        } else {
            setFocusParam(null);
        }
    };

    // a chip opens the panel on its own filter, and the phone sheet expands so that filter's control has room
    const openOnFilter = (param: string) => {
        setFocusParam(param);
        setDraftValues(selectedValues);
        setSheetSnap(SHEET_FULL);
        setIsOpen(true);
    };

    const handleValueChange = useCallback(
        (param: string, value: string | undefined) =>
            onFilterChange(param, value),
        [onFilterChange],
    );

    const handleDraftChange = useCallback(
        (param: string, value: string | undefined) =>
            setDraftValues((previous) => ({ ...previous, [param]: value })),
        [],
    );

    const applyDraft = () => {
        panelFilters
            .filter(
                (filter) =>
                    draftValues[filter.param] !== selectedValues[filter.param],
            )
            .forEach((filter) =>
                onFilterChange(filter.param, draftValues[filter.param]),
            );
        handleOpenChange(false);
    };

    useEffect(() => {
        if (!isOpen || focusParam === null) {
            return;
        }

        const field = panelRef.current?.querySelector<HTMLElement>(
            `[data-filter-param="${focusParam}"]`,
        );
        field?.scrollIntoView?.({ block: 'nearest' });
        field?.querySelector<HTMLElement>('input, button')?.focus();
    }, [focusParam, isOpen]);

    const trigger = (
        <Button
            variant="outline"
            className="relative h-8 font-normal"
            size="sm"
        >
            <FilterIcon className="text-muted-foreground" />
            <span>{trans('admin.data_table.table_filters.label')}</span>
            {activeFilters.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] leading-none font-medium text-primary-foreground tabular-nums">
                    {activeFilters.length}
                </span>
            )}
        </Button>
    );

    const panel = (
        <FilterPanel
            filters={panelFilters}
            selectedValues={draftValues}
            hasActiveFilters={panelFilters.some(
                (filter) => draftValues[filter.param],
            )}
            isMobile={isMobile}
            panelRef={panelRef}
            onValueChange={handleDraftChange}
            onReset={() => setDraftValues({})}
            onApply={applyDraft}
        />
    );

    return (
        // on phones the wrapper dissolves into the toolbar row: Clear goes after View at the right edge, the chips take their own line below
        <div className="flex flex-wrap items-center gap-2 max-md:contents">
            {showChips && activeFilters.length > 0 && (
                <FilterChips
                    filters={activeFilters}
                    selectedValues={selectedValues}
                    onEdit={openOnFilter}
                    onRemove={(param) => handleValueChange(param, undefined)}
                />
            )}

            {isMobile ? (
                <FilterSheet
                    open={isOpen}
                    onOpenChange={handleOpenChange}
                    snap={sheetSnap}
                    onSnapChange={setSheetSnap}
                    isEditing={focusParam !== null}
                    compact={panelFilters.length <= COMPACT_SHEET_MAX_FILTERS}
                    trigger={trigger}
                >
                    {panel}
                </FilterSheet>
            ) : (
                <FilterPopover
                    open={isOpen}
                    onOpenChange={handleOpenChange}
                    isEditing={focusParam !== null}
                    trigger={trigger}
                >
                    {panel}
                </FilterPopover>
            )}

            {activeFilters.length > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-muted-foreground max-md:order-1 max-md:ml-auto"
                    onClick={onClearAll}
                >
                    <FilterXIcon className="size-4" />
                    {trans('admin.data_table.table_filters.clear')}
                </Button>
            )}
        </div>
    );
}

export const TableFilters = memo(TableFiltersComponent);

TableFilters.displayName = 'TableFilters';
