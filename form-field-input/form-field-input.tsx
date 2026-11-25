import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { ComponentProps } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

export type FormFieldInputProps<
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
    hint?: string;
} & Omit<
    ComponentProps<typeof Input>,
    'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'ref'
>;

export default function FormFieldInput<
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
    hint,
    ...inputProps
}: FormFieldInputProps<TFieldValues, TContext, TTransformedValues>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem {...formItemProps} className={formItemClassName}>
                    {hint ? (
                        <div className="flex items-center gap-1.5">
                            <FormLabel required={required}>{label}</FormLabel>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label={hint}
                                        className="text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <InfoIcon className="size-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{hint}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    ) : (
                        <FormLabel required={required}>{label}</FormLabel>
                    )}
                    <FormControl>
                        <Input
                            {...inputProps}
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
