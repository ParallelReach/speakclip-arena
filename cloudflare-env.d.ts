declare global {
  interface KVNamespace {
    get(
      key: string,
      options?: { type?: "text" | "json" | "arrayBuffer" | "stream" }
    ): Promise<string | null>;
    put(
      key: string,
      value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
      options?: {
        expirationTtl?: number;
        expiration?: number;
        metadata?: Record<string, unknown>;
      }
    ): Promise<void>;
    delete(key: string): Promise<void>;
  }

  interface CloudflareEnv {
    CLIPS?: KVNamespace;
    STRIPE_SECRET_KEY?: string;
    STRIPE_PRICE_ID?: string;
    NEXT_PUBLIC_APP_URL?: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    LEMONSQUEEZY_API_KEY?: string;
    LEMONSQUEEZY_STORE_ID?: string;
    LEMONSQUEEZY_VARIANT_ID?: string;
  }
}

export {};
