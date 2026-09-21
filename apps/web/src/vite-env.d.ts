/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MONETIZATION_MODE?: string;
  readonly VITE_ADSENSE_CLIENT_ID?: string;
  readonly VITE_ADSENSE_SLOT_ID?: string;
  readonly VITE_SUPPORTER_URL?: string;
  readonly VITE_AFFILIATE_AMAZON_TAG?: string;
  readonly VITE_AFFILIATE_VKB_TAG?: string;
  readonly VITE_AFFILIATE_VIRPIL_TAG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
