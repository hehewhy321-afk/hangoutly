import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
    children: ReactNode;
    className?: string;
    columns?: 2 | 3 | 4;
}

export const BentoGrid = ({ children, className, columns = 3 }: BentoGridProps) => {
    const gridCols = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
    };

    return (
        <div
            className={cn(
                'grid grid-cols-1 gap-4',
                gridCols[columns],
                className
            )}
        >
            {children}
        </div>
    );
};

interface BentoItemProps {
    children: ReactNode;
    className?: string;
    span?: 1 | 2;
    rowSpan?: 1 | 2;
}

export const BentoItem = ({ children, className, span = 1, rowSpan = 1 }: BentoItemProps) => {
    const spanClasses = {
        1: '',
        2: 'md:col-span-2',
    };

    const rowSpanClasses = {
        1: '',
        2: 'md:row-span-2',
    };

    return (
        <div
            className={cn(
                'floating-card p-6 min-h-[200px]',
                spanClasses[span],
                rowSpanClasses[rowSpan],
                className
            )}
        >
            {children}
        </div>
    );
};
