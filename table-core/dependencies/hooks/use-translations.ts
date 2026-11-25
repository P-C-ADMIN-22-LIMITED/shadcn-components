/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePage } from '@inertiajs/react';
import isEmpty from 'lodash-es/isEmpty';
import { useMemo } from 'react';

type Translations = Record<string, unknown>;

type AvailableLocale = { code: string; name: string };

type I18nPageProps = {
    translations?: Translations;
    locale?: string;
    availableLocales?: AvailableLocale[];
};

const defaultTranslations: Translations = {
    'admin.common.cancel': 'Cancel',
    'admin.common.labels.active': 'Active',
    'admin.common.labels.inactive': 'Inactive',
    'admin.data_table.view_columns.view': 'View',
    'admin.data_table.pagination.rows_per_page': 'Rows per page',
    'admin.data_table.pagination.page_of': 'Page :current of :total',
    'admin.data_table.pagination.selected_rows':
        ':count row selected of :total|:count rows selected of :total',
    'admin.data_table.pagination.first_page': 'Go to first page',
    'admin.data_table.pagination.previous_page': 'Go to previous page',
    'admin.data_table.pagination.next_page': 'Go to next page',
    'admin.data_table.pagination.last_page': 'Go to last page',
    'admin.data_table.table_filters.label': 'Filters',
    'admin.data_table.table_filters.clear': 'Clear',
    'admin.data_table.table_filters.choose': 'Choose :label',
    'admin.data_table.table_filters.select_placeholder': 'Select :label',
    'admin.data_table.table_filters.search_placeholder': 'Search :label...',
    'admin.data_table.table_filters.empty_placeholder': 'No :label found.',
    'admin.data_table.table_filters.search_status': 'Status',
    'admin.data_table.table_filters.no_status_found': 'No status found',
    'admin.data_table.table_filters.pick_a_date': 'Pick a date',
    'admin.data_table.table_actions.label': 'Actions',
};

export function useTranslations() {
    const {
        translations: pageTranslations,
        locale = 'en',
        availableLocales,
    } = usePage<I18nPageProps>().props;
    const translations = useMemo(
        () => ({ ...defaultTranslations, ...pageTranslations }),
        [pageTranslations],
    );

    const knownRoots = useMemo(() => {
        return new Set(
            Object.keys(translations)
                .map((key) => key.split('.')[0])
                .filter(Boolean),
        );
    }, [translations]);

    const resolveKey = useMemo(() => {
        return (key: string): string => {
            if (translations[key]) {
                return key;
            }

            const root = key.split('.')[0];
            if (root && knownRoots.has(root)) {
                return key;
            }

            const adminKey = `admin.${key}`;
            if (translations[adminKey]) {
                return adminKey;
            }

            return key;
        };
    }, [knownRoots, translations]);

    const trans = useMemo(() => {
        return (
            key: string,
            replacements: Record<string, any> = {},
        ): string => {
            const resolvedKey = resolveKey(key);
            const message = translations[resolvedKey];

            if (isEmpty(message)) {
                return key;
            }

            return makeReplacements(message as string, replacements);
        };
    }, [resolveKey, translations]);

    const transChoice = useMemo(() => {
        return (
            key: string,
            number: number,
            replacements: Record<string, any> = {},
        ): string => {
            const message = trans(key, replacements);
            replacements.count = number.toString();

            return makeReplacements(
                choose(message, number, locale),
                replacements,
            );
        };
    }, [locale, trans]);

    return {
        trans,
        transChoice,
        availableLocales,
        locale,
    };
}

function makeReplacements(message: string, replacements: object) {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    Object.entries(replacements || [])
        .sort((a, b) => (a[0].length >= b[0].length ? -1 : 1))
        .forEach(([key, value]) => {
            value = value?.toString() ?? '';
            message = (message || '')
                .replace(new RegExp(`:${key}`, 'g'), value)
                .replace(
                    new RegExp(`:${key.toUpperCase()}`, 'g'),
                    value.toUpperCase(),
                )
                .replace(
                    new RegExp(`:${capitalize(key)}`, 'g'),
                    capitalize(value),
                );
        });
    return message;
}

/**
 * Select a proper translation string based on the given number.
 */
export function choose(message: string, number: number, lang: string) {
    let segments = message.split('|');
    const extracted = extract(segments, number);
    if (extracted !== null) {
        return extracted.trim();
    }
    segments = stripConditions(segments);
    const pluralIndex = getPluralIndex(lang, number);
    if (segments.length === 1 || !segments[pluralIndex]) {
        return segments[0];
    }
    return segments[pluralIndex];
}
/**
 * Extract a translation string using inline conditions.
 */
