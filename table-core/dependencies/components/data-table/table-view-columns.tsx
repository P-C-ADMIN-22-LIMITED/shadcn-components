import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslations } from '@/hooks/use-translations';
import { Column, Table } from '@tanstack/react-table';
import { Check, Settings2 } from 'lucide-react';
import { ComponentProps } from 'react';

interface TableViewColumns<TData> extends ComponentProps<
    typeof PopoverContent
> {
    table: Table<TData>;
    disabled?: boolean;
}

function getColumnLabel<TData>(column: Column<TData>): string {
    if (typeof column.columnDef.header === 'string') {
        return column.columnDef.header;
    }

    const meta = column.columnDef.meta as { title?: string } | undefined;

    return meta?.title ?? column.id;
}

export function TableViewColumns<TData>({
    table,
    disabled,
    ...props
}: TableViewColumns<TData>) {
    const columnVisibility = table.getState().columnVisibility;
    const toggleableColumns = table
        .getAllColumns()
        .filter((column) => column.getCanHide());
    const visibleColumnsCount = toggleableColumns.filter((column) =>
        column.getIsVisible(),
    ).length;
    const columnsCount = toggleableColumns.length;
    const { trans } = useTranslations();
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    aria-label="Toggle columns"
                    role="combobox"
                    variant="outline"
                    size="sm"
                    className="ml-auto flex h-8 font-normal"
                    disabled={disabled}
                >
                    <Settings2 className="text-muted-foreground" />
                    {trans('admin.data_table.view_columns.view')}
                    <span className="text-muted-foreground">
                        {visibleColumnsCount}/{columnsCount}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0" {...props} align={'end'}>
                <Command>
                    <CommandInput placeholder="Search columns..." />
                    <CommandList>
                        <CommandEmpty>No columns found.</CommandEmpty>
                        <CommandGroup>
                            {toggleableColumns.map((column) => (
                                <CommandItem
                                    key={`${column.id}-${columnVisibility?.[column.id] ? 'visible' : 'hidden'}`}
                                    onSelect={() =>
                                        column.toggleVisibility(
                                            !column.getIsVisible(),
                                        )
                                    }
                                >
                                    <span className="truncate">
                                        {getColumnLabel(column)}
                                    </span>
                                    <span className="ml-auto flex size-4 items-center justify-center">
                                        {column.getIsVisible() ? (
                                            <Check className="size-4 text-muted-foreground" />
                                        ) : null}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
