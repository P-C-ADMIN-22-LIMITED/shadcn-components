import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import PillInput, { type PillInputProps } from '@/components/ui/pill-input';
import { ComponentProps } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

export type FormFieldPillInputProps<TFieldValues extends FieldValues> = {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    formItemClassName?: string;
    formItemProps?: Omit<
        ComponentProps<'div'>,
        'name' | 'children' | 'className'
    >;
    required?: boolean;
} & Omit<PillInputProps, 'value' | 'onChange' | 'invalid' | 'id'> & {
        id?: string;
    };

export default function FormFieldPillInput<TFieldValues extends FieldValues>({
    control,
    name,
    label,
    formItemClassName,
    formItemProps,
    required,
    id,
    ...pillInputProps
}: FormFieldPillInputProps<TFieldValues>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <FormItem {...formItemProps} className={formItemClassName}>
                    <FormLabel required={required}>{label}</FormLabel>
                    <FormControl>
                        <PillInput
                            {...pillInputProps}
                            id={id ?? name}
                            value={field.value ?? []}
                            onChange={field.onChange}
                            invalid={fieldState.invalid}
                            disabled={pillInputProps.disabled ?? field.disabled}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
