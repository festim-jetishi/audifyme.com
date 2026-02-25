import { defineConfig } from 'vite';

export default defineConfig({
    // Base public path when served in development or production.
    // We'll set this to the repo name if deploying to GitHub Pages later, e.g. base: '/audifyme-app/'
    base: './',
    build: {
        outDir: 'dist',
    }
});
