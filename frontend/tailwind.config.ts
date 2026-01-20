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
        // CodeSolve Primary Colors
        'cs-cyan': 'hsl(var(--cs-cyan))',
        'cs-blue': 'hsl(var(--cs-blue))',
        'cs-mid-blue': 'hsl(var(--cs-mid-blue))',
        
        // CodeSolve Background Colors
        'cs-bg': {
          primary: 'hsl(var(--cs-bg-primary))',
          sidebar: 'hsl(var(--cs-bg-sidebar))',
          card: 'hsl(var(--cs-bg-card))',
          'card-hover': 'hsl(var(--cs-bg-card-hover))',
          input: 'hsl(var(--cs-bg-input))',
        },
        
        // CodeSolve Text Colors
        'cs-text': {
          primary: 'hsl(var(--cs-text-primary))',
          secondary: 'hsl(var(--cs-text-secondary))',
          disabled: 'hsl(var(--cs-text-disabled))',
        },
        
        // CodeSolve Border Colors
        'cs-border': {
          DEFAULT: 'hsl(var(--border))',
          light: 'hsl(var(--cs-border-light))',
          focus: 'hsl(var(--cs-border-focus))',
        },
        
        // CodeSolve Status Colors
        'cs-success': 'hsl(var(--cs-success))',
        'cs-warning': 'hsl(var(--cs-warning))',
        'cs-error': 'hsl(var(--cs-error))',
        'cs-info': 'hsl(var(--cs-info))',

        // Shadcn tokens
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
      },
      backgroundImage: {
        'cs-gradient': 'linear-gradient(135deg, #00D4FF 0%, #0066FF 100%)',
        'cs-gradient-h': 'linear-gradient(to right, #00D4FF, #0066FF)',
        'cs-gradient-v': 'linear-gradient(to bottom, #00D4FF, #0066FF)',
        'cs-glow': 'radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'cs-xs': '12px',
        'cs-sm': '14px',
        'cs-base': '15px',
        'cs-lg': '18px',
        'cs-xl': '20px',
        'cs-2xl': '24px',
        'cs-3xl': '32px',
        'cs-4xl': '48px',
      },
      spacing: {
        'sidebar': '280px',
        'sidebar-collapsed': '80px',
        'header': '64px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'cs-sm': '4px',
        'cs-md': '8px',
        'cs-lg': '12px',
        'cs-xl': '16px',
      },
      boxShadow: {
        'cs-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'cs-md': '0 4px 6px rgba(0, 0, 0, 0.4)',
        'cs-lg': '0 10px 15px rgba(0, 0, 0, 0.5)',
        'cs-glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'cs-glow-blue': '0 0 20px rgba(0, 102, 255, 0.3)',
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
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "enter": {
          from: { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "slide-in": "slide-in 0.3s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "enter": "enter 0.4s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
