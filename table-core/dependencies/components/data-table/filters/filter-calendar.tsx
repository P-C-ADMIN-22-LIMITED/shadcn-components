import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverAnchor,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useSyncedDraft } from '@/hooks/use-synced-draft';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import type { TableFilterEditorProps } from './types';
import { toCalendarDraft } from '@/components/data-table/filters/table-filters.utils';

export function TableFiltersCalendar({
    filter,
    selectedValue,
    onValueChange,
}: TableFilterEditorProps) {
    const [open, setOpen] = useState(false);
    const [{ inputValue, month }, setDraft] = useSyncedDraft(
        selectedValue,
        toCalendarDraft,
    );

    const setInputValue = (value: string) =>
        setDraft((draft) => ({ ...draft, inputValue: value }));
    const setMonth = (value: Date) =>
        setDraft((draft) => ({ ...draft, month: value }));

    const handleSelect = (date: Date | undefined) => {
        setOpen(false);
        if (date) {
            onValueChange(format(date, 'yyyy-MM-dd'));
        } else {
            onValueChange(undefined);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        try {
            const parsedDate = new Date(value);
            if (!isNaN(parsedDate.getTime())) {
                onValueChange(format(parsedDate, 'yyyy-MM-dd'));
                setMonth(parsedDate);
            } else {
                onValueChange(undefined);
            }
        } catch (e: unknown) {
            console.error('calendar handle input filter error: ', e);
            onValueChange(undefined);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
                <div className="relative">
                    <Input
                        id={filter.param}
                        placeholder={filter.label}
                        value={inputValue}
                        onChange={handleInputChange}
                        className="bg-background pr-10"
                    />
                    <PopoverTrigger asChild>
                        <Button
                            id={`${filter.param}-date-picker`}
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">Select date</span>
                        </Button>
                    </PopoverTrigger>
                </div>
            </PopoverAnchor>
            <PopoverContent
                className="p-0 max-md:w-auto md:w-[var(--radix-popover-trigger-width)]"
                align="start"
            >
                <Calendar
                    mode="single"
                    selected={
                        selectedValue ? new Date(selectedValue) : undefined
                    }
                    onSelect={handleSelect}
                    captionLayout="dropdown"
                    month={month}
                    onMonthChange={setMonth}
                    className="w-full"
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
}
