import { cn } from '@/lib/utils';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { flexRender, Row } from '@tanstack/react-table';
import { GripVertical } from 'lucide-react';
import { TableBody, TableCell, TableRow } from '../ui/table';

type SortableBodyRowProps<T> = {
    row: Row<T>;
    dragHandleColumnId?: string;
};

function SortableBodyRow<T>({
    row,
    dragHandleColumnId,
}: SortableBodyRowProps<T>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: row.id });
    const hasDragHandle = dragHandleColumnId != null;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition:
            isDragging || !transition
                ? undefined
                : 'transform 220ms cubic-bezier(0.2, 0, 0, 1)',
        willChange: transform ? 'transform' : undefined,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            data-state={row.getIsSelected() && 'selected'}
            className={cn(
                'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted [&>:first-child]:pl-4 [&>:last-child]:pr-4',
                isDragging ? 'bg-muted/70' : '',
            )}
            {...(!hasDragHandle ? attributes : {})}
            {...(!hasDragHandle ? listeners : {})}
        >
            {row.getVisibleCells().map((cell) => {
                const isDragHandleCell =
                    dragHandleColumnId != null &&
                    cell.column.id === dragHandleColumnId;

                return (
                    <TableCell key={cell.id}>
                        {isDragHandleCell ? (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    aria-label="Drag row"
                                    className="inline-flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted/80 hover:text-foreground active:cursor-grabbing"
                                    {...attributes}
                                    {...listeners}
                                >
                                    <GripVertical className="size-4" />
                                </button>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                )}
                            </div>
                        ) : (
                            flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                            )
                        )}
                    </TableCell>
                );
            })}
        </tr>
    );
}

type DraggableTableBodyProps<T> = {
    rows: Row<T>[];
    visibleColumnCount: number;
    virtualizationEnabled: boolean;
    topPadding: number;
    bottomPadding: number;
    dragHandleColumnId?: string;
};

export function DraggableTableBody<T>({
    rows,
    visibleColumnCount,
    virtualizationEnabled,
    topPadding,
    bottomPadding,
    dragHandleColumnId,
}: DraggableTableBodyProps<T>) {
    return (
        <TableBody>
            <>
                {virtualizationEnabled && topPadding > 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={visibleColumnCount}
                            className="p-0"
                            style={{ height: topPadding }}
                        />
                    </TableRow>
                ) : null}

                <SortableContext
                    items={rows.map((row) => row.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {rows.map((row) => (
                        <SortableBodyRow
                            key={row.id}
                            row={row}
                            dragHandleColumnId={dragHandleColumnId}
                        />
                    ))}
                </SortableContext>

                {virtualizationEnabled && bottomPadding > 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={visibleColumnCount}
                            className="p-0"
                            style={{ height: bottomPadding }}
                        />
                    </TableRow>
                ) : null}
            </>
        </TableBody>
    );
}
