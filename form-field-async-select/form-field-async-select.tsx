import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import lowerCase from 'lodash-es/lowerCase';
import { Check, ChevronDown } from 'lucide-react';
import { ComponentProps, type ReactNode, type UIEvent, useState } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

export type AsyncSelectOption = {
    value: string;
    label: string;
    gatewayName?: string;
};

export type FormFieldAsyncSelectProps<TFieldValues extends FieldValues> = {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    options: AsyncSelectOption[];
    selectedOption?: AsyncSelectOption;
    search: string;
    onSearchChange: (search: string) => void;
    onReachEnd: () => void;
    hasNextPage?: boolean;
    isLoading?: boolean;
    isFetchingNextPage?: boolean;
    renderOption?: (option: AsyncSelectOption) => ReactNode;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    noOptionsMessage?: string;
    formItemClassName?: string;
    selectContentClassName?: string;
    portalled?: boolean;
    onValueChange?: (value: string | undefined) => void;
} & Omit<ComponentProps<'div'>, 'name'>;

const loadingBlock = (
    <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted-foreground">
        <Spinner /> Loading...
    </div>
);

const loadingMoreBlock = (
    <div className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-muted-foreground">
        <Spinner className="size-3" /> Loading more...
    </div>
);

const triggerChevron = <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />;

export default function FormFieldAsyncSelect<TFieldValues extends FieldValues>({
    control,
    name,
    label,
    options,
    selectedOption,
    search,
    onSearchChange,
    onReachEnd,
    hasNextPage = false,
    isLoading = false,
    isFetchingNextPage = false,
    renderOption,
    required = false,
    disabled,
    placeholder,
    searchPlaceholder,
    noOptionsMessage,
    className,
    formItemClassName,
    selectContentClassName,
    portalled = false,
    onValueChange,
    ...props
}: FormFieldAsyncSelectProps<TFieldValues>) {
    const { ...formItemProps } = props;
    const resolvedPlaceholder = placeholder ?? `Select ${lowerCase(label)}`;
    const resolvedSearchPlaceholder =
        searchPlaceholder ?? `Search ${lowerCase(label)}...`;
    const resolvedNoOptionsMessage =
        noOptionsMessage ?? `No ${lowerCase(label)} found.`;
    const listboxId = `${name}-async-select-listbox`;

    const [open, setOpen] = useState<boolean>(false);

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            onSearchChange('');
        }
    };

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        if (!hasNextPage || isFetchingNextPage) return;
        const el = event.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
            onReachEnd();
        }
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const normalizedValue =
                    field.value != null ? String(field.value) : '';
                const currentOption = normalizedValue
                    ? (options.find(
                          (option) => option.value === normalizedValue,
                      ) ??
                      (selectedOption?.value === normalizedValue
                          ? selectedOption
                          : undefined))
                    : undefined;
                const currentLabel = currentOption?.label;

                const handleSelect = (value: string) => {
                    field.onChange(value);
                    onValueChange?.(value);
                    onSearchChange('');
                    setOpen(false);
                };

                return (
                    <FormItem {...formItemProps} className={formItemClassName}>
                        <FormLabel required={required}>{label}</FormLabel>
                        <Popover
                            open={open}
                            modal={portalled}
                            onOpenChange={handleOpenChange}
                        >
                            <FormControl>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        id={`${name}-async-select`}
                                        data-cy={`${name}-async-select`}
                                        role="combobox"
                                        aria-controls={listboxId}
                                        aria-expanded={open}
                                        disabled={disabled}
                                        className={cn(
                                            'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                                            className,
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'truncate',
                                                !currentLabel &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            {currentLabel ??
                                                resolvedPlaceholder}
                                        </span>
                                        {triggerChevron}
                                    </button>
                                </PopoverTrigger>
                            </FormControl>
                            <PopoverContent
                                portalled={portalled}
                                align="start"
                                collisionPadding={8}
                                className={cn(
                                    'w-(--radix-popover-trigger-width) p-0',
                                    selectContentClassName,
                                )}
                                onOpenAutoFocus={(event) =>
                                    event.preventDefault()
                                }
                            >
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        value={search}
                                        onValueChange={onSearchChange}
                                        placeholder={resolvedSearchPlaceholder}
                                    />
                                    <CommandList
                                        id={listboxId}
                                        className="max-h-[min(15rem,calc(var(--radix-popover-content-available-height)-3.5rem))]"
                                        onScroll={handleScroll}
                                    >
                                        {isLoading ? (
                                            loadingBlock
                                        ) : options.length > 0 ? (
                                            <>
                                                {options.map((option) => (
                                                    <CommandItem
                                                        key={option.value}
                                                        value={option.value}
                                                        onSelect={() =>
                                                            handleSelect(
                                                                option.value,
                                                            )
                                                        }
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            {renderOption
                                                                ? renderOption(
                                                                      option,
                                                                  )
                                                                : option.label}
                                                        </div>
                                                        <Check
                                                            className={cn(
                                                                'ml-auto h-4 w-4',
                                                                option.value ===
                                                                    normalizedValue
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0',
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                                {isFetchingNextPage
                                                    ? loadingMoreBlock
                                                    : null}
                                            </>
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                {resolvedNoOptionsMessage}
                                            </div>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
