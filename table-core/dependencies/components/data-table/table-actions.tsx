import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { ZapIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import { memo, useMemo } from 'react';

type TableActionIcon = ComponentType<{
    className?: string;
    'data-icon'?: 'inline-start' | 'inline-end';
}>;

export interface TableAction {
    label: string;
    icon?: TableActionIcon;
    onClick?: () => void;
    id?: string;
    dataButton?: string;
    display?: 'dropdown' | 'standalone';
    isDestructive?: boolean;
    tooltip?: string;
    showLabel?: boolean;
    disabled?: boolean;
}
export interface TableActionsProps {
    actions?: TableAction[];
}

type StandaloneTableActionButtonProps = {
    id?: string;
    dataButton?: string;
    isDestructive?: boolean;
    tooltip?: string;
    label: string;
    Icon?: TableActionIcon;
    showLabel?: boolean;
    disabled?: boolean;
    onClick?: () => void;
};

const StandaloneTableActionButton = memo(function StandaloneTableActionButton({
    id,
    dataButton,
    isDestructive,
    tooltip,
    label,
    Icon,
    showLabel,
    disabled,
    onClick,
}: StandaloneTableActionButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    id={id}
                    data-button={dataButton}
                    type="button"
                    variant={showLabel ? 'outline' : 'ghost'}
                    size="sm"
                    onClick={onClick}
                    className={cn(
                        'flex h-8 items-center justify-center',
                        showLabel ? 'px-2.5' : 'w-8',
                        isDestructive &&
                            'text-destructive hover:bg-destructive/10 hover:text-destructive',
                    )}
                    aria-label={tooltip ?? label}
                    disabled={disabled}
                >
                    {Icon && (
                        <Icon
                            className={cn(
                                'size-5',
                                isDestructive
                                    ? 'text-destructive'
                                    : 'text-muted-foreground',
                            )}
                        />
                    )}
                    {showLabel && label}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip ?? label}</p>
            </TooltipContent>
        </Tooltip>
    );
});

function TableActionsComponent({ actions }: TableActionsProps) {
    const isMobile = useIsMobile();
    const items = useMemo(() => actions ?? [], [actions]);
    const { trans } = useTranslations();
    const { standaloneActions, dropdownActions } = useMemo(() => {
        const standalone: TableAction[] = [];
        const dropdown: TableAction[] = [];

        items.forEach((action) => {
            if (action.display === 'standalone') {
                standalone.push(action);
            } else {
                dropdown.push(action);
            }
        });

        return { standaloneActions: standalone, dropdownActions: dropdown };
    }, [items]);

    if (!items.length) {
        return null;
    }

    const standaloneButtons = standaloneActions.map((action) => (
        <StandaloneTableActionButton
            key={action.id ?? action.label}
            id={action.id}
            dataButton={action.dataButton}
            isDestructive={action.isDestructive}
            tooltip={action.tooltip ?? action.label}
            label={action.label}
            Icon={action.icon}
            showLabel={action.showLabel}
            disabled={action.disabled}
            onClick={action.onClick}
        />
    ));

    return (
        <div className="flex items-center gap-2">
            {standaloneButtons}
            {dropdownActions.length > 0 ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto h-8 font-normal lg:flex"
                        >
                            <ZapIcon className="text-muted-foreground" />
                            <span>
                                {trans('admin.data_table.table_actions.label')}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isMobile ? 'center' : 'end'}>
                        {dropdownActions.map((action) => {
                            const ActionIcon = action.icon;
                            return (
                                <DropdownMenuItem
                                    key={action.id ?? action.label}
                                    onClick={action.onClick}
                                    disabled={action.disabled}
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
            ) : null}
        </div>
    );
}

const TableActions = memo(TableActionsComponent);

TableActions.displayName = 'TableActions';

export default TableActions;
