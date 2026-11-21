/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                saffron: {
                    500: '#f59e0b',
                    600: '#d97706',
                },
                navy: {
                    800: '#0c1e35',
                    900: '#012a4a',
                },
                sand: '#fdfbf7',
                lumine: {
                    navy: '#001f3f',
                    orange: '#e86c00',
                    saffron: '#F97316',
                    bg: '#F8F9FA'
                },
                density: {
                    low: '#10B981',
                    mid: '#FBBF24',
                    high: '#F97316',
                    critical: '#EF4444'
                }
            },
            boxShadow: {
                'card': '0 2px 5px rgba(0,0,0,0.05)',
                'floating': '0 4px 15px rgba(0,0,0,0.1)'
            },
            borderRadius: {
                'card-radius': '16px',
            },
            fontFamily: {
                sans: ['Poppins', 'system-ui', 'sans-serif'],
                serif: ['Laila', 'serif'],
            },
        },
    },
    plugins: [],
}
