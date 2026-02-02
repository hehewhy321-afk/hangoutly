import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Animation presets
export const animations = {
    // Fade in up animation
    fadeInUp: (element: HTMLElement | string, options = {}) => {
        return gsap.from(element, {
            y: 60,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            ...options,
        });
    },

    // Fade in animation
    fadeIn: (element: HTMLElement | string, options = {}) => {
        return gsap.from(element, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            ...options,
        });
    },

    // Stagger children animation
    staggerFadeIn: (children: HTMLElement[] | string, options = {}) => {
        return gsap.from(children, {
            y: 40,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
            ...options,
        });
    },

    // Scale in animation
    scaleIn: (element: HTMLElement | string, options = {}) => {
        return gsap.from(element, {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            ease: 'back.out(1.7)',
            ...options,
        });
    },

    // Slide in from left
    slideInLeft: (element: HTMLElement | string, options = {}) => {
        return gsap.from(element, {
            x: -100,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            ...options,
        });
    },

    // Slide in from right
    slideInRight: (element: HTMLElement | string, options = {}) => {
        return gsap.from(element, {
            x: 100,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            ...options,
        });
    },

    // Parallax scroll effect
    parallax: (element: HTMLElement | string, trigger: HTMLElement | string, options = {}) => {
        return gsap.to(element, {
            y: -100,
            ease: 'none',
            scrollTrigger: {
                trigger,
                scrub: true,
                ...options,
            },
        });
    },

    // Reveal on scroll
    revealOnScroll: (element: HTMLElement | string, options = {}) => {
        return gsap.from(element, {
            y: 80,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                end: 'top 60%',
                toggleActions: 'play none none reverse',
                ...options,
            },
        });
    },

    // Counter animation
    counter: (element: HTMLElement, target: number, options = {}) => {
        const obj = { value: 0 };
        return gsap.to(obj, {
            value: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
                element.textContent = Math.round(obj.value).toLocaleString();
            },
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            ...options,
        });
    },
};

// Magnetic effect for elements
export const createMagneticEffect = (element: HTMLElement, strength = 0.3) => {
    const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        gsap.to(element, {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease: 'power2.out',
        });
    };

    const handleMouseLeave = () => {
        gsap.to(element, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)',
        });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
    };
};

// 3D tilt effect for cards
export const create3DTilt = (element: HTMLElement, maxTilt = 10) => {
    const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        gsap.to(element, {
            rotateX,
            rotateY,
            duration: 0.3,
            ease: 'power2.out',
            transformPerspective: 1000,
        });
    };

    const handleMouseLeave = () => {
        gsap.to(element, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: 'power2.out',
        });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
    };
};

// Page transition
export const pageTransition = {
    enter: (element: HTMLElement) => {
        return gsap.from(element, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power3.out',
        });
    },
    exit: (element: HTMLElement) => {
        return gsap.to(element, {
            opacity: 0,
            y: -20,
            duration: 0.4,
            ease: 'power3.in',
        });
    },
};

// Ripple effect
export const createRipple = (element: HTMLElement, e: MouseEvent) => {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    element.appendChild(ripple);

    gsap.to(ripple, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove(),
    });
};

export default animations;
