import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MiniChart } from './MiniChart';

interface StatWidgetProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    subValue?: string;
    trend?: number[];
    trendLabel?: string;
    trendDirection?: "up" | "down";
    color?: "orange" | "green" | "blue" | "indigo" | "rose";
    className?: string;
    onClick?: () => void;
}

const colorMaps = {
    orange: { text: "text-orange-500", bg: "bg-orange-50", line: "#f97316", border: "hover:border-orange-200" },
    green: { text: "text-emerald-500", bg: "bg-emerald-50", line: "#10b981", border: "hover:border-emerald-200" },
    blue: { text: "text-sky-500", bg: "bg-sky-50", line: "#0ea5e9", border: "hover:border-sky-200" },
    indigo: { text: "text-indigo-500", bg: "bg-indigo-50", line: "#6366f1", border: "hover:border-indigo-200" },
    rose: { text: "text-rose-500", bg: "bg-rose-50", line: "#f43f5e", border: "hover:border-rose-200" },
};

export const StatWidget = ({
    label,
    value,
    icon: Icon,
    subValue,
    trend,
    trendLabel,
    trendDirection,
    color = "orange",
    className,
    onClick
}: StatWidgetProps) => {
    const scheme = colorMaps[color];

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={cn(
                "glass-card p-6 border border-slate-100 shadow-sm transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px]",
                onClick && "cursor-pointer active:scale-95",
                scheme.border,
                className
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", scheme.bg)}>
                    <Icon className={cn("w-5 h-5", scheme.text)} strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className="w-20">
                        <MiniChart data={trend} color={scheme.line} />
                    </div>
                )}
            </div>

            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
                    {subValue && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{subValue}</span>
                    )}
                    {trendLabel && (
                        <div className={cn(
                            "flex items-center gap-0.5 text-[9px] font-black uppercase tracking-tighter",
                            trendDirection === 'up' ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {trendDirection === 'up' ? '↑' : '↓'} {trendLabel}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
