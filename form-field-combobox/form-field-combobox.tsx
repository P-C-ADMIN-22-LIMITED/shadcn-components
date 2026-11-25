import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    type ComboboxProps,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import lowerCase from 'lodash-es/lowerCase';
import { ComponentProps, ReactNode, useMemo } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

type ItemToString<TItem> = (item: TItem) => string;
type ItemToValue<TItem> = (item: TItem) => string;

export type FormFieldComboboxProps<TFieldValues extends FieldValues, TItem> = {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    items: TItem[];
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    noItemsMessage?: string;
    showClear?: boolean;
    itemToStringValue?: ItemToString<TItem>;
    itemToValue?: ItemToValue<TItem>;
    renderItem?: (item: TItem) => ReactNode;
    formItemClassName?: string;
    comboboxProps?: Omit<
        ComboboxProps<TItem>,
        | 'items'
        | 'multiple'
        | 'value'
        | 'defaultValue'
        | 'onValueChange'
        | 'children'
    >;
    contentClassName?: string;
    listClassName?: string;
} & Omit<ComponentProps<'div'>, 'name'>;

export default function FormFieldCombobox<
    TFieldValues extends FieldValues,
    TItem,
>({
    control,
    name,
    label,
    items,
    required = false,
    disabled,
    placeholder,
    noItemsMessage,
    showClear = false,
    itemToStringValue,
    itemToValue,
    renderItem,
    className,
    formItemClassName,
    comboboxProps,
    contentClassName,
    listClassName,
    ...props
}: FormFieldComboboxProps<TFieldValues, TItem>) {
    const { ...formItemProps } = props;
    const resolvedPlaceholder = placeholder ?? `Select ${lowerCase(label)}`;
    const resolvedNoItemsMessage =
        noItemsMessage ?? `No ${lowerCase(label)} found.`;

    const resolvedItemToValue = useMemo<ItemToValue<TItem>>(() => {
        return itemToValue ?? ((item: TItem) => String(item));
    }, [itemToValue]);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const normalizedValue =
                    field.value != null && field.value !== ''
                        ? String(field.value)
                        : '';

                return (
                    <FormItem {...formItemProps} className={formItemClassName}>
                        <FormLabel required={required}>{label}</FormLabel>
                        <FormControl>
                            <div className={cn('w-full', className)}>
                                <Combobox<TItem>
                                    items={items}
                                    disabled={disabled}
                                    value={normalizedValue}
                                    itemToStringValue={itemToStringValue}
                                    itemToValue={resolvedItemToValue}
                                    onValueChange={(next) => {
                                        const nextValue = Array.isArray(next)
                                            ? next[0]
                                            : next;
                                        field.onChange(nextValue || '');
                                    }}
                                    {...comboboxProps}
                                >
                                    <ComboboxInput
                                        placeholder={resolvedPlaceholder}
                                        showClear={showClear}
                                    />
                                    <ComboboxContent
                                        className={contentClassName}
                                    >
                                        <ComboboxEmpty>
                                            {resolvedNoItemsMessage}
                                        </ComboboxEmpty>
                                        <ComboboxList<TItem>
                                            className={listClassName}
                                        >
                                            {(item) => {
                                                const itemValue =
                                                    resolvedItemToValue(item);
                                                return (
                                                    <ComboboxItem<TItem>
                                                        key={itemValue}
                                                        value={item}
                                                    >
                                                        {renderItem
                                                            ? renderItem(item)
                                                            : itemToStringValue
                                                              ? itemToStringValue(
                                                                    item,
                                                                )
                                                              : itemValue}
                                                    </ComboboxItem>
                                                );
                                            }}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
