import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@digilist/client-sdk': path.resolve(__dirname, '../../packages/client-sdk/src'),
      '@digilist/client-sdk/hooks': path.resolve(__dirname, '../../packages/client-sdk/src/hooks'),
      '@digilist/client-sdk/types': path.resolve(__dirname, '../../packages/client-sdk/src/types'),
    },
    // Ensure single instance of React and React Query across all modules
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
  },
  optimizeDeps: {
    exclude: ['@digilist/client-sdk'],
  },
});
