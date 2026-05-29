/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.tsx' {
  const content: any;
  export default content;
}

declare module '*.ts' {
  const content: any;
  export default content;
}

interface Window {
  axios: any;
}

// Extend PageProps to allow any props
declare global {
  namespace InertiaJS {
    interface PageProps {
      [key: string]: any;
    }
  }
}