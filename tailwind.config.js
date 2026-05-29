/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/breeze/stubs/inertia-react-ts/resources/js/app.tsx',
        './resources/js/**/*.tsx',
        './resources/views/**/*.blade.php',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: '#3B6D11',
                accent: '#639922',
                mint: '#97C459',
                green: {
                    50: 'var(--theme-50)',
                    100: 'var(--theme-100)',
                    200: 'var(--theme-200)',
                    300: 'var(--theme-300)',
                    400: 'var(--theme-400)',
                    500: 'var(--theme-500)',
                    600: 'var(--theme-600)',
                    700: 'var(--theme-700)',
                    800: 'var(--theme-800)',
                    900: 'var(--theme-900)',
                }
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'soft-lg': '0 10px 30px -3px rgba(0, 0, 0, 0.08)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};