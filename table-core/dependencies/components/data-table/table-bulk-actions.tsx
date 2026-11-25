import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { ZapIcon } from 'lucide-react';
import type { ComponentType, ReactElement } from 'react';
import { memo, useMemo, useState } from 'react';

export type BulkTableActionContext<T> = {
    selectedIds: string[];
    selectedRows: T[];
    clearSelection: () => void;
};

export interface BulkTableAction<T> {
    label: string;
    icon?: ComponentType<{ className?: string }>;
    isDestructive?: boolean;
    confirmation?: {
        title: string;
        description: string;
        confirmText: string;
        cancelText?: string;
    };
    visible?: (context: BulkTableActionContext<T>) => boolean;
    disabled?: boolean | ((context: BulkTableActionContext<T>) => boolean);
    onClick: (context: BulkTableActionContext<T>) => void;
}

export interface TableBulkActionsProps<T> {
    actions?: BulkTableAction<T>[];
    context: BulkTableActionContext<T>;
    label: string;
}

function TableBulkActionsComponent<T>({
    actions,
    context,
    label,
}: TableBulkActionsProps<T>) {
    const { trans } = useTranslations();
    const [confirmingAction, setConfirmingAction] =
        useState<BulkTableAction<T> | null>(null);
    const items = useMemo(() => {
        return (actions ?? []).filter(
            (action) => action.visible?.(context) ?? true,
        );
    }, [actions, context]);

    if (!items.length || context.selectedIds.length === 0) {
        return null;
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 font-normal"
                    >
                        <ZapIcon className="text-muted-foreground" />
                        <span>{label}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {items.map((action) => {
                        const ActionIcon = action.icon;
                        const disabled =
                            typeof action.disabled === 'function'
                                ? action.disabled(context)
                                : (action.disabled ?? false);

                        return (
                            <DropdownMenuItem
                                key={action.label}
                                className={cn(
                                    action.isDestructive
                                        ? 'text-destructive'
                                        : '',
                                )}
                                disabled={disabled}
                                onClick={() => {
                                    if (action.confirmation) {
                                        setConfirmingAction(action);
                                        return;
                                    }

                                    action.onClick(context);
                                }}
                            >
                                {ActionIcon ? (
                                    <ActionIcon className="size-4" />
                                ) : null}
                                {action.label}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog
                open={confirmingAction !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmingAction(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmingAction?.confirmation?.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmingAction?.confirmation?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {confirmingAction?.confirmation?.cancelText ??
                                trans('admin.common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant={
                                confirmingAction?.isDestructive
                                    ? 'destructive'
                                    : 'default'
                            }
                            onClick={() => {
                                confirmingAction?.onClick(context);
                                setConfirmingAction(null);
                            }}
                        >
                            {confirmingAction?.confirmation?.confirmText}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export const TableBulkActions = memo(TableBulkActionsComponent) as <T>(
    props: TableBulkActionsProps<T>,
) => ReactElement | null;
