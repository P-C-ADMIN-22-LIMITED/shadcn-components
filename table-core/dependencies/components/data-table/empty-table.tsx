import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';

type EmptyTableProps = {
    colSpan?: number;
    title?: string;
    description?: string;
    hasButton?: boolean;
    buttonName?: string;
    buttonOnClick?: () => void;
    hasActiveFilters?: boolean;
};

function StackedCardsIllustration() {
    return (
        <div className="relative h-24 w-52" aria-hidden="true">
            {/* Back card */}
            <div className="absolute inset-x-6 top-0 h-6 rounded-t-lg border border-primary/20 bg-primary/10" />
            {/* Middle card */}
            <div className="absolute inset-x-3 top-3 h-6 rounded-t-lg border border-primary/30 bg-primary/20" />
            {/* Front card */}
            <div className="absolute inset-x-0 top-6 flex h-16 items-center gap-3 rounded-lg border border-primary/45 bg-background px-4 shadow-sm">
                <div className="size-8 shrink-0 rounded bg-primary/30" />
                <div className="flex flex-1 flex-col gap-1.5">
                    <div className="h-2.5 w-3/4 rounded bg-primary/30" />
                    <div className="h-2 w-1/2 rounded bg-primary/20" />
                </div>
            </div>
            {/* Fade overlay */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-b from-primary/0 via-background/60 to-background" />
        </div>
    );
}

export default function EmptyTable({
    colSpan = 1,
    title = 'No results yet',
    description = 'No data has been added yet.',
    hasButton = false,
    buttonName = 'Create',
    buttonOnClick,
    hasActiveFilters,
}: EmptyTableProps) {
    const resolvedTitle = hasActiveFilters ? 'No results found' : title;
    const resolvedDescription = hasActiveFilters
        ? 'Try adjusting your search or filters to find what you are looking for.'
        : description;

    return (
        <TableBody>
            <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="p-0">
                    <div className="flex items-center justify-center">
                        <Empty className="md:p-0 md:py-8">
                            <EmptyHeader>
                                {hasActiveFilters ? null : (
                                    <EmptyMedia>
                                        <StackedCardsIllustration />
                                    </EmptyMedia>
                                )}

                                <EmptyTitle>{resolvedTitle}</EmptyTitle>
                                {resolvedDescription ? (
                                    <EmptyDescription>
                                        {resolvedDescription}
                                    </EmptyDescription>
                                ) : null}
                            </EmptyHeader>
                            {hasButton && !hasActiveFilters && (
                                <EmptyContent>
                                    <Button
                                        variant={'outline'}
                                        onClick={buttonOnClick}
                                        className={
                                            'border border-primary text-primary hover:bg-primary/5 hover:text-primary'
                                        }
                                    >
                                        {buttonName}
                                    </Button>
                                </EmptyContent>
                            )}
                        </Empty>
                    </div>
                </TableCell>
            </TableRow>
        </TableBody>
    );
}
