/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * MDX module declaration
 *
 * Tells TypeScript that .mdx files can be imported as React components.
 * This is required for the MDX content registry to work with TypeScript.
 */
declare module '*.mdx' {
  import type { ComponentType } from 'react';

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
