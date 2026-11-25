import { Deferred, InfiniteScroll } from '@inertiajs/react';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import get from 'lodash-es/get';
import type { ComponentProps, ReactNode } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

export type FormFieldInfiniteScrollSelectProps<
    TFieldValues extends FieldValues,
    TOption extends Record<string, unknown> = Record<string, unknown>,
    TContext = unknown,
    TTransformedValues = TFieldValues,
> = {
    control: Control<TFieldValues, TContext, TTransformedValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    options?: TOption[];
    data: ComponentProps<typeof InfiniteScroll>['data'];
    deferred?: boolean;
    selectedOption?: TOption | null;
    optionValue?: keyof TOption;
    optionLabel?: keyof TOption | string;
    renderOption?: (option: TOption) => ReactNode;
    renderValue?: (option: TOption) => ReactNode;
    formItemClassName?: string;
    selectContentClassName?: string;
    placeholder?: string;
    emptyMessage?: string;
    required?: boolean;
    disabled?: boolean;
    infiniteScrollProps?: Omit<
        ComponentProps<typeof InfiniteScroll>,
        | 'as'
        | 'children'
        | 'data'
        | 'endElement'
        | 'itemsElement'
        | 'startElement'
    >;
    onValueChange?: (value: string | undefined) => void;
} & Omit<ComponentProps<'div'>, 'name'>;

const loadingMoreBlock = (
    <div className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-muted-foreground">
        <Spinner className="size-3" />
        Loading more...
    </div>
);

type SkeletonProps = {
    label: string;
    required?: boolean;
    className?: string;
    formItemClassName?: string;
};

function FormFieldInfiniteScrollSelectSkeleton({
    label,
    required,
    className,
    formItemClassName,
}: SkeletonProps) {
    return (
        <FormItem className={formItemClassName}>
            <FormLabel required={required}>{label}</FormLabel>
            <Skeleton className={cn('h-9 w-full rounded-md', className)} />
        </FormItem>
    );
}

function FormFieldInfiniteScrollSelectInner<
    TFieldValues extends FieldValues,
    TOption extends Record<string, unknown>,
    TContext = unknown,
    TTransformedValues = TFieldValues,
>({
    control,
    name,
    label,
    options = [],
    data,
    selectedOption,
    optionValue = 'value',
    optionLabel = 'label',
    renderOption,
    renderValue,
    className,
    formItemClassName,
    selectContentClassName,
    placeholder,
    emptyMessage = 'No results found.',
    required,
    disabled,
    infiniteScrollProps,
    onValueChange,
    deferred: _deferred,
    ...props
}: FormFieldInfiniteScrollSelectProps<
    TFieldValues,
    TOption,
    TContext,
    TTransformedValues
>) {
    const valueKey = optionValue as keyof TOption;

    const resolvedPlaceholder = placeholder ?? `Select ${label.toLowerCase()}`;

    const resolvedInfiniteScrollProps = infiniteScrollProps ?? {};
    const onlyNext = resolvedInfiniteScrollProps.onlyNext ?? true;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field, fieldState }) => {
                const normalizedValue =
                    field.value != null ? String(field.value) : '';

                const currentOption = normalizedValue
                    ? (options.find(
                          (option) =>
                              String(option[valueKey]) === normalizedValue,
                      ) ??
                      (selectedOption &&
                      String(selectedOption[valueKey]) === normalizedValue
                          ? selectedOption
                          : undefined))
                    : undefined;

                const currentValue = currentOption
                    ? renderValue
                        ? renderValue(currentOption)
                        : String(get(currentOption, optionLabel))
                    : normalizedValue || resolvedPlaceholder;

                const hasError = Boolean(fieldState.error);

                const handleValueChange = (value: string) => {
                    const nextOption =
                        options.find(
                            (option) => String(option[valueKey]) === value,
                        ) ??
                        (selectedOption &&
                        String(selectedOption[valueKey]) === value
                            ? selectedOption
                            : undefined);

                    field.onChange(nextOption ? nextOption[valueKey] : value);

                    onValueChange?.(value);
                };

                return (
                    <FormItem {...props} className={formItemClassName}>
                        <FormLabel required={required}>{label}</FormLabel>

                        <Select
                            value={normalizedValue || undefined}
                            onValueChange={handleValueChange}
                            disabled={disabled}
                        >
                            <FormControl>
                                <SelectTrigger
                                    aria-invalid={hasError}
                                    className={cn('w-full', className)}
                                >
                                    <span
                                        className={cn(
                                            'min-w-0 flex-1 truncate text-left',
                                            !currentOption &&
                                                !normalizedValue &&
                                                'text-muted-foreground',
                                        )}
                                    >
                                        {currentValue}
                                    </span>
                                </SelectTrigger>
                            </FormControl>

                            <SelectContent
                                className={cn(
                                    'max-h-60',
                                    selectContentClassName,
                                )}
                            >
                                <InfiniteScroll
                                    preserveUrl={true}
                                    {...resolvedInfiniteScrollProps}
                                    data={data}
                                    onlyNext={onlyNext}
                                    loading={({ loadingNext }) =>
                                        loadingNext ? loadingMoreBlock : null
                                    }
                                >
                                    {options.length > 0 ? (
                                        options.map((option) => (
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
                                                    : String(
                                                          get(
                                                              option,
                                                              optionLabel,
                                                          ),
                                                      )}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                            {emptyMessage}
                                        </div>
                                    )}
                                </InfiniteScroll>
                            </SelectContent>
                        </Select>

                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}

export default function FormFieldInfiniteScrollSelect<
    TFieldValues extends FieldValues,
    TOption extends Record<string, unknown>,
    TContext = unknown,
    TTransformedValues = TFieldValues,
>(
    props: FormFieldInfiniteScrollSelectProps<
        TFieldValues,
        TOption,
        TContext,
        TTransformedValues
    >,
) {
    const {
        deferred = false,
        data,
        label,
        required,
        className,
        formItemClassName,
    } = props;

    if (!deferred) {
        return <FormFieldInfiniteScrollSelectInner {...props} />;
    }

    return (
        <Deferred
            data={data}
            fallback={
                <FormFieldInfiniteScrollSelectSkeleton
                    label={label}
                    required={required}
                    className={className}
                    formItemClassName={formItemClassName}
                />
            }
        >
            <FormFieldInfiniteScrollSelectInner {...props} />
        </Deferred>
    );
}
