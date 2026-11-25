import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ComponentProps } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

export type FormFieldSwitchProps<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
> = {
    control: Control<TFieldValues, TContext, TTransformedValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    formItemClassName?: string;
    required?: boolean;
    disabled?: boolean;
} & Omit<ComponentProps<'div'>, 'name'>;
export default function FormFieldSwitch<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
>({
    control,
    name,
    label,
    formItemClassName = 'flex items-center  gap-4 flex-col',
    required,
    disabled = false,
    ...props
}: FormFieldSwitchProps<TFieldValues, TContext, TTransformedValues>) {
    const { ...formItemProps } = props;
    return (
        <FormField
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <FormItem {...formItemProps} className={formItemClassName}>
                    <div className="flex w-full">
                        <FormLabel required={required} className="w-20">
                            {label}
                        </FormLabel>
                        <FormControl>
                            <Switch
                                checked={Boolean(field.value)}
                                onCheckedChange={(checked) =>
                                    field.onChange(Boolean(checked))
                                }
                                aria-invalid={!!fieldState.error}
                                disabled={disabled}
                            />
                        </FormControl>
                    </div>
                    <FormMessage className="w-full" />
                </FormItem>
            )}
        />
    );
}
