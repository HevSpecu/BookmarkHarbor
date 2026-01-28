import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': new URL('./src', import.meta.url).pathname,
            '@core': new URL('./src/core', import.meta.url).pathname,
            '@components': new URL('./src/components', import.meta.url).pathname,
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    i18n: ['i18next', 'react-i18next'],
                    icons: ['@iconify/react'],
                },
            },
        },
    },
});
