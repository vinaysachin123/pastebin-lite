import { kv } from "@/app/lib/kv.server";
import { NextResponse } from "next/server";

export async function GET(req: Request, ctx: any) {
  const params = await (ctx?.params as any);

  try {
    const { id } = params;

    // Fetch the paste
    const paste: any = await kv.get(`paste:${id}`);
    if (!paste) {
      return NextResponse.json({ error: "Paste not found" }, { status: 404 });
    }

    const now = Date.now();

    // ⏱ TTL check
    if (typeof paste.ttl_seconds === "number") {
      const expiresAt = paste.created_at + paste.ttl_seconds * 1000;
      if (now > expiresAt) {
        if (typeof kv.del === "function") await kv.del(`paste:${id}`);
        return NextResponse.json(
          {
            error: "Paste expired",
            debug: {
              created_at: paste.created_at,
              ttl_seconds: paste.ttl_seconds,
              expires_at: new Date(expiresAt).toISOString(),
              now,
            },
          },
          { status: 404 }
        );
      }
    }

    // 👀 Max views check
    if (typeof paste.max_views === "number" && paste.views >= paste.max_views) {
      if (typeof kv.del === "function") await kv.del(`paste:${id}`);
      return NextResponse.json(
        { error: "Paste view limit exceeded" },
        { status: 404 }
      );
    }

    // ✅ Increment views
    paste.views = (paste.views ?? 0) + 1;
    await kv.set(`paste:${id}`, paste);

    // Prepare response
    const response: any = {
      content: paste.content,
    };

    if (typeof paste.max_views === "number") {
      response.remaining_views = paste.max_views - paste.views;
    } else {
      response.remaining_views = null;
    }

    if (typeof paste.ttl_seconds === "number") {
      const expiresAt = paste.created_at + paste.ttl_seconds * 1000;
      response.expires_at = new Date(expiresAt).toISOString();
    } else {
      response.expires_at = null;
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch paste" }, { status: 500 });
  }
}
