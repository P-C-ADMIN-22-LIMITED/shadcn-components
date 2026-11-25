import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { MultiselectExpandable } from '@/components/ui/multiselect-expandable';
import { ComponentProps, useMemo } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

export type FormFieldMultiselectProps<
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
    formItemClassName?: string;
    labelRequired?: boolean;
} & Omit<ComponentProps<'div'>, 'name'>;

export default function FormFieldMultiselect<
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
    className,
    formItemClassName,
    labelRequired = false,
    ...props
}: FormFieldMultiselectProps<
    TFieldValues,
    TOption,
    TContext,
    TTransformedValues
>) {
    const { ...formItemProps } = props;
    const valueKey = useMemo(
        () => (optionValue ?? ('value' as keyof TOption)) as keyof TOption,
        [optionValue],
    );
    const labelKey = useMemo(
        () => (optionLabel ?? ('label' as keyof TOption)) as keyof TOption,
        [optionLabel],
    );
    const placeholder = `Select ${label.toLowerCase()}`;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const selectedValues = Array.isArray(field.value)
                    ? field.value.map(String)
                    : [];

                const handleChange = (selected: string[]) => {
                    field.onChange(selected);
                };

                return (
                    <FormItem {...formItemProps} className={formItemClassName}>
                        <FormLabel required={labelRequired}>{label}</FormLabel>
                        <FormControl>
                            <MultiselectExpandable
                                options={options}
                                labelKey={String(labelKey)}
                                valueKey={String(valueKey)}
                                selectedValues={selectedValues}
                                onChange={handleChange}
                                placeholder={placeholder}
                                className={className}
                                maxShownItems={2}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
