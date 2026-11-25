import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ReactNode } from 'react';

interface FilterPopoverProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEditing: boolean;
    trigger: ReactNode;
    children: ReactNode;
}

export function FilterPopover({
    open,
    onOpenChange,
    isEditing,
    trigger,
    children,
}: FilterPopoverProps) {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-80 p-0"
                // opened from a chip straight into an editor, which has already taken focus
                onOpenAutoFocus={(event) => isEditing && event.preventDefault()}
            >
                {children}
            </PopoverContent>
        </Popover>
    );
}
