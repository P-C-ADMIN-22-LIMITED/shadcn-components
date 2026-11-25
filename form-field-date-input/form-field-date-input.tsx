import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
    type ComponentProps,
    useEffect,
    useId,
    useMemo,
    useState,
} from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

type DateTimeInputProps = Omit<
    ComponentProps<typeof Button>,
    'value' | 'onChange' | 'onSelect' | 'children'
> & {
    value: Date | string | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
};

const getDateOnly = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const getTimeValue = (date: Date | null): string => {
    if (!date) {
        return '00:00';
    }

    return `${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes(),
    ).padStart(2, '0')}`;
};

function DateTimeInput({
    value,
    onChange,
    placeholder = 'Select date and time',
    disabled,
    className,
    id,
    ...buttonProps
}: DateTimeInputProps) {
    const timeInputId = `${useId()}-time`;
    const [open, setOpen] = useState(false);
    const parsedValue = useMemo(() => {
        if (value instanceof Date) {
            return isValid(value) ? value : null;
        }

        if (typeof value !== 'string' || value.trim() === '') {
            return null;
        }

        const parsedDate = parseISO(value.replace(' ', 'T'));

        return isValid(parsedDate) ? parsedDate : null;
    }, [value]);
    const [month, setMonth] = useState<Date>(parsedValue ?? new Date());
    const selectedDate = parsedValue ? getDateOnly(parsedValue) : undefined;
    const timeValue = parsedValue ? getTimeValue(parsedValue) : '00:00';

    useEffect(() => {
        if (parsedValue) {
            setMonth(parsedValue);
        }
    }, [parsedValue]);

    const combineDateAndTime = (date: Date, time: string): Date => {
        const [hours, minutes] = time.split(':').map(Number);
        const combinedDate = getDateOnly(date);

        combinedDate.setHours(hours || 0, minutes || 0, 0, 0);

        return combinedDate;
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) {
            onChange(null);
            return;
        }

        onChange(combineDateAndTime(date, timeValue));
        setOpen(false);
    };

    const handleTimeChange = (time: string) => {
        onChange(combineDateAndTime(parsedValue ?? new Date(), time));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between font-normal',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                    {...buttonProps}
                >
                    {parsedValue
                        ? format(parsedValue, 'dd-MM-yyyy HH:mm')
                        : placeholder}
                    <CalendarIcon className="size-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    month={month}
                    onMonthChange={setMonth}
                    disabled={disabled}
                    captionLayout="dropdown"
                    autoFocus
                />
                <div className="grid gap-2 border-t px-4 py-3">
                    <label
                        htmlFor={timeInputId}
                        className="text-sm font-medium"
                    >
                        Time
                    </label>
                    <Input
                        id={timeInputId}
                        type="time"
                        value={timeValue}
                        onChange={(event) =>
                            handleTimeChange(event.target.value)
                        }
                        disabled={disabled}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

export type FormFieldDateInputProps<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
> = {
    control: Control<TFieldValues, TContext, TTransformedValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    formItemClassName?: string;
    formItemProps?: Omit<
        ComponentProps<'div'>,
        'name' | 'children' | 'className'
    >;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
};

export default function FormFieldDateInput<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
>({
    control,
    name,
    label,
    formItemClassName,
    formItemProps,
    required,
    placeholder,
    disabled,
}: FormFieldDateInputProps<TFieldValues, TContext, TTransformedValues>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field, fieldState }) => {
                const fieldValue: unknown = field.value;
                const value =
                    fieldValue instanceof Date || typeof fieldValue === 'string'
                        ? fieldValue
                        : null;

                return (
                    <FormItem {...formItemProps} className={formItemClassName}>
                        <FormLabel required={required}>{label}</FormLabel>
                        <FormControl>
                            <DateTimeInput
                                value={value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder={placeholder}
                                disabled={disabled}
                                aria-invalid={Boolean(fieldState.error)}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
