import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Premium color scales
        purple: {
          50: "hsl(250, 84%, 97%)",
          100: "hsl(250, 84%, 95%)",
          200: "hsl(250, 84%, 90%)",
          300: "hsl(250, 84%, 75%)",
          400: "hsl(250, 84%, 60%)",
          500: "hsl(250, 84%, 54%)",
          600: "hsl(250, 84%, 45%)",
          700: "hsl(250, 84%, 35%)",
          800: "hsl(250, 84%, 25%)",
          900: "hsl(250, 84%, 15%)",
        },
        green: {
          50: "hsl(142, 76%, 97%)",
          100: "hsl(142, 76%, 92%)",
          200: "hsl(142, 76%, 85%)",
          300: "hsl(142, 76%, 70%)",
          400: "hsl(142, 76%, 50%)",
          500: "hsl(142, 76%, 36%)",
          600: "hsl(142, 76%, 28%)",
          700: "hsl(142, 76%, 22%)",
          800: "hsl(142, 76%, 16%)",
          900: "hsl(142, 76%, 10%)",
        },
        orange: {
          50: "hsl(24, 95%, 97%)",
          100: "hsl(24, 95%, 92%)",
          200: "hsl(24, 95%, 85%)",
          300: "hsl(24, 95%, 70%)",
          400: "hsl(24, 95%, 60%)",
          500: "hsl(24, 95%, 53%)",
          600: "hsl(24, 95%, 45%)",
          700: "hsl(24, 95%, 35%)",
          800: "hsl(24, 95%, 25%)",
          900: "hsl(24, 95%, 15%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
        "144": "36rem",
        "160": "40rem",
      },
      boxShadow: {
        float: "0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        "float-lg": "0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        glass: "0 8px 32px -4px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)",
        glow: "0 0 20px rgba(250, 84%, 54%, 0.3)",
        "glow-accent": "0 0 20px rgba(142, 76%, 36%, 0.3)",
        deep: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "scroll-bounce": "scrollBounce 2s infinite",
        "skeleton-shimmer": "skeletonShimmer 2s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scrollBounce: {
          "0%, 100%": { transform: "translateY(0)", opacity: "1" },
          "50%": { transform: "translateY(12px)", opacity: "0.5" },
        },
        skeletonShimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, hsl(250, 84%, 54%) 0%, hsl(270, 80%, 60%) 100%)",
        "gradient-primary": "linear-gradient(135deg, hsl(250, 84%, 54%) 0%, hsl(260, 80%, 58%) 100%)",
        "gradient-accent": "linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(152, 70%, 40%) 100%)",
        "gradient-tertiary": "linear-gradient(135deg, hsl(24, 95%, 53%) 0%, hsl(34, 90%, 58%) 100%)",
        "gradient-mesh": "radial-gradient(at 40% 20%, hsla(250,84%,54%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(142,76%,36%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(24,95%,53%,0.1) 0px, transparent 50%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(-5%)", animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)" },
          "50%": { transform: "translateY(0)", animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.3s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "bounce-slow": "bounce 2s infinite",
      },
      boxShadow: {
        glass: "0 4px 24px 0 rgba(0, 0, 0, 0.06)",
        "glass-lg": "0 8px 32px -4px rgba(0, 0, 0, 0.1)",
        primary: "0 2px 8px -2px rgba(0, 0, 0, 0.12)",
        "primary-lg": "0 4px 12px -2px rgba(0, 0, 0, 0.15)",
        soft: "0 2px 12px -2px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.04)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, hsl(237, 16%, 48%) 0%, hsl(237, 20%, 58%) 100%)",
        "gradient-glass": "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)",
        "gradient-hero": "linear-gradient(180deg, hsl(220, 13%, 97%) 0%, hsl(220, 13%, 94%) 100%)",
        "gradient-card": "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 100%)",
        "gradient-teal": "linear-gradient(135deg, hsl(174, 44%, 96%) 0%, hsl(174, 40%, 93%) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
