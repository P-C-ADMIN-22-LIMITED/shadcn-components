import { cn } from '@/lib/utils';
import {
    Drawer,
    DrawerContent,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { ReactNode } from 'react';
import type { WithFadeFromProps } from 'vaul';
import { useTranslations } from '@/hooks/use-translations';

// the sheet is 88dvh tall so a strip of page stays above it to tap and close, vaul measures snaps from the sheet's own top,
// so the peek sits at 0.68 to still show 56dvh (68dvh minus the 12dvh gap)
export const SHEET_PEEK = 0.68;
export const SHEET_FULL = 1;
// up to this many filters fit without scrolling, so the sheet fits its content instead of opening at the snap points
export const COMPACT_SHEET_MAX_FILTERS = 3;

export type SheetSnap = number | string | null;

interface FilterSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    snap: SheetSnap;
    onSnapChange: (snap: SheetSnap) => void;
    isEditing: boolean;
    compact: boolean;
    trigger: ReactNode;
    children: ReactNode;
}

export function FilterSheet({
    open,
    onOpenChange,
    snap,
    onSnapChange,
    isEditing,
    compact,
    trigger,
    children,
}: FilterSheetProps) {
    const { trans } = useTranslations();

    const snapProps: WithFadeFromProps | Record<string, never> = compact
        ? {}
        : { snapPoints: [SHEET_PEEK, SHEET_FULL], fadeFromIndex: 0 };

    const focusSheetWithoutKeyboard = (event: Event) => {
        event.preventDefault();
        if (!isEditing) {
            (event.target as HTMLElement).focus();
        }
    };

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            {...snapProps}
            activeSnapPoint={compact ? undefined : snap}
            setActiveSnapPoint={compact ? undefined : onSnapChange}
            // at a lower snap point vaul turns every swipe on the content into a drag, so only the handle drags and the list can scroll
            handleOnly
            // vaul's keyboard repositioning adds the snap offset on top of the keyboard height and pushes the sheet off screen
            repositionInputs={false}
        >
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
            <DrawerContent
                aria-describedby={undefined}
                className={cn(
                    'data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-[88dvh]',
                    !compact && 'h-full',
                )}
                onOpenAutoFocus={focusSheetWithoutKeyboard}
            >
                {/* the filter panel shows the visible title next to its reset action */}
                <DrawerTitle className="sr-only">
                    {trans('admin.data_table.table_filters.label')}
                </DrawerTitle>
                <div
                    data-testid="filters-sheet-body"
                    // cap the panel to the visible part of the sheet minus the handle so the apply button stays on screen, and ease the cap
                    // with vaul's own slide (0.5s, same curve) so the button stays pinned to the bottom while the sheet changes snap
                    className={cn(
                        'flex min-h-0 flex-1 flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] transition-[max-height] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                        compact || snap === SHEET_FULL
                            ? 'max-h-[calc(88dvh-1.625rem)]'
                            : 'max-h-[calc(56dvh-1.625rem)]',
                    )}
                >
                    {children}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
