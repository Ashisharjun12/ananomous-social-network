import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
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
                background: '#000000',
                foreground: '#FFFFFF',
                primary: {
                    DEFAULT: '#0095F6',
                    hover: '#1877F2',
                },
                secondary: {
                    DEFAULT: '#262626',
                    hover: '#363636',
                },
                accent: {
                    DEFAULT: '#2E2E2E',
                    hover: '#3E3E3E',
                },
                muted: '#8E8E8E',
                border: '#262626',
                input: '#262626',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            backdropBlur: {
                'sm': '8px',
            },
            keyframes: {
                'slide-up': {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                }
            },
            animation: {
                'slide-up': 'slide-up 0.3s ease-out',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
    darkMode: 'class',
};

export default config;
