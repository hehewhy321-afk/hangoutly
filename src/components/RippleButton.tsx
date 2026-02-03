import { ReactNode, useState, MouseEvent } from 'react';
import { motion } from 'framer-motion';

interface RippleButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

interface Ripple {
    x: number;
    y: number;
    id: number;
}

export const RippleButton = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    size = 'md',
}: RippleButtonProps) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = {
            x,
            y,
            id: Date.now(),
        };

        setRipples([...ripples, newRipple]);

        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 600);

        onClick?.();
    };

    const variantClasses = {
        primary: 'bg-gradient-primary text-white shadow-glow-primary hover:shadow-glow-primary-lg',
        secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary/5',
        ghost: 'bg-transparent text-foreground border-2 border-border hover:bg-secondary',
    };

    const sizeClasses = {
        sm: 'px-6 py-2.5 text-sm',
        md: 'px-8 py-3.5 text-base',
        lg: 'px-10 py-4 text-lg',
    };

    return (
        <motion.button
            onClick={handleClick}
            data-magnetic
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
        relative overflow-hidden rounded-2xl font-bold
        transition-all duration-300
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
        >
            {/* Ripple effects */}
            {ripples.map((ripple) => (
                <motion.span
                    key={ripple.id}
                    className="absolute rounded-full bg-white/30"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: 0,
                        height: 0,
                    }}
                    initial={{ width: 0, height: 0, opacity: 1 }}
                    animate={{
                        width: 500,
                        height: 500,
                        opacity: 0,
                        x: -250,
                        y: -250,
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
            ))}

            {/* Button content */}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};
