// table-core.tsx
import { cn } from '@/lib/utils';
import { DraggableTableBody } from '@/components/data-table/draggable-table-body';
import { DraggableTableProvider } from '@/components/data-table/draggable-table-provider';
import EmptyTable from '@/components/data-table/empty-table';
import TableActions, {
    TableAction,
} from '@/components/data-table/table-actions';
import {
    BulkTableAction,
    BulkTableActionContext,
    TableBulkActions,
} from '@/components/data-table/table-bulk-actions';
import { TablePagination } from '@/components/data-table/table-pagination';
import { TableViewColumns } from '@/components/data-table/table-view-columns';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    type Query,
    type TableVisitOptions,
    useTableQueryState,
} from '@/hooks/data-table/use-table-query-state';
import {
    useVirtualRows,
    VIRTUALIZATION_THRESHOLD,
} from '@/hooks/data-table/use-virtual-rows';
import { Links } from '@/types/resource/links';
import { Meta } from '@/types/resource/meta';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    Header,
    HeaderGroup,
    Row,
    RowSelectionState,
    Table as TanStackTable,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import {
    Fragment,
    ReactNode,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { TableFilters } from './filters/table-filters';
import { TableSearchInput } from './table-search-input';
import { TableFilter } from '@/components/data-table/filters/types';

export interface EmptyStateMeta {
    title?: string;
    description?: string;
    hasButton?: boolean;
    buttonName?: string;
    buttonOnClick?: () => void;
}
export interface DataTableCoreProps<T> {
    columns: ColumnDef<T, unknown>[];
    data: T[];
    meta: Meta;
    links: Links;
    searchInput?: { columnId: string; placeholder: string };
    showFilters?: boolean;
    showActions?: boolean;
    filters?: TableFilter[];
    tableActions?: TableAction[];
    pageSizeOptions?: number[];
    defaultPageSizeOption?: number;
    storageKey?: string;
    showPagination?: boolean;
    showColumnsDropdown?: boolean;
    pageName?: string;
    pageSizeName?: string;
    sortName?: string;
    defaultSort?: string;
    emptyStateMeta?: EmptyStateMeta;
    getRowId?: (originalRow: T, index: number) => string;
    selectableRows?: {
        enabled: boolean;
        getRowId?: (originalRow: T, index: number) => string;
        bulkActions?: BulkTableAction<T>[];
    };
    draggableRows?: {
        enabled: boolean;
        onReorder: (movedRowId: string, newPosition: number) => void;
        handleColumnId?: string;
    };
    visitOptions?: TableVisitOptions;
    enableExpandedRows?: boolean;
    rowCanExpand?: (row: Row<T>) => boolean;
    renderExpandedRow?: (row: Row<T>) => ReactNode;
}

type ColumnMeta = {
    title?: string;
    hiddenByDefault?: boolean;
};

type TableCoreState<T> = {
    query: Query;
    setQuery: (updater: SetStateAction<Query>) => void;
    isSelectable: boolean;
    resolvedSearchInput: { columnId: string; placeholder: string } | null;
    searchFilterParam: string;
    handleSearchChange: (value: string) => void;
    selectedFilterValues: Record<string, string | undefined>;
    handleFilterChange: (param: string, value: unknown) => void;
    clearAllFilters: () => void;
    hasActiveFilters: boolean;
    activeFiltersCount: number;
    table: TanStackTable<T>;
    headerGroups: HeaderGroup<T>[];
    selectedRowCount: number;
    bulkActionContext: BulkTableActionContext<T>;
    hasRows: boolean;
    hasMultiselect: boolean;
    scrollContainerRef: RefObject<HTMLDivElement | null>;
    visibleRows: Row<T>[];
    visibleColumnCount: number;
    virtualizationEnabled: boolean;
    topPadding: number;
    bottomPadding: number;
    hasActiveSearch: boolean;
    hasActiveFiltersForEmptyState: boolean;
};

function filterValueToString(value: unknown): string | undefined {
    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return String(value);
    }

    return undefined;
}

