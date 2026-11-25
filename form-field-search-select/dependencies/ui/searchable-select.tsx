import {Button} from '@/components/ui/button';
import {Command, CommandEmpty, CommandInput, CommandItem, CommandList,} from '@/components/ui/command';
import {Popover, PopoverContent, PopoverTrigger,} from '@/components/ui/popover';
import {cn} from '@/lib/utils';
import {Check, ChevronsUpDown, X} from 'lucide-react';
import {type ComponentProps, useMemo, useState} from 'react';

const CLEAR_VALUE = '__searchable_select_clear__';

type SearchableSelectProps<TOption extends Record<string, unknown>> = {
    value?: string;
    onValueChange: (value: string | undefined) => void;
    options: TOption[];
    optionValue: keyof TOption | string;
    optionLabel: keyof TOption | string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    contentClassName?: string;
    clearable?: boolean;
    clearLabel?: string;
} & Omit<ComponentProps<typeof Button>, 'children' | 'value' | 'onClick'>;

function optionText(
    option: Record<string, unknown>,
    key: PropertyKey,
): string {
    return String(option[key as keyof typeof option]);
}

export default function SearchableSelect<
    TOption extends Record<string, unknown>,
>({
      value,
      onValueChange,
      options,
      optionValue,
      optionLabel,
      placeholder = 'Select an option',
      searchPlaceholder = 'Search...',
      emptyMessage = 'No results found.',
      searchValue,
      onSearchChange,
      className,
      contentClassName,
      clearable = false,
      clearLabel = 'Clear selection',
      disabled,
      ...buttonProps
  }: SearchableSelectProps<TOption>) {
    const [open, setOpen] = useState(false);
    const [internalSearchValue, setInternalSearchValue] = useState('');
    const currentSearchValue = searchValue ?? internalSearchValue;
    const currentOption = options.find(
        (option) => optionText(option, optionValue) === value,
    );
    const filteredOptions = useMemo(() => {
        const query = currentSearchValue.trim().toLowerCase();

        if (!query) {
            return options;
        }

        return options.filter((option) =>
            `${optionText(option, optionLabel)} ${optionText(option, optionValue)}`
                .toLowerCase()
                .includes(query),
        );
    }, [currentSearchValue, optionLabel, optionValue, options]);

    const handleSearchChange = (nextValue: string) => {
        setInternalSearchValue(nextValue);
        onSearchChange?.(nextValue);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            handleSearchChange('');
        }
    };

    const handleClear = () => {
        onValueChange(undefined);
        setOpen(false);
        handleSearchChange('');
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <div className="relative w-full">
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                            'w-full justify-between font-normal',
                            value && clearable && 'pr-16',
                            className,
                        )}
                        {...buttonProps}
                    >
                        <span
                            className={cn(
                                'truncate',
                                !currentOption && 'text-muted-foreground',
                            )}
                        >
                            {currentOption
                                ? optionText(currentOption, optionLabel)
                                : placeholder}
                        </span>
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                {value && clearable ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={clearLabel}
                        title={clearLabel}
                        disabled={disabled}
                        className="absolute top-1/2 right-8 z-10 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                        onPointerDown={(event) => {
                            event.stopPropagation();
                        }}
                        onClick={(event) => {
                            event.stopPropagation();
                            handleClear();
                        }}
                    >
                        <X />
                    </Button>
                ) : null}
            </div>
            <PopoverContent
                align="start"
                className={cn(
                    'w-(--radix-popover-trigger-width) p-0',
                    contentClassName,
                )}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={currentSearchValue}
                        onValueChange={handleSearchChange}
                    />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        {clearable ? (
                            <CommandItem
                                value={CLEAR_VALUE}
                                onSelect={handleClear}
                            >
                                {clearLabel}
                            </CommandItem>
                        ) : null}
                        {filteredOptions.map((option) => {
                            const optionValueText = optionText(
                                option,
                                optionValue,
                            );

                            return (
                                <CommandItem
                                    key={optionValueText}
                                    value={optionValueText}
                                    onSelect={() => {
                                        onValueChange(optionValueText);
                                        setOpen(false);
                                    }}
                                >
                                    <span className="truncate">
                                        {optionText(option, optionLabel)}
                                    </span>
                                    <Check
                                        className={cn(
                                            'ml-auto',
                                            value === optionValueText
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                </CommandItem>
                            );
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
