import { useRef, useEffect, ReactNode } from 'react';
import { createMagneticEffect } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: (e?: any) => void;
    strength?: number;
    variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export const MagneticButton = ({
    children,
    className,
    onClick,
    strength = 0.3,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
}: MagneticButtonProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!buttonRef.current || disabled) return;
        const cleanup = createMagneticEffect(buttonRef.current, strength);
        return cleanup;
    }, [strength, disabled]);

    const variantStyles = {
        primary: 'bg-gradient-primary text-white shadow-glow hover:shadow-glow-lg',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'bg-transparent hover:bg-secondary/50',
        accent: 'bg-gradient-tertiary text-white shadow-glow',
        outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            ref={buttonRef}
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={cn(
                'relative overflow-hidden rounded-xl font-bold',
                'inline-flex items-center justify-center gap-2',
                'transition-all duration-300 ease-out',
                'hover:-translate-y-1 active:translate-y-0',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            {children}
        </button>
    );
};
