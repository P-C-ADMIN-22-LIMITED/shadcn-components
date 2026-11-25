import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { type KeyboardEvent, useId, useState } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

type FormFieldTagInputProps<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
> = {
    control: Control<TFieldValues, TContext, TTransformedValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    options: string[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    formItemClassName?: string;
};

type TagInputControlProps = {
    selectedTags: string[];
    options: string[];
    onChange: (tags: string[]) => void;
    onBlur: () => void;
    name: string;
    placeholder: string;
    disabled: boolean;
    invalid: boolean;
};

function TagInputControl({
    selectedTags,
    options,
    onChange,
    onBlur,
    name,
    placeholder,
    disabled,
    invalid,
}: TagInputControlProps) {
    const [draft, setDraft] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeOptionIndex, setActiveOptionIndex] = useState(-1);
    const listboxId = `tag-options-${useId()}`;
    const selectedNames = new Set(
        selectedTags.map((tag) => tag.toLocaleLowerCase()),
    );
    const searchTerm = draft.trim().toLocaleLowerCase();
    const availableTags = options
        .filter((tag) => {
            const normalizedTag = tag.toLocaleLowerCase();

            return (
                !selectedNames.has(normalizedTag) &&
                (!searchTerm || normalizedTag.includes(searchTerm))
            );
        })
        .sort((firstTag, secondTag) =>
            firstTag.localeCompare(secondTag, undefined, {
                sensitivity: 'base',
            }),
        );
    const matchingTag = options.find(
        (tag) => tag.toLocaleLowerCase() === searchTerm,
    );
    const matchingTagIsSelected =
        matchingTag !== undefined &&
        selectedNames.has(matchingTag.toLocaleLowerCase());
    const showCreateTag = Boolean(searchTerm && !matchingTag);
    const showDropdown =
        !disabled &&
        isDropdownOpen &&
        (options.length > 0 || Boolean(searchTerm));
    const dropdownOptionCount = availableTags.length + (showCreateTag ? 1 : 0);

    const addTag = (rawTag: string): void => {
        if (disabled) {
            return;
        }

        const trimmedTag = rawTag.trim();

        if (!trimmedTag) {
            return;
        }

        const tag =
            options.find(
                (option) =>
                    option.toLocaleLowerCase() ===
                    trimmedTag.toLocaleLowerCase(),
            ) ?? trimmedTag;

        if (
            !selectedTags.some(
                (selectedTag) =>
                    selectedTag.toLocaleLowerCase() === tag.toLocaleLowerCase(),
            )
        ) {
            onChange([...selectedTags, tag]);
        }

        setDraft('');
        setActiveOptionIndex(-1);
    };

    const removeTag = (tagToRemove: string): void => {
        onChange(
            selectedTags.filter(
                (tag) =>
                    tag.toLocaleLowerCase() !== tagToRemove.toLocaleLowerCase(),
            ),
        );
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (
            event.key === 'ArrowDown' &&
            showDropdown &&
            dropdownOptionCount > 0
        ) {
            event.preventDefault();
            setActiveOptionIndex((index) =>
                index >= dropdownOptionCount - 1 ? 0 : index + 1,
            );

            return;
        }

        if (
            event.key === 'ArrowUp' &&
            showDropdown &&
            dropdownOptionCount > 0
        ) {
            event.preventDefault();
            setActiveOptionIndex((index) =>
                index <= 0 ? dropdownOptionCount - 1 : index - 1,
            );

            return;
        }

        if (event.key === 'Escape' && showDropdown) {
            event.preventDefault();
            setIsDropdownOpen(false);
            setActiveOptionIndex(-1);

            return;
        }

        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();

            if (showDropdown && activeOptionIndex >= 0) {
                if (activeOptionIndex < availableTags.length) {
                    addTag(availableTags[activeOptionIndex]);
                } else {
                    addTag(draft);
                }

                return;
            }

            addTag(draft);

            return;
        }

        if (event.key === 'Backspace' && !draft && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1]);
        }
    };

    return (
        <div className="grid gap-2">
            <div
                aria-invalid={invalid}
                className={cn(
                    'relative flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
                    invalid && 'border-destructive ring-destructive/20',
                    disabled && 'cursor-not-allowed opacity-50',
                )}
            >
                {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                            type="button"
                            className="rounded-full outline-none hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`Remove ${tag}`}
                            onClick={() => removeTag(tag)}
                            disabled={disabled}
                        >
                            <X className="size-3" />
                        </button>
                    </Badge>
                ))}
                <FormControl>
                    <Input
                        name={name}
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={showDropdown}
                        aria-controls={listboxId}
                        aria-activedescendant={
                            activeOptionIndex >= 0
                                ? `${listboxId}-option-${activeOptionIndex}`
                                : undefined
                        }
                        aria-invalid={invalid}
                        value={draft}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={255}
                        onFocus={() => setIsDropdownOpen(true)}
                        onBlur={() => {
                            onBlur();
                            setIsDropdownOpen(false);
                            setActiveOptionIndex(-1);
                        }}
                        onChange={(event) => {
                            setDraft(event.target.value);
                            setActiveOptionIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        className="h-7 min-w-24 flex-1 border-0 px-1 py-0 shadow-none focus-visible:ring-0"
                    />
                </FormControl>
                {showDropdown && (
                    <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                        <p className="px-2 py-1 text-xs text-muted-foreground">
                            {searchTerm
                                ? 'Matching keywords'
                                : 'Existing keywords'}
                        </p>
                        <div
                            id={listboxId}
                            role="listbox"
                            aria-label="Existing keywords"
                        >
                            {availableTags.map((tag, index) => (
                                <div
                                    key={tag}
                                    id={`${listboxId}-option-${index}`}
                                    role="option"
                                    aria-selected={activeOptionIndex === index}
                                    className={cn(
                                        'cursor-pointer rounded-sm px-2 py-1.5 text-sm',
                                        activeOptionIndex === index &&
                                            'bg-accent text-accent-foreground',
                                    )}
                                    onMouseDown={(event) =>
                                        event.preventDefault()
                                    }
                                    onMouseMove={() =>
                                        setActiveOptionIndex(index)
                                    }
                                    onClick={() => addTag(tag)}
                                >
                                    {tag}
                                </div>
                            ))}
                            {showCreateTag && (
                                <div
                                    id={`${listboxId}-option-${availableTags.length}`}
                                    role="option"
                                    aria-label={`Add new keyword ${draft.trim()}`}
                                    aria-selected={
                                        activeOptionIndex ===
                                        availableTags.length
                                    }
                                    className={cn(
                                        'cursor-pointer rounded-sm px-2 py-1.5 text-sm',
                                        activeOptionIndex ===
                                            availableTags.length &&
                                            'bg-accent text-accent-foreground',
                                    )}
                                    onMouseDown={(event) =>
                                        event.preventDefault()
                                    }
                                    onMouseMove={() =>
                                        setActiveOptionIndex(
                                            availableTags.length,
                                        )
                                    }
                                    onClick={() => addTag(draft)}
                                >
                                    Add “{draft.trim()}”
                                </div>
                            )}
                        </div>
                        {availableTags.length === 0 && !showCreateTag && (
                            <p className="px-2 py-1.5 text-sm text-muted-foreground">
                                {matchingTagIsSelected
                                    ? 'This keyword is already selected.'
                                    : 'All existing keywords are selected.'}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function FormFieldTagInput<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
>({
    control,
    name,
    label,
    options,
    placeholder,
    required = false,
    disabled,
    formItemClassName,
}: FormFieldTagInputProps<TFieldValues, TContext, TTransformedValues>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <FormItem className={formItemClassName}>
                    <FormLabel required={required}>{label}</FormLabel>
                    <TagInputControl
                        selectedTags={
                            Array.isArray(field.value)
                                ? field.value.map(String)
                                : []
                        }
                        options={options}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        placeholder={
                            placeholder ?? `Add a ${label.toLowerCase()}`
                        }
                        disabled={disabled ?? field.disabled ?? false}
                        invalid={fieldState.invalid}
                    />
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
