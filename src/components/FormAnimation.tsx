import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FormAnimationProps {
    children: ReactNode;
    delay?: number;
}

export const FormAnimation = ({ children, delay = 0 }: FormAnimationProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: delay,
                ease: [0.22, 1, 0.36, 1]
            }}
        >
            {children}
        </motion.div>
    );
};

export const StaggeredForm = ({ children }: { children: ReactNode[] }) => {
    return (
        <>
            {children.map((child, i) => (
                <FormAnimation key={i} delay={i * 0.1}>
                    {child}
                </FormAnimation>
            ))}
        </>
    );
};
