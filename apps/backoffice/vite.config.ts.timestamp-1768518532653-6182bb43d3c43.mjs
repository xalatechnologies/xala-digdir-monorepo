// vite.config.ts
import { defineConfig } from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.8_terser@5.45.0/node_modules/vite/dist/node/index.js";
import react from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@25.0.8_terser@5.45.0_/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { sentryVitePlugin } from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/@sentry+vite-plugin@2.23.1/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
var __vite_injected_original_dirname = "/Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/apps/backoffice";
var vite_config_default = defineConfig({
  // Load .env from monorepo root
  envDir: path.resolve(__vite_injected_original_dirname, "../.."),
  plugins: [
    react(),
    // Upload source maps to Sentry on production builds
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Only upload source maps in production builds
      disable: process.env.NODE_ENV !== "production",
      sourcemaps: {
        assets: "./dist/**"
      }
    })
  ],
  server: {
    port: 5175
  },
  resolve: {
    alias: {
      "@digilist/client-sdk": path.resolve(__vite_injected_original_dirname, "../../packages/client-sdk/src"),
      "@digilist/client-sdk/hooks": path.resolve(__vite_injected_original_dirname, "../../packages/client-sdk/src/hooks"),
      "@digilist/client-sdk/types": path.resolve(__vite_injected_original_dirname, "../../packages/client-sdk/src/types")
    }
  },
  optimizeDeps: {
    exclude: ["@digilist/client-sdk"]
  },
  build: {
    sourcemap: true
    // Generate source maps for production builds
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9MYXJhdmVsL1hhbGEtU0FBUy90b29scy94YWxhLWRpZ2Rpci1tb25vcmVwby9hcHBzL2JhY2tvZmZpY2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Wb2x1bWVzL0xhcmF2ZWwvWGFsYS1TQUFTL3Rvb2xzL3hhbGEtZGlnZGlyLW1vbm9yZXBvL2FwcHMvYmFja29mZmljZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVm9sdW1lcy9MYXJhdmVsL1hhbGEtU0FBUy90b29scy94YWxhLWRpZ2Rpci1tb25vcmVwby9hcHBzL2JhY2tvZmZpY2Uvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHNlbnRyeVZpdGVQbHVnaW4gfSBmcm9tICdAc2VudHJ5L3ZpdGUtcGx1Z2luJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgLy8gTG9hZCAuZW52IGZyb20gbW9ub3JlcG8gcm9vdFxuICBlbnZEaXI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLicpLFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICAvLyBVcGxvYWQgc291cmNlIG1hcHMgdG8gU2VudHJ5IG9uIHByb2R1Y3Rpb24gYnVpbGRzXG4gICAgc2VudHJ5Vml0ZVBsdWdpbih7XG4gICAgICBvcmc6IHByb2Nlc3MuZW52LlNFTlRSWV9PUkcsXG4gICAgICBwcm9qZWN0OiBwcm9jZXNzLmVudi5TRU5UUllfUFJPSkVDVCxcbiAgICAgIGF1dGhUb2tlbjogcHJvY2Vzcy5lbnYuU0VOVFJZX0FVVEhfVE9LRU4sXG4gICAgICAvLyBPbmx5IHVwbG9hZCBzb3VyY2UgbWFwcyBpbiBwcm9kdWN0aW9uIGJ1aWxkc1xuICAgICAgZGlzYWJsZTogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyxcbiAgICAgIHNvdXJjZW1hcHM6IHtcbiAgICAgICAgYXNzZXRzOiAnLi9kaXN0LyoqJyxcbiAgICAgIH0sXG4gICAgfSksXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzUsXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0BkaWdpbGlzdC9jbGllbnQtc2RrJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2NsaWVudC1zZGsvc3JjJyksXG4gICAgICAnQGRpZ2lsaXN0L2NsaWVudC1zZGsvaG9va3MnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvY2xpZW50LXNkay9zcmMvaG9va3MnKSxcbiAgICAgICdAZGlnaWxpc3QvY2xpZW50LXNkay90eXBlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9jbGllbnQtc2RrL3NyYy90eXBlcycpLFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnQGRpZ2lsaXN0L2NsaWVudC1zZGsnXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBzb3VyY2VtYXA6IHRydWUsIC8vIEdlbmVyYXRlIHNvdXJjZSBtYXBzIGZvciBwcm9kdWN0aW9uIGJ1aWxkc1xuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlZLFNBQVMsb0JBQW9CO0FBQzlaLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx3QkFBd0I7QUFIakMsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUE7QUFBQSxFQUUxQixRQUFRLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsRUFDdkMsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBO0FBQUEsSUFFTixpQkFBaUI7QUFBQSxNQUNmLEtBQUssUUFBUSxJQUFJO0FBQUEsTUFDakIsU0FBUyxRQUFRLElBQUk7QUFBQSxNQUNyQixXQUFXLFFBQVEsSUFBSTtBQUFBO0FBQUEsTUFFdkIsU0FBUyxRQUFRLElBQUksYUFBYTtBQUFBLE1BQ2xDLFlBQVk7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLHdCQUF3QixLQUFLLFFBQVEsa0NBQVcsK0JBQStCO0FBQUEsTUFDL0UsOEJBQThCLEtBQUssUUFBUSxrQ0FBVyxxQ0FBcUM7QUFBQSxNQUMzRiw4QkFBOEIsS0FBSyxRQUFRLGtDQUFXLHFDQUFxQztBQUFBLElBQzdGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLHNCQUFzQjtBQUFBLEVBQ2xDO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUE7QUFBQSxFQUNiO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
