import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslations } from '@/hooks/use-translations';
import { format, isValid, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import type { TableFilterEditorProps } from './types';

export function TableFiltersDateRange({
    selectedValue,
    onValueChange,
}: TableFilterEditorProps) {
    // Parse selectedValue safely
    const [date, setDate] = useState<DateRange | undefined>();
    const { trans } = useTranslations();
    const isMobile = useIsMobile();
    useEffect(() => {
        if (selectedValue) {
            const parts = selectedValue.split(',').map((s) => s.trim());
            const from =
                parts[0] && isValid(parseISO(parts[0]))
                    ? parseISO(parts[0])
                    : undefined;
            const to =
                parts[1] && isValid(parseISO(parts[1]))
                    ? parseISO(parts[1])
                    : undefined;
            setDate({ from, to });
        } else {
            setDate(undefined);
        }
    }, [selectedValue]);

    const handleSelect = (range: DateRange | undefined) => {
        setDate(range);
        if (range?.from && range?.to) {
            onValueChange(
                `${format(range.from, 'yyyy-MM-dd')},${format(range.to, 'yyyy-MM-dd')}`,
            );
        } else if (range?.from) {
            onValueChange(`${format(range.from, 'yyyy-MM-dd')},`);
        } else {
            onValueChange('');
        }
    };

    return (
        <div className="grid gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !date && 'text-muted-foreground',
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, 'LLL dd, y')} –{' '}
                                    {format(date.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(date.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>
                                {trans(
                                    'admin.data_table.table_filters.pick_a_date',
                                )}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="range"
                        selected={date}
                        onSelect={handleSelect}
                        numberOfMonths={isMobile ? 1 : 2}
                        captionLayout="label"
                        className="w-full"
                        showOutsideDays={false}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
