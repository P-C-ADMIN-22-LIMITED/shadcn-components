'use client';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format, isValid, parse } from 'date-fns';
import { Calendar } from 'lucide-react';
import * as React from 'react';
import { useSyncedDraft } from '@/hooks/use-synced-draft';

interface DatePickerInputProps {
    dateFormat?: string;
    value?: Date | undefined;
    onChange?: (date: Date | null) => void;
    /**
     * Placeholder text for the input
     */
    placeholder?: string;
    /**
     * Whether the input is disabled
     */
    disabled?: boolean;
    /**
     * Error message to display
     */
    error?: string;
}

const autoFormatDate = (input: string, format: string): string => {
    // Remove any non-digit characters
    const digitsOnly = input.replace(/\D/g, '');

    // Determine separator from format string
    const separatorMatch = format.match(/[^\w]/)?.[0] || '-';

    // Determine the structure of the format
    if (
        format.includes('MM') &&
        format.includes('dd') &&
        format.includes('yyyy')
    ) {
        // For MM/dd/yyyy or similar 8-digit format
        if (digitsOnly.length <= 2) {
            return digitsOnly;
        } else if (digitsOnly.length <= 4) {
            return `${digitsOnly.slice(0, 2)}${separatorMatch}${digitsOnly.slice(2)}`;
        } else {
            console.log('sds');
            return `${digitsOnly.slice(0, 2)}${separatorMatch}${digitsOnly.slice(2, 4)}${separatorMatch}${digitsOnly.slice(4, 8)}`;
        }
    } else if (
        format.includes('dd') &&
        format.includes('MMM') &&
        format.includes('yyyy')
    ) {
        // For dd-MMM-yyyy format (letters not auto-formatted)
        return input;
    }

    return input;
};

export const FormFieldDatePicker = React.forwardRef<
    HTMLInputElement,
    DatePickerInputProps
>(
    (
        {
            dateFormat = 'dd-MM-yyyy',
            value,
            onChange,
            placeholder,
            disabled = false,
        },
        ref,
    ) => {
        const [open, setOpen] = React.useState(false);
        const valueTimestamp = value?.getTime() ?? null;
        const inputSource = `${valueTimestamp ?? ''}|${dateFormat}`;
        const [inputValue, setInputValue] = useSyncedDraft(
            inputSource,
            (source) => {
                const [timestamp, sourceFormat] = source.split('|');

                return timestamp ? format(Number(timestamp), sourceFormat) : '';
            },
        );
        const [month, setMonth] = useSyncedDraft(valueTimestamp, (timestamp) =>
            timestamp ? new Date(timestamp) : new Date(),
        );

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let newValue = e.target.value;
            console.log({ newValue });

            newValue = autoFormatDate(newValue, dateFormat);
            setInputValue(newValue);

            // Only validate if input is not empty
            if (newValue.trim() === '') {
                onChange?.(null);
                return;
            }

            // Attempt to parse the date with lenient parsing
            const parsedDate = parse(newValue, dateFormat, new Date());

            if (isValid(parsedDate)) {
                onChange?.(parsedDate);
            }
        };

        const handleCalendarSelect = (date: Date | undefined) => {
            if (date) {
                onChange?.(date);
                setOpen(false);
            }
        };

        return (
            <div className="w-full">
                <Popover open={open} onOpenChange={setOpen}>
                    <div className="relative flex items-center">
                        <Input
                            ref={ref}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder={placeholder}
                            disabled={disabled}
                            className={'pr-10'}
                        />
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 h-full px-3 py-2 hover:bg-transparent"
                                disabled={disabled}
                            >
                                <Calendar className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                    </div>
                    <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                            mode="single"
                            selected={value}
                            onSelect={handleCalendarSelect}
                            disabled={disabled}
                            captionLayout="dropdown"
                            month={month}
                            onMonthChange={setMonth}
                            autoFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        );
    },
);
