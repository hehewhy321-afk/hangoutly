import { ReactNode } from 'react';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';

interface FloatingCardProps {
    children: ReactNode;
    className?: string;
    tiltMaxAngle?: number;
    scale?: number;
}

export const FloatingCard = ({
    children,
    className = '',
    tiltMaxAngle = 10,
    scale = 1.02,
}: FloatingCardProps) => {
    return (
        <Tilt
            tiltMaxAngleX={tiltMaxAngle}
            tiltMaxAngleY={tiltMaxAngle}
            perspective={1000}
            scale={scale}
            transitionSpeed={2000}
            gyroscope={true}
            className={className}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-full"
                style={{
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                {/* Card content */}
                <div
                    className="relative"
                    style={{
                        transform: 'translateZ(20px)',
                    }}
                >
                    {children}
                </div>
            </motion.div>
        </Tilt>
    );
};
