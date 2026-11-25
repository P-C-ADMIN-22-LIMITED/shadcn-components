import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslations } from '@/hooks/use-translations';
import { useState } from 'react';
import type { TableFilterEditorProps } from './types';

export function TableFiltersStatus({
    filter,
    selectedValue,
    onValueChange,
}: TableFilterEditorProps) {
    const [search, setSearch] = useState('');
    const { trans } = useTranslations();
    const {
        options,
        optionLabelKey = 'label',
        optionValueKey = 'value',
    } = filter;

    const selectedArray: string[] = selectedValue
        ? Array.isArray(selectedValue)
            ? selectedValue
            : String(selectedValue).split(',').filter(Boolean)
        : [];

    const filteredOptions = options?.filter((option) =>
        String(option[optionLabelKey])
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    const handleCheckboxChange = (checked: boolean, value: string) => {
        let updated: string[];
        if (checked) {
            updated = [...selectedArray, value];
        } else {
            updated = selectedArray.filter((v) => v !== value);
        }
        onValueChange(updated.length ? updated.join(',') : undefined);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start pl-3 text-muted-foreground"
                >
                    {trans('admin.data_table.table_filters.choose', {
                        label: filter.label,
                    })}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                id={filter.param}
                align="start"
                className="min-w-[220px] p-2"
            >
                <Input
                    placeholder={trans(
                        'admin.data_table.table_filters.search_status',
                    )}
                    className="mb-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex flex-col">
                    {filteredOptions?.length === 0 && (
                        <span className="px-3 py-2 text-sm text-muted-foreground">
                            {trans(
                                'admin.data_table.table_filters.no_status_found',
                            )}
                        </span>
                    )}
                    {filteredOptions?.map((option, index) => (
                        <Label
                            key={`${option[optionValueKey]}-${index}`}
                            className={cn(
                                'flex cursor-pointer items-center gap-2 rounded px-3 py-2 transition hover:bg-muted',
                            )}
                        >
                            <Checkbox
                                checked={selectedArray.includes(
                                    String(option[optionValueKey]),
                                )}
                                onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                        !!checked,
                                        String(option[optionValueKey]),
                                    )
                                }
                            />
                            {String(option[optionLabelKey])}
                        </Label>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
