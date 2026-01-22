/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                glass: {
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.2)',
                    300: 'rgba(255, 255, 255, 0.3)',
                }
            },
            animation: {
                'bounce-subtle': 'bounce-subtle 2s infinite',
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                'bounce-subtle': {
                    '0%, 100%': { transform: 'translateY(-5%)' },
                    '50%': { transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)' },
                    '50%': { opacity: .5, boxShadow: '0 0 10px rgba(74, 222, 128, 0.2)' },
                }
            }
        },
    },
    plugins: [],
}
