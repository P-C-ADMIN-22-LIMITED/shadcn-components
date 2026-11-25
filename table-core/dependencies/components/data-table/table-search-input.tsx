import { Input } from '@/components/ui/input';
import { useSyncedDraft } from '@/hooks/use-synced-draft';
import { Search } from 'lucide-react';
import debounce from 'lodash-es/debounce';
import { useEffect, useMemo } from 'react';

export interface TableSearchInputProps {
    value: string;
    onDebouncedChange: (value: string) => void;
    placeholder: string;
    debounceMs?: number;
}

const identity = (value: string): string => value;

export function TableSearchInput({
    value,
    onDebouncedChange,
    placeholder,
    debounceMs = 400,
}: TableSearchInputProps) {
    const [inputValue, setInputValue] = useSyncedDraft(value, identity);
    const emitChange = useMemo(
        () => debounce(onDebouncedChange, debounceMs),
        [debounceMs, onDebouncedChange],
    );

    useEffect(() => {
        return () => emitChange.cancel();
    }, [emitChange]);

    const handleChange = (nextValue: string) => {
        setInputValue(nextValue);
        emitChange(nextValue);
    };

    return (
        <div className="relative max-w-md min-w-48 flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
                placeholder={placeholder}
                value={inputValue}
                onChange={(event) => handleChange(event.target.value)}
                className="pl-10 md:max-w-62.5 lg:max-w-sm"
                type="search"
            />
        </div>
    );
}
