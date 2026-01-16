// vite.config.ts
import { defineConfig } from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.8_terser@5.45.0/node_modules/vite/dist/node/index.js";
import react from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@25.0.8_terser@5.45.0_/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { sentryVitePlugin } from "file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/@sentry+vite-plugin@2.23.1/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
var __vite_injected_original_dirname = "/Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/apps/backoffice";
var vite_config_default = defineConfig({
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
    sourcemap: true,
    // Generate source maps for production builds
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/mapbox-gl")) {
            return "vendor-mapbox";
          }
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "vendor-query";
          }
          if (id.includes("packages/client-sdk/src")) {
            return "vendor-sdk";
          }
          if (id.includes("packages/ds/src") || id.includes("@xala/ds")) {
            return "vendor-ds";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 800
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9MYXJhdmVsL1hhbGEtU0FBUy90b29scy94YWxhLWRpZ2Rpci1tb25vcmVwby9hcHBzL2JhY2tvZmZpY2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Wb2x1bWVzL0xhcmF2ZWwvWGFsYS1TQUFTL3Rvb2xzL3hhbGEtZGlnZGlyLW1vbm9yZXBvL2FwcHMvYmFja29mZmljZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVm9sdW1lcy9MYXJhdmVsL1hhbGEtU0FBUy90b29scy94YWxhLWRpZ2Rpci1tb25vcmVwby9hcHBzL2JhY2tvZmZpY2Uvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHNlbnRyeVZpdGVQbHVnaW4gfSBmcm9tICdAc2VudHJ5L3ZpdGUtcGx1Z2luJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgLy8gVXBsb2FkIHNvdXJjZSBtYXBzIHRvIFNlbnRyeSBvbiBwcm9kdWN0aW9uIGJ1aWxkc1xuICAgIHNlbnRyeVZpdGVQbHVnaW4oe1xuICAgICAgb3JnOiBwcm9jZXNzLmVudi5TRU5UUllfT1JHLFxuICAgICAgcHJvamVjdDogcHJvY2Vzcy5lbnYuU0VOVFJZX1BST0pFQ1QsXG4gICAgICBhdXRoVG9rZW46IHByb2Nlc3MuZW52LlNFTlRSWV9BVVRIX1RPS0VOLFxuICAgICAgLy8gT25seSB1cGxvYWQgc291cmNlIG1hcHMgaW4gcHJvZHVjdGlvbiBidWlsZHNcbiAgICAgIGRpc2FibGU6IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsXG4gICAgICBzb3VyY2VtYXBzOiB7XG4gICAgICAgIGFzc2V0czogJy4vZGlzdC8qKicsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTc1LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAZGlnaWxpc3QvY2xpZW50LXNkayc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9jbGllbnQtc2RrL3NyYycpLFxuICAgICAgJ0BkaWdpbGlzdC9jbGllbnQtc2RrL2hvb2tzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2NsaWVudC1zZGsvc3JjL2hvb2tzJyksXG4gICAgICAnQGRpZ2lsaXN0L2NsaWVudC1zZGsvdHlwZXMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvY2xpZW50LXNkay9zcmMvdHlwZXMnKSxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ0BkaWdpbGlzdC9jbGllbnQtc2RrJ10sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgc291cmNlbWFwOiB0cnVlLCAvLyBHZW5lcmF0ZSBzb3VyY2UgbWFwcyBmb3IgcHJvZHVjdGlvbiBidWlsZHNcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQpID0+IHtcbiAgICAgICAgICAvLyBNYXBib3ggR0wgaW4gc2VwYXJhdGUgY2h1bmsgKGxhcmdlLCByYXJlbHkgY2hhbmdlcylcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9tYXBib3gtZ2wnKSkge1xuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItbWFwYm94JztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBSZWFjdCBRdWVyeSBpbiBzZXBhcmF0ZSBjaHVua1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0B0YW5zdGFjay9yZWFjdC1xdWVyeScpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1xdWVyeSc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2xpZW50IFNESyBpbiBzZXBhcmF0ZSBjaHVua1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvY2xpZW50LXNkay9zcmMnKSkge1xuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3Itc2RrJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEZXNpZ24gc3lzdGVtIGluIHNlcGFyYXRlIGNodW5rXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9kcy9zcmMnKSB8fCBpZC5pbmNsdWRlcygnQHhhbGEvZHMnKSkge1xuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItZHMnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEV2ZXJ5dGhpbmcgZWxzZSBmcm9tIG5vZGVfbW9kdWxlcyBnb2VzIHRvZ2V0aGVyXG4gICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyBjaXJjdWxhciBkZXBlbmRlbmNpZXMgYmV0d2VlbiBjaHVua3NcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIC8vIEluY3JlYXNlIGNodW5rIHNpemUgd2FybmluZyBsaW1pdFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogODAwLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlZLFNBQVMsb0JBQW9CO0FBQzlaLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx3QkFBd0I7QUFIakMsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBO0FBQUEsSUFFTixpQkFBaUI7QUFBQSxNQUNmLEtBQUssUUFBUSxJQUFJO0FBQUEsTUFDakIsU0FBUyxRQUFRLElBQUk7QUFBQSxNQUNyQixXQUFXLFFBQVEsSUFBSTtBQUFBO0FBQUEsTUFFdkIsU0FBUyxRQUFRLElBQUksYUFBYTtBQUFBLE1BQ2xDLFlBQVk7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLHdCQUF3QixLQUFLLFFBQVEsa0NBQVcsK0JBQStCO0FBQUEsTUFDL0UsOEJBQThCLEtBQUssUUFBUSxrQ0FBVyxxQ0FBcUM7QUFBQSxNQUMzRiw4QkFBOEIsS0FBSyxRQUFRLGtDQUFXLHFDQUFxQztBQUFBLElBQzdGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLHNCQUFzQjtBQUFBLEVBQ2xDO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUE7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWMsQ0FBQyxPQUFPO0FBRXBCLGNBQUksR0FBRyxTQUFTLHdCQUF3QixHQUFHO0FBQ3pDLG1CQUFPO0FBQUEsVUFDVDtBQUdBLGNBQUksR0FBRyxTQUFTLG9DQUFvQyxHQUFHO0FBQ3JELG1CQUFPO0FBQUEsVUFDVDtBQUdBLGNBQUksR0FBRyxTQUFTLHlCQUF5QixHQUFHO0FBQzFDLG1CQUFPO0FBQUEsVUFDVDtBQUdBLGNBQUksR0FBRyxTQUFTLGlCQUFpQixLQUFLLEdBQUcsU0FBUyxVQUFVLEdBQUc7QUFDN0QsbUJBQU87QUFBQSxVQUNUO0FBSUEsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSx1QkFBdUI7QUFBQSxFQUN6QjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
