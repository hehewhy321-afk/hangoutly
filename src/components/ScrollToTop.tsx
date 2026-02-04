import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Handle window scroll
        window.scrollTo(0, 0);

        // Handle Lenis smooth scroll if present
        const lenis = (window as any).lenis;
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        }
    }, [pathname]);

    return null;
};
