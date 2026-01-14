# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:import-analysis] Failed to resolve import \"@sentry/react\" from \"src/lib/sentry.ts\". Does the file exist?"
  - generic [ref=e5]: /Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/apps/backoffice/src/lib/sentry.ts:8:24
  - generic [ref=e6]: "1 | import * as Sentry from \"@sentry/react\"; | ^ 2 | export function initSentry() { 3 | const dsn = import.meta.env.VITE_SENTRY_DSN;"
  - generic [ref=e7]: at TransformPluginContext._formatError (file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.6/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49258:41) at TransformPluginContext.error (file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.6/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49253:16) at normalizeUrl (file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.6/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64307:23) at process.processTicksAndRejections (node:internal/process/task_queues:105:5) at async file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.6/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64439:39 at async Promise.all (index 0) at async TransformPluginContext.transform (file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.6/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64366:7) at async PluginContainer.transform (file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.6/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49099:18) at async loadAndTransform (file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.6/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51978:27) at async viteTransformMiddleware (file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.6/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:62106:24
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.js
    - text: .
```