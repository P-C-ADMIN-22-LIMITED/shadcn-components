import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Row } from '@tanstack/react-table';
import { ReactNode, useCallback } from 'react';

type DraggableTableProviderProps<T> = {
    rows: Row<T>[];
    onReorder: (movedRowId: string, newPosition: number) => void;
    children: ReactNode;
};

export function DraggableTableProvider<T>({
    rows,
    onReorder,
    children,
}: DraggableTableProviderProps<T>) {
    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = useCallback(
        (event: DragEndEvent): void => {
            if (!event.over || event.active.id === event.over.id) {
                return;
            }

            const movedRowId = String(event.active.id);
            const oldIndex = rows.findIndex((row) => row.id === movedRowId);
            const newPosition = rows.findIndex(
                (row) => row.id === String(event.over?.id),
            );

            if (oldIndex === -1 || newPosition === -1) {
                return;
            }

            onReorder(movedRowId, newPosition);
        },
        [onReorder, rows],
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            {children}
        </DndContext>
    );
}
