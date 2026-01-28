/** @type {import('tailwindcss').Config} */
import { heroui } from '@heroui/theme/plugin';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: 'rgb(var(--color-primary-50-rgb) / <alpha-value>)',
                    100: 'rgb(var(--color-primary-100-rgb) / <alpha-value>)',
                    200: 'rgb(var(--color-primary-200-rgb) / <alpha-value>)',
                    300: 'rgb(var(--color-primary-300-rgb) / <alpha-value>)',
                    400: 'rgb(var(--color-primary-400-rgb) / <alpha-value>)',
                    500: 'rgb(var(--color-primary-500-rgb) / <alpha-value>)',
                    600: 'rgb(var(--color-primary-600-rgb) / <alpha-value>)',
                    700: 'rgb(var(--color-primary-700-rgb) / <alpha-value>)',
                    800: 'rgb(var(--color-primary-800-rgb) / <alpha-value>)',
                    900: 'rgb(var(--color-primary-900-rgb) / <alpha-value>)',
                    950: 'rgb(var(--color-primary-950-rgb) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--color-primary-500-rgb) / <alpha-value>)',
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-in': 'slideIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
                'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
                'card-hover': '0 4px 16px rgba(0, 0, 0, 0.1)',
            },
            backdropBlur: {
                'xs': '2px',
            },
        },
    },
    plugins: [heroui()],
}
