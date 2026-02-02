import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
    children: React.ReactNode;
}

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            lerp: 0.1, // Snappier response
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
        });

        lenisRef.current = lenis;
        (window as any).lenis = lenis; // Expose for internal utilities

        // Sync Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        // Cleanup
        return () => {
            lenis.destroy();
            gsap.ticker.remove((time) => {
                lenis.raf(time * 1000);
            });
        };
    }, []);

    return <>{children}</>;
};

// Hook to access Lenis instance
export const useLenis = () => {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Get Lenis instance from window if available
        const lenis = (window as any).lenis;
        if (lenis) {
            lenisRef.current = lenis;
        }
    }, []);

    return lenisRef.current;
};

// Scroll to element utility
export const scrollToElement = (target: string | HTMLElement, offset = 0) => {
    const lenis = (window as any).lenis as Lenis;
    if (lenis) {
        lenis.scrollTo(target, {
            offset,
            duration: 0.6,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
    }
};