function extract(segments: string[], number: number) {
    for (const part of segments) {
        const line = extractFromString(part, number);
        if (line !== null) {
            return line;
        }
    }
    return null;
}
/**
 * Get the translation string if the condition matches.
 */
function extractFromString(part: string, number: number): string | null {
    const matches = part.match(/^[{[]([^[\]{}]*)[}\]]([\s\S]*)/) || [];
    if (matches.length !== 3) {
        return null;
    }
    const condition = matches[1];
    const value = matches[2];
    if (condition.includes(',')) {
        const [from, to] = condition.split(',');
        if (to === '*' && number >= parseFloat(from)) {
            return value;
        } else if (from === '*' && number <= parseFloat(to)) {
            return value;
        } else if (number >= parseFloat(from) && number <= parseFloat(to)) {
            return value;
        }
    }
    return parseFloat(condition) === number ? value : null;
}
/**
 * Strip the inline conditions from each segment, just leaving the text.
 */
function stripConditions(segments: string[]) {
    return segments.map((part) => part.replace(/^[{[]([^[\]{}]*)[}\]]/, ''));
}

function getPluralIndex(lang: string, number: number) {
    switch (lang.replace('_', '-')) {
        case 'af':
        case 'af-ZA':
        case 'bn':
        case 'bn-BD':
        case 'bn-IN':
        case 'bg':
        case 'bg-BG':
        case 'ca':
        case 'ca-AD':
        case 'ca-ES':
        case 'ca-FR':
        case 'ca-IT':
        case 'da':
        case 'da-DK':
        case 'de':
        case 'de-AT':
        case 'de-BE':
        case 'de-CH':
        case 'de-DE':
        case 'de-LI':
        case 'de-LU':
        case 'el':
        case 'el-CY':
        case 'el-GR':
        case 'en':
        case 'en-AG':
        case 'en-AU':
        case 'en-BW':
        case 'en-CA':
        case 'en-DK':
        case 'en-GB':
        case 'en-HK':
        case 'en-IE':
        case 'en-IN':
        case 'en-NG':
        case 'en-NZ':
        case 'en-PH':
        case 'en-SG':
        case 'en-US':
        case 'en-ZA':
        case 'en-ZM':
        case 'en-ZW':
        case 'eo':
        case 'eo-US':
        case 'es':
        case 'es-AR':
        case 'es-BO':
        case 'es-CL':
        case 'es-CO':
        case 'es-CR':
        case 'es-CU':
        case 'es-DO':
        case 'es-EC':
        case 'es-ES':
        case 'es-GT':
        case 'es-HN':
        case 'es-MX':
        case 'es-NI':
        case 'es-PA':
        case 'es-PE':
        case 'es-PR':
        case 'es-PY':
        case 'es-SV':
        case 'es-US':
        case 'es-UY':
        case 'es-VE':
        case 'et':
        case 'et-EE':
        case 'eu':
        case 'eu-ES':
        case 'eu-FR':
        case 'fa':
        case 'fa-IR':
        case 'fi':
        case 'fi-FI':
        case 'fo':
        case 'fo-FO':
        case 'fur':
        case 'fur-IT':
        case 'fy':
        case 'fy-DE':
        case 'fy-NL':
        case 'gl':
        case 'gl-ES':
        case 'gu':
        case 'gu-IN':
        case 'ha':
        case 'ha-NG':
        case 'he':
        case 'he-IL':
        case 'hu':
        case 'hu-HU':
        case 'is':
        case 'is-IS':
        case 'it':
        case 'it-CH':
        case 'it-IT':
        case 'ku':
        case 'ku-TR':
        case 'lb':
        case 'lb-LU':
        case 'ml':
        case 'ml-IN':
        case 'mn':
        case 'mn-MN':
        case 'mr':
        case 'mr-IN':
        case 'nah':
        case 'nb':
        case 'nb-NO':
        case 'ne':
        case 'ne-NP':
        case 'nl':
        case 'nl-AW':
        case 'nl-BE':
        case 'nl-NL':
        case 'nn':
        case 'nn-NO':
        case 'no':
        case 'om':
        case 'om-ET':
        case 'om-KE':
        case 'or':
        case 'or-IN':
        case 'pa':
        case 'pa-IN':
        case 'pa-PK':
        case 'pap':
        case 'pap-AN':
        case 'pap-AW':
        case 'pap-CW':
        case 'ps':
        case 'ps-AF':
        case 'pt':
        case 'pt-BR':
        case 'pt-PT':
        case 'so':
        case 'so-DJ':
        case 'so-ET':
        case 'so-KE':
        case 'so-SO':
        case 'sq':
        case 'sq-AL':
        case 'sq-MK':
        case 'sv':
        case 'sv-FI':
        case 'sv-SE':
        case 'sw':
        case 'sw-KE':
        case 'sw-TZ':
        case 'ta':
        case 'ta-IN':
        case 'ta-LK':
        case 'te':
        case 'te-IN':
        case 'tk':
        case 'tk-TM':
        case 'ur':
        case 'ur-IN':
        case 'ur-PK':
        case 'zu':
        case 'zu-ZA':
            return number === 1 ? 0 : 1;
        case 'am':
        case 'am-ET':
        case 'bh':
        case 'fil':
        case 'fil-PH':
        case 'fr':
        case 'fr-BE':
        case 'fr-CA':
        case 'fr-CH':
        case 'fr-FR':
        case 'fr-LU':
        case 'gun':
        case 'hi':
        case 'hi-IN':
        case 'hy':
        case 'hy-AM':
        case 'ln':
        case 'ln-CD':
        case 'mg':
        case 'mg-MG':
        case 'nso':
        case 'nso-ZA':
        case 'ti':
        case 'ti-ER':
        case 'ti-ET':
        case 'wa':
        case 'wa-BE':
        case 'xbr':
            return number === 0 || number === 1 ? 0 : 1;
        case 'be':
        case 'be-BY':
        case 'bs':
        case 'bs-BA':
        case 'hr':
        case 'hr-HR':
        case 'ru':
        case 'ru-RU':
        case 'ru-UA':
        case 'sr':
        case 'sr-ME':
        case 'sr-RS':
        case 'uk':
        case 'uk-UA':
            return number % 10 == 1 && number % 100 != 11
                ? 0
                : number % 10 >= 2 &&
                    number % 10 <= 4 &&
                    (number % 100 < 10 || number % 100 >= 20)
                  ? 1
                  : 2;
        case 'cs':
        case 'cs-CZ':
        case 'sk':
        case 'sk-SK':
            return number == 1 ? 0 : number >= 2 && number <= 4 ? 1 : 2;
        case 'ga':
        case 'ga-IE':
            return number == 1 ? 0 : number == 2 ? 1 : 2;
        case 'lt':
        case 'lt-LT':
            return number % 10 == 1 && number % 100 != 11
                ? 0
                : number % 10 >= 2 && (number % 100 < 10 || number % 100 >= 20)
                  ? 1
                  : 2;
        case 'sl':
        case 'sl-SI':
            return number % 100 == 1
                ? 0
                : number % 100 == 2
                  ? 1
                  : number % 100 == 3 || number % 100 == 4
                    ? 2
                    : 3;
        case 'mk':
        case 'mk-MK':
            return number % 10 == 1 ? 0 : 1;
        case 'mt':
        case 'mt-MT':
            return number == 1
                ? 0
                : number == 0 || (number % 100 > 1 && number % 100 < 11)
                  ? 1
                  : number % 100 > 10 && number % 100 < 20
                    ? 2
                    : 3;
        case 'lv':
        case 'lv-LV':
            return number == 0
                ? 0
                : number % 10 == 1 && number % 100 != 11
                  ? 1
                  : 2;
        case 'pl':
        case 'pl-PL':
            return number == 1
                ? 0
                : number % 10 >= 2 &&
                    number % 10 <= 4 &&
                    (number % 100 < 12 || number % 100 > 14)
                  ? 1
                  : 2;
        case 'cy':
        case 'cy-GB':
            return number == 1
                ? 0
                : number == 2
                  ? 1
                  : number == 8 || number == 11
                    ? 2
                    : 3;
        case 'ro':
        case 'ro-RO':
            return number == 1
                ? 0
                : number == 0 || (number % 100 > 0 && number % 100 < 20)
                  ? 1
                  : 2;
        case 'ar':
        case 'ar-AE':
        case 'ar-BH':
        case 'ar-DZ':
        case 'ar-EG':
        case 'ar-IN':
        case 'ar-IQ':
        case 'ar-JO':
        case 'ar-KW':
        case 'ar-LB':
        case 'ar-LY':
        case 'ar-MA':
        case 'ar-OM':
        case 'ar-QA':
        case 'ar-SA':
        case 'ar-SD':
        case 'ar-SS':
        case 'ar-SY':
        case 'ar-TN':
        case 'ar-YE':
            return number == 0
                ? 0
                : number == 1
                  ? 1
                  : number == 2
                    ? 2
                    : number % 100 >= 3 && number % 100 <= 10
                      ? 3
                      : number % 100 >= 11 && number % 100 <= 99
                        ? 4
                        : 5;
        default:
            return 0;
    }
}
