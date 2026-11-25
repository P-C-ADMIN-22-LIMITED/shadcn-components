import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import {
    useState,
    type ChangeEvent,
    type ComponentProps,
    type KeyboardEvent,
} from 'react';

export type PillInputProps = Omit<
    ComponentProps<typeof Input>,
    'value' | 'onChange'
> & {
    value?: string[];
    onChange?: (value: string[]) => void;
    invalid?: boolean;
};

export default function PillInput({
    value = [],
    onChange,
    className,
    invalid,
    onKeyDown,
    ...props
}: PillInputProps) {
    const [inputValue, setInputValue] = useState('');

    const addValues = (rawValues: string[]) => {
        const nextValues = rawValues
            .map((rawValue) => rawValue.trim())
            .filter(
                (nextValue, index, values) =>
                    nextValue &&
                    !value.includes(nextValue) &&
                    values.indexOf(nextValue) === index,
            );

        if (!nextValues.length) {
            return;
        }

        onChange?.([...value, ...nextValues]);
        setInputValue('');
    };

    const addValue = (rawValue: string) => addValues([rawValue]);

    const removeValue = (valueToRemove: string) => {
        onChange?.(value.filter((item) => item !== valueToRemove));
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value;

        if (nextValue.includes(',')) {
            addValues(nextValue.split(','));
            return;
        }

        setInputValue(nextValue);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addValue(inputValue);
        } else if (event.key === 'Backspace' && !inputValue && value.length) {
            removeValue(value[value.length - 1]);
        }

        onKeyDown?.(event);
    };

    return (
        <div
            className={cn(
                'flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
                invalid && 'border-destructive ring-destructive/20',
                props.disabled && 'cursor-not-allowed opacity-50',
                className,
            )}
        >
            {value.map((item) => (
                <Badge key={item} variant="secondary" className="gap-1">
                    {item}
                    <button
                        type="button"
                        className="rounded-full outline-none hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Remove ${item}`}
                        onClick={() => removeValue(item)}
                        disabled={props.disabled}
                    >
                        <X className="size-3" />
                    </button>
                </Badge>
            ))}
            <Input
                {...props}
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="h-7 min-w-24 flex-1 border-0 px-1 py-0 shadow-none focus-visible:ring-0"
            />
        </div>
    );
}
