/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OAUTH_AUTHORIZATION_ENDPOINT: string
  readonly VITE_OAUTH_TOKEN_ENDPOINT: string
  readonly VITE_OAUTH_CLIENT_ID: string
  readonly VITE_OAUTH_REDIRECT_URI: string
  readonly VITE_OAUTH_POST_LOGOUT_URI: string
  readonly VITE_OAUTH_SCOPE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
