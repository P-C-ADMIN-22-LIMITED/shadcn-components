import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import SearchableSelect from '@/components/ui/searchable-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import { ComponentProps, ReactNode, useState } from 'react';
import { Control, FieldPath, FieldValues, get } from 'react-hook-form';

const CLEAR_VALUE = '__form_field_select_clear__';

export type FormFieldSelectProps<
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
    renderValue?: (option: TOption) => ReactNode;
    formItemClassName?: string;
    selectContentClassName?: string;
    search?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
    required?: boolean;
    disabled?: boolean;
    clearable?: boolean;
    clearLabel?: string;
    onValueChange?: (value: string | undefined) => void;
} & Omit<ComponentProps<'div'>, 'name'>;

export default function FormFieldSelect<
    TFieldValues extends FieldValues,
    TOption extends Record<string, unknown>,
    TContext = unknown,
    TTransformedValues = TFieldValues,
>({
    control,
    name,
    label,
    options,
    optionValue = 'value',
    optionLabel = 'label',
    renderOption,
    className,
    formItemClassName,
    selectContentClassName,
    search = true,
    searchPlaceholder,
    emptyMessage,
    clearable = true,
    clearLabel = 'Clear selection',
    required,
    disabled,
    onValueChange,
    ...props
}: FormFieldSelectProps<TFieldValues, TOption, TContext, TTransformedValues>) {
    const { ...formItemProps } = props;
    const [searchInputValue, setSearchInputValue] = useState('');
    const valueKey = optionValue as keyof TOption;
    const labelKey = optionLabel as keyof TOption;
    const placeholder = `Select ${label.toLowerCase()}`;
    const searchInputPlaceholder =
        searchPlaceholder ?? `Search ${label.toLowerCase()}...`;
    const emptyStateMessage = emptyMessage ?? 'No results found.';

    return (
        <FormField
            control={control}
            name={name}
            render={({ field, fieldState, formState }) => {
                const normalizedValue =
                    field.value != null ? String(field.value) : '';
                const selectValue =
                    normalizedValue || (clearable ? CLEAR_VALUE : undefined);
                const hasError = Boolean(fieldState.error);
                const handleValueChange = (value?: string) => {
                    if (!value || value === CLEAR_VALUE) {
                        // react-hook-form shows the default again for undefined, so a field that started with a value is cleared with ''
                        field.onChange(
                            get(formState.defaultValues, name) == null
                                ? undefined
                                : '',
                        );
                        onValueChange?.(undefined);
                        return;
                    }

                    const selectedOption = options.find(
                        (option) => String(option[valueKey]) === value,
                    );
                    field.onChange(
                        selectedOption ? selectedOption[valueKey] : value,
                    );
                    onValueChange?.(value);
                };
                const hasValue = normalizedValue !== '';
                const handleClear = () => handleValueChange(undefined);

                return (
                    <FormItem {...formItemProps} className={formItemClassName}>
                        <FormLabel required={required}>{label}</FormLabel>
                        {search ? (
                            <FormControl>
                                <SearchableSelect
                                    value={normalizedValue}
                                    onValueChange={handleValueChange}
                                    options={options}
                                    optionValue={valueKey}
                                    optionLabel={labelKey}
                                    placeholder={placeholder}
                                    searchPlaceholder={searchInputPlaceholder}
                                    emptyMessage={emptyStateMessage}
                                    searchValue={searchInputValue}
                                    onSearchChange={setSearchInputValue}
                                    clearable={clearable}
                                    clearLabel={clearLabel}
                                    aria-invalid={hasError}
                                    disabled={disabled}
                                    className={cn('w-full', className)}
                                    contentClassName={selectContentClassName}
                                />
                            </FormControl>
                        ) : (
                            <Select
                                value={selectValue}
                                onValueChange={handleValueChange}
                                disabled={disabled}
                            >
                                <div className="relative">
                                    <FormControl>
                                        <SelectTrigger
                                            aria-invalid={hasError}
                                            className={cn(
                                                'w-full',
                                                hasValue &&
                                                    clearable &&
                                                    'pr-16',
                                                className,
                                                hasError &&
                                                    'border-destructive ring-destructive/20',
                                            )}
                                        >
                                            <SelectValue
                                                placeholder={placeholder}
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    {hasValue && clearable ? (
                                        <button
                                            type="button"
                                            aria-label={clearLabel}
                                            title={clearLabel}
                                            disabled={disabled}
                                            className="absolute top-1/2 right-8 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                                            onPointerDown={(event) => {
                                                event.stopPropagation();
                                            }}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleClear();
                                            }}
                                        >
                                            <XIcon className="size-3.5" />
                                        </button>
                                    ) : null}
                                </div>
                                <SelectContent
                                    className={cn(
                                        'max-h-60',
                                        selectContentClassName,
                                    )}
                                >
                                    {clearable ? (
                                        <SelectItem value={CLEAR_VALUE}>
                                            {clearLabel}
                                        </SelectItem>
                                    ) : null}
                                    {options.map((option) => (
                                        <SelectItem
                                            key={String(option[valueKey])}
                                            value={String(option[valueKey])}
                                            className={cn(
                                                renderOption &&
                                                    'items-start py-2',
                                            )}
                                        >
                                            {renderOption
                                                ? renderOption(option)
                                                : String(option[labelKey])}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <FormMessage />
                    </FormItem>
                );
            }}
        ></FormField>
    );
}
