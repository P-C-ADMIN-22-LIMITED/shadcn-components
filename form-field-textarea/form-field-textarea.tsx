import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ComponentProps } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

export type FormFieldTextareaProps<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
> = {
    control: Control<TFieldValues, TContext, TTransformedValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    formItemClassName?: string;
    formItemProps?: Omit<
        ComponentProps<'div'>,
        'name' | 'children' | 'className'
    >;
    required?: boolean;
} & Omit<
    ComponentProps<typeof Textarea>,
    'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'ref'
>;

export default function FormFieldTextarea<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
>({
    control,
    name,
    label,
    formItemClassName,
    formItemProps,
    required,
    ...textareaProps
}: FormFieldTextareaProps<TFieldValues, TContext, TTransformedValues>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem {...formItemProps} className={formItemClassName}>
                    <FormLabel required={required}>{label}</FormLabel>
                    <FormControl>
                        <Textarea
                            {...textareaProps}
                            {...field}
                            value={field.value ?? ''}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