function useDefaultColumnVisibility<TData>(
    columns: ColumnDef<TData, unknown>[],
): VisibilityState {
    return useMemo(() => {
        return columns.reduce<VisibilityState>((visibility, column) => {
            const meta = (column.meta ?? {}) as ColumnMeta;

            const identifier =
                ('id' in column && column.id ? String(column.id) : undefined) ??
                ('accessorKey' in column && column.accessorKey
                    ? String(column.accessorKey)
                    : undefined);

            if (meta?.hiddenByDefault && identifier) {
                visibility[identifier] = false;
            }
            return visibility;
        }, {});
    }, [columns]);
}

/**
 * Non-generic header cell to avoid generic + HOC pitfalls.
 */
type HeaderViewProps = {
    header: Header<unknown, unknown>;
};

function HeaderCell({ header }: HeaderViewProps) {
    const canSort = header.column.getCanSort();
    const headerContent = (
        <>
            {header.isPlaceholder
                ? null
                : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                  )}
            {canSort && (
                <span className="ml-2">
                    {{
                        asc: <ChevronUp className="h-4 w-4" />,
                        desc: <ChevronDown className="h-4 w-4" />,
                    }[header.column.getIsSorted() as string] ?? (
                        <ChevronsUpDown className="h-4 w-4" />
                    )}
                </span>
            )}
        </>
    );

    return (
        <TableHead
            className="text-muted-foreground"
            key={header.id}
            style={{ width: header.column.getSize() + 'px' }}
        >
            {canSort ? (
                <button
                    type="button"
                    className="flex w-full items-center text-left"
                    onClick={header.column.getToggleSortingHandler()}
                >
                    {headerContent}
                </button>
            ) : (
                <div className="flex items-center">{headerContent}</div>
            )}
        </TableHead>
    );
}

