// Client-safe KV stub. Server code should import from `app/lib/kv.server`.
const warn = () =>
  console.warn(
    "[KV] client-side import of kv detected — import '@/app/lib/kv.server' in server components instead."
  );

export const kv = {
  async get(_key: string) {
    warn();
    return null;
  },
  async set(_key: string, _value: any) {
    warn();
  },
  async del(_key: string) {
    warn();
  },
};

// exported above as `kv`
