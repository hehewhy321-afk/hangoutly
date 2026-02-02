import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'circle' | 'card' | 'text';
}

export const PremiumSkeleton = ({ className, variant = 'default', ...props }: SkeletonProps) => {
    return (
        <div
            className={cn(
                "animate-shimmer bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:400%_100%]",
                variant === 'circle' && "rounded-full",
                variant === 'card' && "rounded-[2rem]",
                variant === 'text' && "rounded-lg h-4 w-full",
                variant === 'default' && "rounded-xl",
                className
            )}
            {...props}
        />
    );
};

export const DashboardSkeleton = () => {
    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <PremiumSkeleton variant="text" className="w-48 h-8" />
                    <PremiumSkeleton variant="text" className="w-64 h-4" />
                </div>
                <PremiumSkeleton variant="circle" className="w-12 h-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <PremiumSkeleton key={i} variant="card" className="h-32" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <PremiumSkeleton variant="card" className="lg:col-span-8 h-[400px]" />
                <PremiumSkeleton variant="card" className="lg:col-span-4 h-[400px]" />
            </div>
        </div>
    );
};
