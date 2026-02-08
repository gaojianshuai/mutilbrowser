/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ETHERSCAN_API_KEY?: string
  readonly VITE_POLYGONSCAN_API_KEY?: string
  readonly VITE_BSCSCAN_API_KEY?: string
  readonly VITE_SNOWTRACE_API_KEY?: string
  readonly VITE_ARBISCAN_API_KEY?: string
  readonly VITE_OPTIMISM_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
