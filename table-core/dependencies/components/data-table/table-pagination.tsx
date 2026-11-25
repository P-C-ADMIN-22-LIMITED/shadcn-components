import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { Links } from '@/types/resource/links';
import { Meta } from '@/types/resource/meta';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import { Dispatch, SetStateAction, memo, useCallback, useMemo } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

type QueryState = {
    page?: number;
    cursor?: string | null;
    filter: Record<string, unknown>;
    sort?: string;
    pageSize?: number;
};

type TablePaginationProps = {
    links: Links;
    meta: Meta;
    setQuery: Dispatch<SetStateAction<QueryState>>;
    selectedCount?: number;
    pageSizeOptions?: number[];
    hasMultiselect?: boolean;
    defaultPageSizeOption?: number;
    pageName?: string;
};

function TablePaginationComponent({
    links,
    meta,
    setQuery,
    selectedCount = 0,
    pageSizeOptions = [20, 30, 50, 100],
    hasMultiselect = false,
    defaultPageSizeOption = 20,
    pageName = 'page',
}: TablePaginationProps) {
    const { trans, transChoice } = useTranslations();
    const isCursor = meta.nextCursor != null || meta.prevCursor != null;

    const getPageFromUrl = useCallback(
        (url: string | null | undefined): number | null => {
            if (!url) return null;
            try {
                const urlObject = new URL(url);
                const page = urlObject.searchParams.get(pageName);
                return page ? Number(page) : 1;
            } catch {
                return null;
            }
        },
        [pageName],
    );

    const handlePageChange = useCallback(
        (page: number | null) => {
            if (!page) return;
            setQuery((prev) => ({ ...prev, page, cursor: null }));
        },
        [setQuery],
    );

    const handleCursorChange = useCallback(
        (cursor: string | null) => {
            if (cursor == null) return;
            setQuery((prev) => ({ ...prev, cursor, page: undefined }));
        },
        [setQuery],
    );

    const handlePerPageChange = useCallback(
        (value: string) => {
            setQuery((prev) => ({
                ...prev,
                pageSize: Number(value),
                page: 1,
                cursor: null,
            }));
        },
        [setQuery],
    );

    const { currentPage, totalPages, perPage } = useMemo(() => {
        const resolvedPerPage = meta.perPage ?? defaultPageSizeOption;

        if (isCursor || !meta.currentPage) {
            return {
                currentPage: 1,
                totalPages: 1,
                perPage: resolvedPerPage,
            };
        }

        return {
            currentPage: meta.currentPage,
            totalPages: meta.lastPage ?? meta.currentPage ?? 1,
            perPage: resolvedPerPage,
        };
    }, [
        defaultPageSizeOption,
        isCursor,
        meta.currentPage,
        meta.lastPage,
        meta.perPage,
    ]);

    return (
        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 text-sm max-sm:justify-start">
            <div className="text-neutral-600 max-sm:w-full max-sm:empty:hidden">
                {hasMultiselect && (
                    <span>
                        {transChoice(
                            'admin.data_table.pagination.selected_rows',
                            selectedCount,
                            {
                                count: selectedCount,
                                total: meta.to ?? meta.total,
                            },
                        )}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap">
                        {trans('admin.data_table.pagination.rows_per_page')}
                    </span>
                    <Select
                        defaultValue={String(perPage)}
                        onValueChange={handlePerPageChange}
                    >
                        <SelectTrigger className="h-8 w-18">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions?.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {!isCursor ? (
                    <>
                        <span className="text-sm font-medium whitespace-nowrap">
                            {trans('admin.data_table.pagination.page_of', {
                                current: currentPage,
                                total: totalPages,
                            })}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={trans(
                                'admin.data_table.pagination.first_page',
                            )}
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={trans(
                                'admin.data_table.pagination.previous_page',
                            )}
                            onClick={() =>
                                handlePageChange(getPageFromUrl(links.prev))
                            }
                            disabled={!links.prev}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={trans(
                                'admin.data_table.pagination.next_page',
                            )}
                            onClick={() =>
                                handlePageChange(getPageFromUrl(links.next))
                            }
                            disabled={!links.next}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={trans(
                                'admin.data_table.pagination.last_page',
                            )}
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={trans(
                                'admin.data_table.pagination.previous_page',
                            )}
                            onClick={() =>
                                handleCursorChange(meta.prevCursor ?? null)
                            }
                            disabled={!meta.prevCursor}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={trans(
                                'admin.data_table.pagination.next_page',
                            )}
                            onClick={() =>
                                handleCursorChange(meta.nextCursor ?? null)
                            }
                            disabled={!meta.nextCursor}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export const TablePagination = memo(TablePaginationComponent);

TablePagination.displayName = 'TablePagination';
