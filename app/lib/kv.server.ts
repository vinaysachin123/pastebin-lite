import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

type KVLike = {
  get: (key: string) => Promise<any> | any;
  set: (key: string, value: any) => Promise<any> | any;
  del?: (key: string) => Promise<any> | any;
};

let kv: KVLike;

if (url && token) {
  kv = Redis.fromEnv();
} else {
  // File-backed fallback for server-side dev
  const fs = require("fs");
  const path = require("path");
  const os = require("os");
  const storeFile = path.join(os.tmpdir(), "pastebin-lite-store.json");

  function readStore() {
    try {
      if (!fs.existsSync(storeFile)) return {};
      const raw = fs.readFileSync(storeFile, "utf8");
      const obj = raw ? JSON.parse(raw) : {};
      // prune expired
      const now = Date.now();
      let mutated = false;
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (v && typeof v === "object" && v.ttl_seconds && v.created_at) {
          const expiresAt = v.created_at + v.ttl_seconds * 1000;
          if (now > expiresAt) {
            delete obj[k];
            mutated = true;
          }
        }
      }
      if (mutated) writeStore(obj);
      return obj;
    } catch (e) {
      console.warn("[KV] failed to read store file", e);
      return {};
    }
  }

  function writeStore(obj: any) {
    try {
      fs.writeFileSync(storeFile, JSON.stringify(obj), "utf8");
    } catch (e) {
      console.warn("[KV] failed to write store file", e);
    }
  }

  kv = {
    async get(key: string) {
      const s = readStore();
      return s[key] ?? null;
    },
    async set(key: string, value: any) {
      const s = readStore();
      s[key] = value;
      writeStore(s);
    },
    async del(key: string) {
      const s = readStore();
      delete s[key];
      writeStore(s);
    },
  };
}

export { kv };
