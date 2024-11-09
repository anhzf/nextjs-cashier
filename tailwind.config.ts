import { addIconSelectors } from '@iconify/tailwind';
import type { Config } from 'tailwindcss';

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './ui.ts',
  ],
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        // Left Shadows
        'l-sm': '-1px 0 2px 0 rgb(0 0 0 / 0.05)', // left small
        'l': '-1px 1px 3px 0 rgb(0 0 0 / 0.1), -1px 1px 2px -1px rgb(0 0 0 / 0.1)', // left default
        'l-md': '-4px 4px 6px -1px rgb(0 0 0 / 0.1), -2px 2px 4px -2px rgb(0 0 0 / 0.1)', // left md
        'l-lg': '-10px 10px 15px -3px rgb(0 0 0 / 0.1), -4px 4px 6px -4px rgb(0 0 0 / 0.1)', // left lg
        'l-xl': '-20px 20px 25px -5px rgb(0 0 0 / 0.1), -8px 8px 10px -6px rgb(0 0 0 / 0.1)', // left xl
        'l-2xl': '-25px 25px 50px -12px rgb(0 0 0 / 0.25)', // left 2xl

        // Right Shadows
        'r-sm': '1px 0 2px 0 rgb(0 0 0 / 0.05)', // right small
        'r': '1px 1px 3px 0 rgb(0 0 0 / 0.1), 1px 1px 2px -1px rgb(0 0 0 / 0.1)', // right default
        'r-md': '4px 4px 6px -1px rgb(0 0 0 / 0.1), 2px 2px 4px -2px rgb(0 0 0 / 0.1)', // right md
        'r-lg': '10px 10px 15px -3px rgb(0 0 0 / 0.1), 4px 4px 6px -4px rgb(0 0 0 / 0.1)', // right lg
        'r-xl': '20px 20px 25px -5px rgb(0 0 0 / 0.1), 8px 8px 10px -6px rgb(0 0 0 / 0.1)', // right xl
        'r-2xl': '25px 25px 50px -12px rgb(0 0 0 / 0.25)', // right 2xl

        // Top Shadows
        't-sm': '0 -1px 2px 0 rgb(0 0 0 / 0.05)', // top small
        't': '0 -1px 3px 0 rgb(0 0 0 / 0.1), 0 -1px 2px -1px rgb(0 0 0 / 0.1)', // top default
        't-md': '0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1)', // top md
        't-lg': '0 -10px 15px -3px rgb(0 0 0 / 0.1), 0 -4px 6px -4px rgb(0 0 0 / 0.1)', // top lg
        't-xl': '0 -20px 25px -5px rgb(0 0 0 / 0.1), 0 -8px 10px -6px rgb(0 0 0 / 0.1)', // top xl
        't-2xl': '0 -25px 50px -12px rgb(0 0 0 / 0.25)', // top 2xl
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    addIconSelectors(['mdi']),
  ],
} satisfies Config

export default config