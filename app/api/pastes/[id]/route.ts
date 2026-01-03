
import { kv } from "@/app/lib/kv.server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: any) {
  // `params` may be a Promise in the Next runtime; unwrap it before use
  const params = await (ctx?.params as any);
  try {
    const { id } = params;

    // Fetch paste from KV
    const paste: any = await kv.get(`paste:${id}`);
    if (!paste) {
      return NextResponse.json({ error: "Paste not found" }, { status: 404 });
    }
    const now = Date.now();
    if (typeof paste.ttl_seconds === "number") {
      const expiresAt = paste.created_at + paste.ttl_seconds * 1000;
      if (now > expiresAt) {
        if (typeof kv.del === "function") await kv.del(`paste:${id}`);
        return NextResponse.json({ error: "Paste expired" }, { status: 404 });
      }
    }

    if (typeof paste.max_views === "number" && paste.views >= paste.max_views) {
      if (typeof kv.del === "function") await kv.del(`paste:${id}`);
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
