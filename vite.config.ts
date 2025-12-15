import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // Base path for GitHub Pages. 
    // If deploying to https://user.github.io/repo/, set this to '/repo/'. 
    // Using './' is a generic relative path fallback.
    base: './', 
    define: {
      // Polyfill process.env.API_KEY for the browser
      // Mapping the specific GitHub Secret 'VITE_GEMINI_API_KEY' to the internal process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    }
  };
});