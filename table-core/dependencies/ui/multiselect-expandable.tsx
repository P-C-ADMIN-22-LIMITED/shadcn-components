import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState, type ComponentProps } from 'react';

type MultiselectExpandableProps<
    TOption extends Record<string, unknown>,
> = {
    options: TOption[];
    valueKey: keyof TOption | string;
    labelKey: keyof TOption | string;
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    maxShownItems?: number;
    displayMode?: 'badges' | 'summary';
} & Omit<ComponentProps<typeof Button>, 'children' | 'value' | 'onChange'>;

function optionText(
    option: Record<string, unknown>,
    key: PropertyKey,
): string {
    return String(option[key as keyof typeof option]);
}

export function MultiselectExpandable<
    TOption extends Record<string, unknown>,
>({
    options,
    valueKey,
    labelKey,
    selectedValues,
    onChange,
    placeholder = 'Select options',
    searchPlaceholder = 'Search...',
    maxShownItems = 2,
    displayMode = 'badges',
    className,
    disabled,
    ...buttonProps
}: MultiselectExpandableProps<TOption>) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const selectedValueSet = useMemo(
        () => new Set(selectedValues),
        [selectedValues],
    );
    const selectedOptions = options.filter((option) =>
        selectedValueSet.has(optionText(option, valueKey)),
    );
    const filteredOptions = useMemo(() => {
        const query = searchValue.trim().toLowerCase();

        if (!query) {
            return options;
        }

        return options.filter((option) =>
            `${optionText(option, labelKey)} ${optionText(option, valueKey)}`
                .toLowerCase()
                .includes(query),
        );
    }, [labelKey, options, searchValue, valueKey]);

    const toggleValue = (value: string) => {
        onChange(
            selectedValueSet.has(value)
                ? selectedValues.filter((selectedValue) => selectedValue !== value)
                : [...selectedValues, value],
        );
    };

    const visibleOptions = selectedOptions.slice(0, maxShownItems);
    const hiddenCount = Math.max(selectedOptions.length - maxShownItems, 0);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'min-h-9 justify-between font-normal',
                        !selectedOptions.length && 'text-muted-foreground',
                        className,
                    )}
                    {...buttonProps}
                >
                    <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                        {selectedOptions.length === 0 ? (
                            <span className="truncate">{placeholder}</span>
                        ) : displayMode === 'summary' ? (
                            <span className="truncate">
                                {selectedOptions.length} selected
                            </span>
                        ) : (
                            <>
                                {visibleOptions.map((option) => (
                                    <Badge
                                        key={optionText(option, valueKey)}
                                        variant="secondary"
                                        className="max-w-32 truncate font-normal"
                                    >
                                        {optionText(option, labelKey)}
                                    </Badge>
                                ))}
                                {hiddenCount > 0 && (
                                    <Badge variant="outline">
                                        +{hiddenCount}
                                    </Badge>
                                )}
                            </>
                        )}
                    </span>
                    <ChevronsUpDown className="ml-2 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-(--radix-popover-trigger-width) p-0"
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>No options found.</CommandEmpty>
                        {filteredOptions.map((option) => {
                            const value = optionText(option, valueKey);
                            const selected = selectedValueSet.has(value);

                            return (
                                <CommandItem
                                    key={value}
                                    value={value}
                                    onSelect={() => toggleValue(value)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2',
                                            selected
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    <span className="truncate">
                                        {optionText(option, labelKey)}
                                    </span>
                                </CommandItem>
                            );
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
