
import { kv } from "@/app/lib/kv";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: any) {
  // `params` may be a Promise in the Next runtime; unwrap it before use
  const params = await (ctx?.params as any);
  try {
    const { id } = params;

    // Fetch paste from KV (or fallback file)
    const raw = await kv.get(`paste:${id}`);
    let content = raw;

    if (!content) {
      try {
        const fs = require("fs");
        const path = require("path");
        const p = path.join(process.cwd(), ".pastebin_store.json");
        if (fs.existsSync(p)) {
          const store = JSON.parse(fs.readFileSync(p, "utf8") || "{}");
          if (store && store[`paste:${id}`]) content = store[`paste:${id}`];
        }
      } catch (e) {
        /* ignore */
      }
    }

    if (!content) {
      return NextResponse.json({ error: "Paste not found", kv_raw: raw }, { status: 404 });
    }

    // enforce TTL and max-views similar to singular route
    const paste: any = content;
    const now = Date.now();
    if (typeof paste.ttl_seconds === "number") {
      const expiresAt = paste.created_at + paste.ttl_seconds * 1000;
      if (now > expiresAt) {
        await kv.del(`paste:${id}`);
        return NextResponse.json({ error: "Paste expired" }, { status: 404 });
      }
    }

    if (typeof paste.max_views === "number" && paste.views >= paste.max_views) {
      await kv.del(`paste:${id}`);
      return NextResponse.json({ error: "Paste view limit exceeded" }, { status: 404 });
    }

    paste.views = (paste.views ?? 0) + 1;
    await kv.set(`paste:${id}`, paste);

    const resp: any = { content: paste.content };
    if (typeof paste.max_views === "number") resp.remaining_views = paste.max_views - paste.views;
    if (typeof paste.ttl_seconds === "number") resp.expires_at = new Date(paste.created_at + paste.ttl_seconds * 1000).toISOString();
    return NextResponse.json(resp);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch paste" }, { status: 500 });
  }
}
