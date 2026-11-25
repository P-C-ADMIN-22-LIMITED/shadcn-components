import { Checkbox } from '@/components/ui/checkbox';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

export type FormFieldCheckboxProps<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
> = {
    control: Control<TFieldValues, TContext, TTransformedValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    formItemClassName?: string;
    labelDirection?: 'left' | 'right';
    onCheckedChange?: (checked: boolean) => void;
} & Omit<ComponentProps<'div'>, 'name'>;

export default function FormFieldCheckbox<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
>({
    control,
    name,
    label,
    formItemClassName,
    labelDirection = 'right',
    onCheckedChange,
    ...props
}: FormFieldCheckboxProps<TFieldValues, TContext, TTransformedValues>) {
    const { ...formItemProps } = props;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem
                    {...formItemProps}
                    className={cn('flex items-center gap-3', formItemClassName)}
                >
                    {labelDirection === 'left' && (
                        <FormLabel>{label}</FormLabel>
                    )}
                    <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                                const nextChecked = checked === true;
                                field.onChange(nextChecked);
                                onCheckedChange?.(nextChecked);
                            }}
                        />
                    </FormControl>
                    {labelDirection === 'right' && (
                        <FormLabel>{label}</FormLabel>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
