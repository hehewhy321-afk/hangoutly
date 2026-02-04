import { motion } from 'framer-motion';

interface MiniChartProps {
    data: number[];
    color?: string;
}

export const MiniChart = ({ data, color = "#f97316" }: MiniChartProps) => {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 80 - ((val - min) / range) * 60; // 20-80 range
        return `${x} ${y}`;
    });

    const pathData = `M ${points.join(' L ')}`;
    const areaData = `${pathData} L 100 100 L 0 100 Z`;

    return (
        <div className="w-full h-12 flex items-end overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={pathData}
                />
                <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ delay: 1, duration: 1 }}
                    fill={color}
                    d={areaData}
                />
            </svg>
        </div>
    );
};
