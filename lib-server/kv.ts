// Graceful KV wrapper. When the Vercel KV env vars are not present we fall
// back to a process-scoped in-memory store. This guarantees the API builds
// and deploys cleanly in anonymous/temporary builds, and becomes truly
// persistent (cross-device) once Vercel KV is linked via the dashboard.

type KvValue = string | number | null;

interface KVLike {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: KvValue): Promise<void>;
  del(key: string): Promise<void>;
}

class MemoryKV implements KVLike {
  private map = new Map<string, string>();
  async get<T = unknown>(key: string): Promise<T | null> {
    const raw = this.map.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  async set(key: string, value: KvValue): Promise<void> {
    this.map.set(key, typeof value === "string" ? value : JSON.stringify(value));
  }
  async del(key: string): Promise<void> {
    this.map.delete(key);
  }
}

let instance: KVLike | null = null;

async function buildKv(): Promise<KVLike> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require("@vercel/kv") as typeof import("@vercel/kv");
      if (mod && mod.kv && typeof mod.kv.get === "function") {
        process.env.KV_ENABLED = "1";
        return mod.kv as unknown as KVLike;
      }
    } catch {
      // fall through to memory store
    }
  }
  process.env.KV_ENABLED = "0";
  return new MemoryKV();
}

export async function getKv(): Promise<KVLike> {
  if (!instance) instance = await buildKv();
  return instance;
}

// Proxy-shaped object that lazily awaits the real instance per-call.
// Matches the { get, set, del } shape we use in _shared.ts.
const proxy: KVLike = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const kv = await getKv();
    return kv.get<T>(key);
  },
  async set(key: string, value: KvValue): Promise<void> {
    const kv = await getKv();
    await kv.set(key, value);
  },
  async del(key: string): Promise<void> {
    const kv = await getKv();
    await kv.del(key);
  },
};

export const kv = proxy;