function useTableCoreState<T>({
    columns,
    data,
    searchInput,
    filters,
    storageKey,
    pageName = 'page',
    pageSizeName = 'pageSize',
    sortName = 'sort',
    defaultSort,
    getRowId,
    selectableRows,
    draggableRows,
    visitOptions,
    enableExpandedRows = false,
    rowCanExpand = () => false,
}: DataTableCoreProps<T>): TableCoreState<T> {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const isSelectable = selectableRows?.enabled === true;
    const selectionColumn = useMemo<ColumnDef<T, unknown> | null>(() => {
        if (!isSelectable) {
            return null;
        }

        return {
            id: 'select',
            enableSorting: false,
            enableHiding: false,
            size: 48,
            header: ({ table }) => {
                const allPageRowsSelected = table.getIsAllPageRowsSelected();
                const checked = allPageRowsSelected
                    ? true
                    : table.getIsSomePageRowsSelected()
                      ? 'indeterminate'
                      : false;
                const pageRowCount = table.getRowModel().rows.length;
                const pageSelectionLabel = allPageRowsSelected
                    ? 'Unselect this page'
                    : 'Select this page';

                return (
                    <div className="flex items-center gap-1">
                        <Checkbox
                            aria-label={pageSelectionLabel}
                            checked={checked}
                            onCheckedChange={(value) =>
                                table.toggleAllPageRowsSelected(Boolean(value))
                            }
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                type="button"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                                aria-label="Open row selection menu"
                            >
                                <ChevronDown className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    onClick={() =>
                                        table.toggleAllPageRowsSelected(
                                            !allPageRowsSelected,
                                        )
                                    }
                                >
                                    {pageSelectionLabel} ({pageRowCount})
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
            cell: ({ row }) => (
                <Checkbox
                    aria-label="Select row"
                    checked={rowSelection[row.id] === true}
                    disabled={!row.getCanSelect()}
                    onCheckedChange={(value) => {
                        setRowSelection((current) => ({
                            ...current,
                            [row.id]: value === true,
                        }));
                    }}
                />
            ),
        };
    }, [isSelectable, rowSelection]);
    const resolvedColumns = useMemo(
        () => (selectionColumn ? [selectionColumn, ...columns] : columns),
        [columns, selectionColumn],
    );
    const defaultColumnVisibility = useDefaultColumnVisibility(resolvedColumns);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        defaultColumnVisibility,
    );
    const [loadedVisibility, setLoadedVisibility] = useState<{
        storageKey?: string;
        defaults: VisibilityState;
    } | null>(null);
    const hasLoadedVisibility =
        loadedVisibility !== null &&
        loadedVisibility.storageKey === storageKey &&
        loadedVisibility.defaults === defaultColumnVisibility;
    const searchFilterParam = searchInput?.columnId ?? 'search';
    const filterParamKey = useMemo(() => {
        const params = filters?.map((filter) => filter.param) ?? [];

        if (searchInput?.columnId && !params.includes(searchFilterParam)) {
            params.push(searchFilterParam);
        }

        return params.join('|');
    }, [filters, searchFilterParam, searchInput?.columnId]);
    const filterParams = useMemo(
        () => (filterParamKey ? filterParamKey.split('|') : []),
        [filterParamKey],
    );
    const { query, setQuery, sorting, setSorting, setFilter, clearFilters } =
        useTableQueryState(
            filterParams,
            pageName,
            pageSizeName,
            sortName,
            defaultSort,
            visitOptions,
        );
    const hasMultiselect =
        isSelectable || columns.some((column) => column.id === 'select');
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable<T>({
        data,
        columns: resolvedColumns,
        getRowId: isSelectable
            ? (selectableRows?.getRowId ?? getRowId)
            : getRowId,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        ...(enableExpandedRows
            ? { getExpandedRowModel: getExpandedRowModel() }
            : {}),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getRowCanExpand: enableExpandedRows ? rowCanExpand : () => false,
        manualPagination: true,
        manualSorting: true,
        autoResetPageIndex: false,
        autoResetExpanded: false,
        initialState: { columnVisibility: defaultColumnVisibility },
        state: { sorting, columnFilters, columnVisibility, rowSelection },
    });

    useEffect(() => {
        let visibility = defaultColumnVisibility;

        if (storageKey) {
            try {
                const savedVisibility = window.localStorage.getItem(storageKey);
                if (savedVisibility) {
                    visibility = {
                        ...defaultColumnVisibility,
                        ...JSON.parse(savedVisibility),
                    };
                }
            } catch (error) {
                console.error(
                    'Error reading column visibility from localStorage',
                    error,
                );
            }
        }

        setColumnVisibility(visibility);
        setLoadedVisibility({ storageKey, defaults: defaultColumnVisibility });
    }, [defaultColumnVisibility, storageKey]);

    useEffect(() => {
        if (storageKey && hasLoadedVisibility) {
            try {
                window.localStorage.setItem(
                    storageKey,
                    JSON.stringify(columnVisibility),
                );
            } catch (error) {
                console.error(
                    'Error saving column visibility to localStorage',
                    error,
                );
            }
        }
    }, [columnVisibility, hasLoadedVisibility, storageKey]);

    const handleFilterChange = useCallback(
        (param: string, value: unknown) => {
            setFilter(param, value);
        },
        [setFilter],
    );

    const handleSearchChange = useCallback(
        (value: string) => {
            handleFilterChange(searchFilterParam, value);
        },
        [handleFilterChange, searchFilterParam],
    );

    const clearAllFilters = useCallback(() => {
        clearFilters();
    }, [clearFilters]);

    const selectedFilterValues = useMemo(() => {
        if (!filters?.length) return {} as Record<string, string | undefined>;

        return filters.reduce<Record<string, string | undefined>>(
            (accumulator, filter) => {
                const value = query.filter?.[filter.param];
                accumulator[filter.param] = filterValueToString(value);
                return accumulator;
            },
            {},
        );
    }, [filters, query.filter]);

    const { hasActiveFilters, activeFiltersCount } = useMemo(() => {
        const active = Object.values(selectedFilterValues).filter(Boolean);
        return {
            hasActiveFilters: active.length > 0,
            activeFiltersCount: active.length,
        };
    }, [selectedFilterValues]);

    const hasActiveSearch = useMemo(() => {
        const value = query.filter?.[searchFilterParam];
        return Boolean(filterValueToString(value)?.trim());
    }, [query.filter, searchFilterParam]);

    const hasActiveFiltersForEmptyState = useMemo(() => {
        return filterParams.some((param) => {
            const value = query.filter?.[param];
            return Boolean(filterValueToString(value)?.trim());
        });
    }, [filterParams, query.filter]);

    const resolvedSearchInput = useMemo(
        () => searchInput ?? null,
        [searchInput],
    );

    const rows = table.getRowModel().rows;
    const headerGroups = table.getHeaderGroups();
    const selectedIds = useMemo(
        () =>
            Object.entries(rowSelection)
                .filter(([, selected]) => selected)
                .map(([id]) => id),
        [rowSelection],
    );
    const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
    const selectedRowCount = selectedIds.length;
    const clearSelection = useCallback(() => setRowSelection({}), []);
    const bulkActionContext = useMemo<BulkTableActionContext<T>>(
        () => ({
            selectedIds,
            selectedRows,
            clearSelection,
        }),
        [clearSelection, selectedIds, selectedRows],
    );
    const hasRows = rows.length > 0;
    const visibleColumnCount =
        table.getVisibleLeafColumns().length || resolvedColumns.length || 1;
    const virtualizationEnabled = draggableRows?.enabled
        ? false
        : rows.length > VIRTUALIZATION_THRESHOLD;
    const {
        containerRef: scrollContainerRef,
        visibleRows,
        topPadding,
        bottomPadding,
    } = useVirtualRows(rows, virtualizationEnabled);

    return {
        query,
        setQuery,
        isSelectable,
        resolvedSearchInput,
        searchFilterParam,
        handleSearchChange,
        selectedFilterValues,
        handleFilterChange,
        clearAllFilters,
        hasActiveFilters,
        activeFiltersCount,
        table,
        headerGroups,
        selectedRowCount,
        bulkActionContext,
        hasRows,
        hasMultiselect,
        scrollContainerRef,
        visibleRows,
        visibleColumnCount,
        virtualizationEnabled,
        topPadding,
        bottomPadding,
        hasActiveSearch,
        hasActiveFiltersForEmptyState,
    };
}

export function TableCore<T>(props: DataTableCoreProps<T>) {
    const state = useTableCoreState(props);

    return <TableCoreView {...props} {...state} />;
}

type TableCoreViewProps<T> = DataTableCoreProps<T> & TableCoreState<T>;

function TableCoreView<T>({
    meta,
    links,
    showActions = false,
    filters,
    tableActions,
    pageSizeOptions = [20, 50, 100],
    defaultPageSizeOption = 20,
    showFilters = false,
    showColumnsDropdown = false,
    pageName = 'page',
    emptyStateMeta,
    selectableRows,
    draggableRows,
    showPagination = true,
    enableExpandedRows = false,
    renderExpandedRow,
    ...state
}: TableCoreViewProps<T>) {
    const {
        query,
        setQuery,
        isSelectable,
        resolvedSearchInput,
        searchFilterParam,
        handleSearchChange,
        selectedFilterValues,
        handleFilterChange,
        clearAllFilters,
        hasActiveFilters,
        activeFiltersCount,
        table,
        headerGroups,
        selectedRowCount,
        bulkActionContext,
        hasRows,
        hasMultiselect,
        scrollContainerRef,
        visibleRows,
        visibleColumnCount,
        virtualizationEnabled,
        topPadding,
        bottomPadding,
        hasActiveSearch,
        hasActiveFiltersForEmptyState,
    } = state;

    return (
        <div className="w-full">
            <div className="rounded-md border shadow-xs">
                <div className="flex flex-wrap items-center gap-2 px-4 py-4">
                    {resolvedSearchInput ? (
                        <TableSearchInput
                            value={
                                filterValueToString(
                                    query.filter?.[searchFilterParam],
                                ) ?? ''
                            }
                            onDebouncedChange={handleSearchChange}
                            placeholder={resolvedSearchInput.placeholder}
                        />
                    ) : null}

                    <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                        {isSelectable && selectedRowCount > 0 && (
                            <TableBulkActions
                                actions={selectableRows?.bulkActions}
                                context={bulkActionContext}
                                label="Bulk actions"
                            />
                        )}
                        {/* Actions */}
                        {showActions && hasRows && (
                            <TableActions actions={tableActions} />
                        )}
                        {/* Filters */}
                        {showFilters && (
                            <TableFilters
                                filters={filters}
                                selectedValues={selectedFilterValues}
                                onFilterChange={handleFilterChange}
                                onClearAll={clearAllFilters}
                                hasActiveFilters={hasActiveFilters}
                                activeFiltersCount={activeFiltersCount}
                            />
                        )}

                        {showColumnsDropdown && (
                            <TableViewColumns table={table} />
                        )}
                    </div>
                </div>

                <Separator />
                <TableCoreRows
                    scrollContainerRef={scrollContainerRef}
                    draggableRows={draggableRows}
                    visibleRows={visibleRows}
                    visibleColumnCount={visibleColumnCount}
                    virtualizationEnabled={virtualizationEnabled}
                    topPadding={topPadding}
                    bottomPadding={bottomPadding}
                    headerGroups={headerGroups}
                    hasRows={hasRows}
                    emptyStateMeta={emptyStateMeta}
                    hasActiveFiltersForEmptyState={
                        hasActiveFiltersForEmptyState
                    }
                    hasActiveSearch={hasActiveSearch}
                    enableExpandedRows={enableExpandedRows}
                    renderExpandedRow={renderExpandedRow}
                />
                <Separator />
                {hasRows && showPagination ? (
                    <>
                        <Separator />
                        <div className="px-4">
                            <TablePagination
                                meta={meta}
                                links={links}
                                setQuery={setQuery}
                                pageSizeOptions={pageSizeOptions}
                                selectedCount={selectedRowCount}
                                hasMultiselect={hasMultiselect}
                                defaultPageSizeOption={defaultPageSizeOption}
                                pageName={pageName}
                            />
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

type TableCoreRowsProps<T> = {
    scrollContainerRef: RefObject<HTMLDivElement | null>;
    draggableRows?: DataTableCoreProps<T>['draggableRows'];
    visibleRows: Row<T>[];
    visibleColumnCount: number;
    virtualizationEnabled: boolean;
    topPadding: number;
    bottomPadding: number;
    headerGroups: HeaderGroup<T>[];
    hasRows: boolean;
    emptyStateMeta?: EmptyStateMeta;
    hasActiveFiltersForEmptyState: boolean;
    hasActiveSearch: boolean;
    enableExpandedRows: boolean;
    renderExpandedRow?: (row: Row<T>) => ReactNode;
};

function TableCoreHeader<T>({
    headerGroups,
}: {
    headerGroups: HeaderGroup<T>[];
}) {
    return (
        <TableHeader className="bg-muted/50">
            {headerGroups.map((headerGroup) => (
                <TableRow
                    key={headerGroup.id}
                    className="[&>:first-child]:pl-4 [&>:last-child]:pr-4"
                >
                    {headerGroup.headers.map((header) => (
                        <HeaderCell
                            key={header.id}
                            header={header as Header<unknown, unknown>}
                        />
                    ))}
                </TableRow>
            ))}
        </TableHeader>
    );
}

function TableCoreEmpty<T>({
    visibleColumnCount,
    emptyStateMeta,
    hasActiveFiltersForEmptyState,
    hasActiveSearch,
}: Pick<
    TableCoreRowsProps<T>,
    | 'visibleColumnCount'
    | 'emptyStateMeta'
    | 'hasActiveFiltersForEmptyState'
    | 'hasActiveSearch'
>) {
    return (
        <EmptyTable
            colSpan={visibleColumnCount}
            title={emptyStateMeta?.title}
            description={emptyStateMeta?.description}
            hasButton={emptyStateMeta?.hasButton}
            buttonName={emptyStateMeta?.buttonName}
            buttonOnClick={emptyStateMeta?.buttonOnClick}
            hasActiveFilters={hasActiveFiltersForEmptyState || hasActiveSearch}
        />
    );
}

function TableCoreRows<T>({
    scrollContainerRef,
    draggableRows,
    visibleRows,
    visibleColumnCount,
    virtualizationEnabled,
    topPadding,
    bottomPadding,
    headerGroups,
    hasRows,
    emptyStateMeta,
    hasActiveFiltersForEmptyState,
    hasActiveSearch,
    enableExpandedRows,
    renderExpandedRow,
}: TableCoreRowsProps<T>) {
    const emptyState = (
        <TableCoreEmpty
            visibleColumnCount={visibleColumnCount}
            emptyStateMeta={emptyStateMeta}
            hasActiveFiltersForEmptyState={hasActiveFiltersForEmptyState}
            hasActiveSearch={hasActiveSearch}
        />
    );

    return (
        <div
            ref={scrollContainerRef}
            className={cn('relative max-h-245 overflow-auto')}
        >
            {draggableRows?.enabled ? (
                <DraggableTableProvider
                    rows={visibleRows}
                    onReorder={draggableRows.onReorder}
                >
                    <Table>
                        {hasRows && (
                            <TableCoreHeader headerGroups={headerGroups} />
                        )}
                        {hasRows ? (
                            <DraggableTableBody
                                rows={visibleRows}
                                visibleColumnCount={visibleColumnCount}
                                virtualizationEnabled={virtualizationEnabled}
                                topPadding={topPadding}
                                bottomPadding={bottomPadding}
                                dragHandleColumnId={
                                    draggableRows.handleColumnId
                                }
                            />
                        ) : (
                            emptyState
                        )}
                    </Table>
                </DraggableTableProvider>
            ) : (
                <Table>
                    {hasRows && <TableCoreHeader headerGroups={headerGroups} />}
                    {hasRows ? (
                        <TableBody>
                            {virtualizationEnabled && topPadding > 0 ? (
                                <TableRow className="bg-muted/30">
                                    <TableCell
                                        colSpan={visibleColumnCount}
                                        className="p-0"
                                        style={{ height: topPadding }}
                                    />
                                </TableRow>
                            ) : null}

                            {visibleRows.map((row) => (
                                <Fragment key={row.id}>
                                    <TableRow
                                        data-state={
                                            row.getIsSelected() && 'selected'
                                        }
                                        className="[&>:first-child]:pl-4 [&>:last-child]:pr-4"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {enableExpandedRows &&
                                    row.getIsExpanded() &&
                                    renderExpandedRow ? (
                                        <TableRow className="bg-muted/20">
                                            <TableCell
                                                colSpan={visibleColumnCount}
                                                className="min-w-0 px-4 py-3 whitespace-normal"
                                            >
                                                {renderExpandedRow(row)}
                                            </TableCell>
                                        </TableRow>
                                    ) : null}
                                </Fragment>
                            ))}

                            {virtualizationEnabled && bottomPadding > 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={visibleColumnCount}
                                        className="p-0"
                                        style={{ height: bottomPadding }}
                                    />
                                </TableRow>
                            ) : null}
                        </TableBody>
                    ) : (
                        emptyState
                    )}
                </Table>
            )}
        </div>
    );
}
