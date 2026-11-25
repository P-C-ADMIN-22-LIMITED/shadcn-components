import { router, usePage } from '@inertiajs/react';
import { SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type TableVisitOptions = NonNullable<Parameters<typeof router.get>[2]>;
type QueryParamValue = string | number | boolean;

export type Query = {
    page?: number;
    cursor?: string | null;
    pageSize?: number;
    sort?: string;
    filter: Record<string, unknown>;
};

// Extract URL parsing to avoid recreation
const parseInitialQuery = (
    filterParams?: string[],
    pageName = 'page',
    pageSizeName = 'pageSize',
    sortName = 'sort',
    defaultSort?: string,
    currentUrl = '/',
): Query => {
    const searchParams = new URL(currentUrl, 'http://localhost').searchParams;
    const initial: Query = { filter: {} };

    if (searchParams.has(pageName))
        initial.page = Number(searchParams.get(pageName));
    if (searchParams.has('cursor')) {
        initial.cursor = searchParams.get('cursor');
        initial.page = undefined;
    }
    if (searchParams.has(pageSizeName))
        initial.pageSize = Number(searchParams.get(pageSizeName));
    if (searchParams.has(sortName)) {
        initial.sort = searchParams.get(sortName) || undefined;
    } else if (defaultSort) {
        initial.sort = defaultSort;
    }

    filterParams?.forEach((param) => {
        const key = `filter[${param}]`;
        if (searchParams.has(key)) {
            initial.filter[param] = searchParams.get(key) as string;
        }
    });

    return initial;
};

// Extract sorting state parsing
const parseSortingFromQuery = (sort?: string): SortingState => {
    if (!sort) return [];
    const desc = sort.startsWith('-');
    const id = desc ? sort.slice(1) : sort;
    return [{ id, desc }];
};

const areSortingStatesEqual = (a?: SortingState, b?: SortingState): boolean => {
    if (!a?.length && !b?.length) {
        return true;
    }

    if (!a || !b) {
        return false;
    }

    if (a.length !== b.length) {
        return false;
    }

    return a.every((item, index) => {
        const other = b[index];
        return !!other && item.id === other.id && item.desc === other.desc;
    });
};

export function useTableQueryState(
    filterParams?: string[],
    pageName = 'page',
    pageSizeName = 'pageSize',
    sortName = 'sort',
    defaultSort?: string,
    visitOptions?: TableVisitOptions,
) {
    const currentUrl = usePage().url;

    // Memoize filter params to prevent unnecessary recalculations
    const stableFilterParams = useMemo(
        () => filterParams ?? [],
        [filterParams],
    );

    // Initialize state only once
    const [query, setQuery] = useState<Query>(() =>
        parseInitialQuery(
            stableFilterParams,
            pageName,
            pageSizeName,
            sortName,
            defaultSort,
            currentUrl,
        ),
    );
    const [sorting, setSortingState] = useState<SortingState>(() =>
        parseSortingFromQuery(query.sort),
    );

    const isFirst = useRef(true);

    const routerTimeoutRef = useRef<number | null>(null);

    const updateRouter = useCallback(
        (queryState: Query) => {
            const params: Record<string, QueryParamValue> = {};
            const currentSearchParams = new URLSearchParams(
                window.location.search,
            );

            currentSearchParams.forEach((value, key) => {
                params[key] = value;
            });

            delete params.cursor;
            delete params[pageName];
            delete params[pageSizeName];
            delete params[sortName];

            stableFilterParams.forEach((param) => {
                delete params[`filter[${param}]`];
            });

            if (queryState.cursor) {
                params.cursor = queryState.cursor;
            } else if (queryState.page && queryState.page > 1) {
                params[pageName] = queryState.page;
            }

            if (queryState.pageSize) {
                params[pageSizeName] = queryState.pageSize;
            }

            if (queryState.sort) {
                params[sortName] = queryState.sort;
            }

            Object.entries(queryState.filter).forEach(([key, value]) => {
                if (
                    (typeof value === 'string' && value !== '') ||
                    typeof value === 'number' ||
                    typeof value === 'boolean'
                ) {
                    params[`filter[${key}]`] = value;
                }
            });

            const nextSearchParams = new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    nextSearchParams.set(key, String(value));
                }
            });

            if (
                currentSearchParams.toString() === nextSearchParams.toString()
            ) {
                return;
            }

            router.get(window.location.pathname, params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                ...visitOptions,
            });
        },
        [pageName, pageSizeName, stableFilterParams, sortName, visitOptions],
    );

    // Effect with debounced router updates
    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        if (routerTimeoutRef.current) {
            clearTimeout(routerTimeoutRef.current);
        }

        routerTimeoutRef.current = window.setTimeout(() => {
            updateRouter(query);
            routerTimeoutRef.current = null;
        }, 150);

        // Cleanup timeout on unmount
        return () => {
            if (routerTimeoutRef.current) {
                clearTimeout(routerTimeoutRef.current);
                routerTimeoutRef.current = null;
            }
        };
    }, [query, updateRouter]);

    const handleSortingChange = useCallback(
        (updater: SortingState | ((old: SortingState) => SortingState)) => {
            const next =
                typeof updater === 'function' ? updater(sorting) : updater;

            if (areSortingStatesEqual(next, sorting)) {
                return;
            }

            setSortingState(next);

            if (next.length) {
                const { id, desc } = next[0];
                const sortValue = desc ? `-${id}` : id;

                setQuery((prev) => ({
                    ...prev,
                    page: 1,
                    cursor: null,
                    sort: sortValue,
                }));
            } else {
                setQuery((prev) => ({
                    ...prev,
                    page: 1,
                    cursor: null,
                    sort: undefined,
                }));
            }
        },
        [setQuery, sorting],
    );
    // Optimized filter setter with shallow comparison
    const setFilter = useCallback((param: string, value: unknown) => {
        setQuery((prev) => {
            // Skip update if value hasn't changed
            if (prev.filter[param] === value) {
                return prev;
            }

            return {
                ...prev,
                page: 1,
                cursor: null,
                filter: { ...prev.filter, [param]: value },
            };
        });
    }, []);

    // Optimized clear filters
    const clearFilters = useCallback(() => {
        setQuery((prev) => {
            // Skip if already empty
            if (Object.keys(prev.filter).length === 0) {
                return prev;
            }

            return {
                ...prev,
                page: 1,
                cursor: null,
                filter: {},
            };
        });
    }, []);

    // Optimized pagination handlers
    const goToPage = useCallback((page: number | null | undefined) => {
        if (!page) return;

        setQuery((prev) => {
            if (prev.page === page) return prev; // Skip if same page
            return { ...prev, page, cursor: null };
        });
    }, []);

    const goToCursor = useCallback((cursor: string | null | undefined) => {
        if (!cursor) return;

        setQuery((prev) => {
            if (prev.cursor === cursor) return prev; // Skip if same cursor
            return { ...prev, cursor, page: undefined };
        });
    }, []);

    const setPerPage = useCallback((per: number) => {
        setQuery((prev) => {
            if (prev.pageSize === per) return prev; // Skip if same page size
            return {
                ...prev,
                pageSize: per,
                page: 1,
                cursor: null,
            };
        });
    }, []);

    return useMemo(
        () => ({
            query,
            setQuery,
            sorting,
            setSorting: handleSortingChange,
            setFilter,
            clearFilters,
            filterParams: stableFilterParams,
            goToPage,
            goToCursor,
            setPerPage,
        }),
        [
            query,
            sorting,
            handleSortingChange,
            setFilter,
            clearFilters,
            stableFilterParams,
            goToPage,
            goToCursor,
            setPerPage,
        ],
    );
}
