import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { animations } from '@/lib/animations';

interface AnimatedCounterProps {
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export const AnimatedCounter = ({
    end,
    duration = 2,
    suffix = '',
    prefix = '',
    className = '',
}: AnimatedCounterProps) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView || !ref.current) return;

        const element = ref.current;
        const obj = { value: 0 };

        const tween = animations.counter(element, end, {
            duration,
            onUpdate: () => {
                setCount(Math.round(obj.value));
            },
        });

        return () => {
            tween.kill();
        };
    }, [isInView, end, duration]);

    return (
        <span ref={ref} className={className}>
            {prefix}
            {count.toLocaleString()}
            {suffix}
        </span>
    );
};
