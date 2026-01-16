/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_TENANT_ID: string;
  readonly VITE_LICENSE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// CSS module declarations
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
