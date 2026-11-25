import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectItem,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import lowerCase from 'lodash-es/lowerCase';
import { Select as SelectPrimitive } from 'radix-ui';
import { ComponentProps, type ReactNode, useMemo, useState } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

const CLEAR_VALUE = '__clear__';

export type FormFieldSearchSelectProps<
    TFieldValues extends FieldValues,
    TOption extends Record<string, unknown> = Record<string, unknown>,
    TContext = unknown,
    TTransformedValues = TFieldValues,
> = {
    control: Control<TFieldValues, TContext, TTransformedValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    options: TOption[];
    optionValue?: keyof TOption;
    optionLabel?: keyof TOption;
    renderOption?: (option: TOption) => ReactNode;
    renderSelected?: (option: TOption) => ReactNode;
    getOptionSearchText?: (option: TOption) => string;
    required?: boolean;
    formItemClassName?: string;
    selectContentClassName?: string;
    disabled?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    noOptionsMessage?: string;
    clearable?: boolean;
    clearLabel?: string;
    transformValue?: (value: string | undefined) => unknown;
    onValueChange?: (value: string | undefined) => void;
} & Omit<ComponentProps<'div'>, 'name'>;

export default function FormFieldSearchSelect<
    TFieldValues extends FieldValues,
    TOption extends Record<string, unknown>,
    TContext = unknown,
    TTransformedValues = TFieldValues,
>({
    control,
    name,
    label,
    options,
    optionValue,
    optionLabel,
    renderOption,
    renderSelected,
    getOptionSearchText,
    required = false,
    className,
    formItemClassName,
    selectContentClassName,
    disabled,
    placeholder,
    searchPlaceholder,
    noOptionsMessage,
    clearable = false,
    clearLabel = '-',
    transformValue,
    onValueChange,
    ...props
}: FormFieldSearchSelectProps<
    TFieldValues,
    TOption,
    TContext,
    TTransformedValues
>) {
    const { ...formItemProps } = props;
    const [search, setSearch] = useState('');
    const valueKey = useMemo(
        () => (optionValue ?? ('value' as keyof TOption)) as keyof TOption,
        [optionValue],
    );
    const labelKey = useMemo(
        () => (optionLabel ?? ('label' as keyof TOption)) as keyof TOption,
        [optionLabel],
    );
    const resolvedPlaceholder = placeholder ?? `Select ${lowerCase(label)}`;
    const resolvedSearchPlaceholder =
        searchPlaceholder ?? `Search ${lowerCase(label)}...`;
    const resolvedNoOptionsMessage =
        noOptionsMessage ?? `No ${lowerCase(label)} found.`;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const normalizedValue =
                    field.value != null ? String(field.value) : '';
                const selectValue =
                    normalizedValue || (clearable ? CLEAR_VALUE : undefined);
                const currentOption = normalizedValue
                    ? options.find(
                          (option) =>
                              String(option[valueKey]) === normalizedValue,
                      )
                    : undefined;
                const currentLabel = normalizedValue
                    ? currentOption
                        ? String(currentOption[labelKey])
                        : undefined
                    : undefined;
                const selectedValue =
                    currentOption && renderSelected
                        ? renderSelected(currentOption)
                        : currentLabel;
                const query = search.trim().toLowerCase();
                const filteredOptions = options.filter((option) => {
                    if (!query) {
                        return true;
                    }

                    const optionText = (
                        getOptionSearchText
                            ? getOptionSearchText(option)
                            : `${String(option[labelKey])} ${String(option[valueKey])}`
                    ).toLowerCase();

                    return optionText.includes(query);
                });

                const handleValueChange = (value: string) => {
                    const nextValue = value === CLEAR_VALUE ? undefined : value;
                    const transformedValue = transformValue
                        ? transformValue(nextValue)
                        : nextValue;

                    field.onChange(transformedValue ?? '');
                    onValueChange?.(nextValue);
                    setSearch('');
                };

                return (
                    <FormItem {...formItemProps} className={formItemClassName}>
                        <FormLabel required={required}>{label}</FormLabel>
                        <Select
                            key={selectValue ?? '__empty__'}
                            disabled={disabled}
                            value={selectValue}
                            onValueChange={handleValueChange}
                            onOpenChange={(open) => {
                                if (!open) {
                                    setSearch('');
                                }
                            }}
                        >
                            <FormControl>
                                <SelectTrigger
                                    className={cn(
                                        'w-full min-w-0 text-start',
                                        className,
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'min-w-0 flex-1 truncate',
                                            !selectedValue &&
                                                'text-muted-foreground',
                                        )}
                                    >
                                        {selectedValue ?? resolvedPlaceholder}
                                    </span>
                                </SelectTrigger>
                            </FormControl>
                            <SelectPrimitive.Portal>
                                <SelectPrimitive.Content
                                    position="popper"
                                    className={cn(
                                        'relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] origin-[--radix-select-content-transform-origin] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:translate-y-1 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:-translate-x-1 data-[side=left]:slide-in-from-right-2 data-[side=right]:translate-x-1 data-[side=right]:slide-in-from-left-2 data-[side=top]:-translate-y-1 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                                        selectContentClassName,
                                    )}
                                >
                                    <div className="border-b bg-popover p-2">
                                        <Input
                                            className="border-0"
                                            value={search}
                                            placeholder={
                                                resolvedSearchPlaceholder
                                            }
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            onKeyDown={(event) =>
                                                event.stopPropagation()
                                            }
                                            autoFocus
                                        />
                                    </div>
                                    <SelectScrollUpButton />
                                    <SelectPrimitive.Viewport className="max-h-60 w-full min-w-[var(--radix-select-trigger-width)] p-1">
                                        {clearable ? (
                                            <SelectItem value={CLEAR_VALUE}>
                                                {clearLabel}
                                            </SelectItem>
                                        ) : null}
                                        {filteredOptions.length > 0 ? (
                                            filteredOptions.map((option) => (
                                                <SelectItem
                                                    key={String(
                                                        option[valueKey],
                                                    )}
                                                    value={String(
                                                        option[valueKey],
                                                    )}
                                                >
                                                    {renderOption
                                                        ? renderOption(option)
                                                        : String(
                                                              option[labelKey],
                                                          )}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                {resolvedNoOptionsMessage}
                                            </div>
                                        )}
                                    </SelectPrimitive.Viewport>
                                    <SelectScrollDownButton />
                                </SelectPrimitive.Content>
                            </SelectPrimitive.Portal>
                        </Select>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
