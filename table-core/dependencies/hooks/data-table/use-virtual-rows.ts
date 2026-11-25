import { Row } from '@tanstack/react-table';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

export const VIRTUALIZATION_THRESHOLD = 40;
export const ESTIMATED_ROW_HEIGHT = 52;
export const OVERSCAN = 8;

type ScrollState = {
    offset: number;
    viewport: number;
};

export type VirtualRowsResult<TData> = {
    containerRef: RefObject<HTMLDivElement | null>;
    visibleRows: Row<TData>[];
    topPadding: number;
    bottomPadding: number;
};

export function useVirtualRows<TData>(
    rows: Row<TData>[],
    enabled: boolean,
): VirtualRowsResult<TData> {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [scrollState, setScrollState] = useState<ScrollState>({
        offset: 0,
        viewport: 0,
    });

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const element = containerRef.current;
        if (!element) return;

        let animationFrame: number | null = null;

        const measure = () => {
            animationFrame = null;
            const newOffset = element.scrollTop;
            const newViewport = element.clientHeight;

            setScrollState((prev) => {
                if (
                    prev.offset === newOffset &&
                    prev.viewport === newViewport
                ) {
                    return prev;
                }
                return { offset: newOffset, viewport: newViewport };
            });
        };

        measure();

        const handleScroll = () => {
            if (animationFrame == null) {
                animationFrame = requestAnimationFrame(measure);
            }
        };

        element.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', measure);

        return () => {
            if (animationFrame != null) cancelAnimationFrame(animationFrame);
            element.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', measure);
        };
    }, [enabled, rows.length]);

    const virtualizationState = useMemo(() => {
        if (!enabled) {
            return {
                containerRef,
                visibleRows: rows,
                topPadding: 0,
                bottomPadding: 0,
            };
        }

        const { offset, viewport } = scrollState;
        const startIndex = Math.max(
            0,
            Math.floor(offset / ESTIMATED_ROW_HEIGHT) - OVERSCAN,
        );
        const endIndex = Math.min(
            rows.length,
            Math.ceil((offset + viewport) / ESTIMATED_ROW_HEIGHT) + OVERSCAN,
        );

        return {
            containerRef,
            visibleRows: rows.slice(startIndex, endIndex),
            topPadding: startIndex * ESTIMATED_ROW_HEIGHT,
            bottomPadding: Math.max(
                0,
                (rows.length - endIndex) * ESTIMATED_ROW_HEIGHT,
            ),
        };
    }, [enabled, rows, scrollState]);

    return virtualizationState;
}
