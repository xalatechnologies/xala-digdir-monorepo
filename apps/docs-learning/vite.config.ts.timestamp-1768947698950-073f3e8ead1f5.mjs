// vite.config.ts
import { defineConfig } from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.6_terser@5.44.1/node_modules/vite/dist/node/index.js";
import react from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@25.0.6_terser@5.44.1_/node_modules/@vitejs/plugin-react/dist/index.js";
import tsconfigPaths from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite-tsconfig-paths@6.0.4_typescript@5.9.3_vite@7.3.1_@types+node@25.0.6_terser@5.44.1_tsx@4.21.0_yaml@2.8.2_/node_modules/vite-tsconfig-paths/dist/index.js";
import path from "path";
import { sentryVitePlugin } from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/@sentry+vite-plugin@2.23.1/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
var __vite_injected_original_dirname = "/Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/apps/docs-learning";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tsconfigPaths({ root: path.resolve(__vite_injected_original_dirname, "../..") }),
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
    port: 5179
  },
  resolve: {
    alias: {
      // CSS imports cannot be resolved by tsconfig paths
      "@digdir/designsystemet-css": path.resolve(__vite_injected_original_dirname, "../../node_modules/@digdir/designsystemet-css")
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9MYXJhdmVsL1hhbGEtU0FBUy90b29scy94YWxhLWRpZ2Rpci1tb25vcmVwby9hcHBzL2RvY3MtbGVhcm5pbmdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Wb2x1bWVzL0xhcmF2ZWwvWGFsYS1TQUFTL3Rvb2xzL3hhbGEtZGlnZGlyLW1vbm9yZXBvL2FwcHMvZG9jcy1sZWFybmluZy92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVm9sdW1lcy9MYXJhdmVsL1hhbGEtU0FBUy90b29scy94YWxhLWRpZ2Rpci1tb25vcmVwby9hcHBzL2RvY3MtbGVhcm5pbmcvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgc2VudHJ5Vml0ZVBsdWdpbiB9IGZyb20gJ0BzZW50cnkvdml0ZS1wbHVnaW4nO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB0c2NvbmZpZ1BhdGhzKHsgcm9vdDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uJykgfSksXG4gICAgLy8gVXBsb2FkIHNvdXJjZSBtYXBzIHRvIFNlbnRyeSBvbiBwcm9kdWN0aW9uIGJ1aWxkc1xuICAgIHNlbnRyeVZpdGVQbHVnaW4oe1xuICAgICAgb3JnOiBwcm9jZXNzLmVudi5TRU5UUllfT1JHLFxuICAgICAgcHJvamVjdDogcHJvY2Vzcy5lbnYuU0VOVFJZX1BST0pFQ1QsXG4gICAgICBhdXRoVG9rZW46IHByb2Nlc3MuZW52LlNFTlRSWV9BVVRIX1RPS0VOLFxuICAgICAgLy8gT25seSB1cGxvYWQgc291cmNlIG1hcHMgaW4gcHJvZHVjdGlvbiBidWlsZHNcbiAgICAgIGRpc2FibGU6IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsXG4gICAgICBzb3VyY2VtYXBzOiB7XG4gICAgICAgIGFzc2V0czogJy4vZGlzdC8qKicsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTc5LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIC8vIENTUyBpbXBvcnRzIGNhbm5vdCBiZSByZXNvbHZlZCBieSB0c2NvbmZpZyBwYXRoc1xuICAgICAgJ0BkaWdkaXIvZGVzaWduc3lzdGVtZXQtY3NzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL25vZGVfbW9kdWxlcy9AZGlnZGlyL2Rlc2lnbnN5c3RlbWV0LWNzcycpLFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnQGRpZ2lsaXN0L2NsaWVudC1zZGsnXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBzb3VyY2VtYXA6IHRydWUsIC8vIEdlbmVyYXRlIHNvdXJjZSBtYXBzIGZvciBwcm9kdWN0aW9uIGJ1aWxkc1xuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBZLFNBQVMsb0JBQW9CO0FBQ3ZhLE9BQU8sV0FBVztBQUNsQixPQUFPLG1CQUFtQjtBQUMxQixPQUFPLFVBQVU7QUFDakIsU0FBUyx3QkFBd0I7QUFKakMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sY0FBYyxFQUFFLE1BQU0sS0FBSyxRQUFRLGtDQUFXLE9BQU8sRUFBRSxDQUFDO0FBQUE7QUFBQSxJQUV4RCxpQkFBaUI7QUFBQSxNQUNmLEtBQUssUUFBUSxJQUFJO0FBQUEsTUFDakIsU0FBUyxRQUFRLElBQUk7QUFBQSxNQUNyQixXQUFXLFFBQVEsSUFBSTtBQUFBO0FBQUEsTUFFdkIsU0FBUyxRQUFRLElBQUksYUFBYTtBQUFBLE1BQ2xDLFlBQVk7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQTtBQUFBLE1BRUwsOEJBQThCLEtBQUssUUFBUSxrQ0FBVywrQ0FBK0M7QUFBQSxJQUN2RztBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxzQkFBc0I7QUFBQSxFQUNsQztBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsV0FBVztBQUFBO0FBQUEsRUFDYjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
