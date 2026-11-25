import { format, isValid, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { TableFilter } from '@/components/data-table/filters/types';

export const FILTER_DEBOUNCE_MS = 400;

export interface CalendarDraft {
    inputValue: string;
    month: Date;
}

export const toFilterText = (selectedValue: string | undefined): string =>
    selectedValue ?? '';

export const toCalendarDraft = (
    selectedValue: string | undefined,
): CalendarDraft => {
    const date = selectedValue ? new Date(selectedValue) : null;

    return date && !Number.isNaN(date.getTime())
        ? { inputValue: format(date, 'PPP'), month: date }
        : { inputValue: '', month: new Date() };
};

export const toDateRange = (
    selectedValue: string | undefined,
): DateRange | undefined => {
    if (!selectedValue) {
        return undefined;
    }

    const [rawFrom, rawTo] = selectedValue
        .split(',')
        .map((part) => part.trim());

    return {
        from:
            rawFrom && isValid(parseISO(rawFrom))
                ? parseISO(rawFrom)
                : undefined,
        to: rawTo && isValid(parseISO(rawTo)) ? parseISO(rawTo) : undefined,
    };
};

export const describeFilterValue = (
    filter: TableFilter,
    value: string,
): string => {
    if (filter.type === 'date-range') {
        return value
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
            .join(' – ');
    }

    const {
        options = [],
        optionLabelKey = 'label',
        optionValueKey = 'value',
    } = filter;
    const labelFor = (raw: string) => {
        const option = options.find(
            (candidate) => String(candidate[optionValueKey]) === raw,
        );
        return option ? String(option[optionLabelKey]) : raw;
    };

    if (filter.type === 'multiselect' || filter.type === 'status') {
        return value.split(',').filter(Boolean).map(labelFor).join(', ');
    }

    return filter.type === 'select' || filter.type === 'searchable'
        ? labelFor(value)
        : value;
};
