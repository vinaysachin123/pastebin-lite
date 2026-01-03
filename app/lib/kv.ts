import { Redis } from "@upstash/redis";

const hasUpstash =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN;

let kv: any;

if (hasUpstash) {
  kv = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
} else {
  console.warn(
    "[KV] UPSTASH env vars missing — using in-memory fallback for local development"
  );
  // File-backed fallback so dev server restarts / multiple dev processes share state
  const fs = require("fs");
  const path = require("path");
  const os = require("os");
  const storeFile = path.join(os.tmpdir(), "pastebin-lite-store.json");

  function readStore() {
    try {
      if (!fs.existsSync(storeFile)) return {};
      const raw = fs.readFileSync(storeFile, "utf8");
      return raw ? JSON.parse(raw) : {};
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
