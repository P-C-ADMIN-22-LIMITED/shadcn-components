import {
    useEffect,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from 'react';

export function useSyncedDraft<TSource, TDraft>(
    source: TSource,
    createDraft: (source: TSource) => TDraft,
): [TDraft, Dispatch<SetStateAction<TDraft>>] {
    const [draft, setDraft] = useState<TDraft>(() => createDraft(source));
    const previousSource = useRef(source);

    useEffect(() => {
        if (Object.is(previousSource.current, source)) {
            return;
        }

        previousSource.current = source;
        setDraft(createDraft(source));
    }, [createDraft, source]);

    return [draft, setDraft];
}
