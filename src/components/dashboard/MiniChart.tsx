import { motion } from 'framer-motion';

interface MiniChartProps {
    data: number[];
    color?: string;
}

export const MiniChart = ({ data, color = "#f97316" }: MiniChartProps) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 80 - ((val - min) / (range || 1)) * 60; // 20-80 range
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-12 flex items-end overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <motion.polyline
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
                <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ delay: 1, duration: 1 }}
                    fill={color}
                    d={`M 0 100 L ${points} L 100 100 Z`}
                />
            </svg>
        </div>
    );
};
