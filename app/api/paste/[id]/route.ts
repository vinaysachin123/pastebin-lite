import { kv } from "@/app/lib/kv";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const paste: any = await kv.get(`paste:${id}`);

    if (!paste) {
      return NextResponse.json(
        { error: "Paste not found" },
        { status: 404 }
      );
    }

    const now = Date.now();

    // ⏱ TTL check
    if (typeof paste.ttl_seconds === "number") {
      const expiresAt = paste.created_at + paste.ttl_seconds * 1000;
      if (now > expiresAt) {
        await kv.del(`paste:${id}`);
        return NextResponse.json(
          {
            error: "Paste expired",
            debug: {
              created_at: paste.created_at,
              ttl_seconds: paste.ttl_seconds,
              expires_at: new Date(expiresAt).toISOString(),
              now
            }
          },
          { status: 404 }
        );
      }
    }

    // 👀 Max views check
    if (
      typeof paste.max_views === "number" &&
      paste.views >= paste.max_views
    ) {
      await kv.del(`paste:${id}`);
      return NextResponse.json(
        { error: "Paste view limit exceeded" },
        { status: 404 }
      );
    }

    // ✅ Increment views
    paste.views += 1;
    await kv.set(`paste:${id}`, paste);

    const resp: any = { content: paste.content };
    if (typeof paste.max_views === "number") {
      resp.remaining_views = paste.max_views - paste.views;
    }
    if (typeof paste.ttl_seconds === "number") {
      resp.expires_at = new Date(
        paste.created_at + paste.ttl_seconds * 1000
      ).toISOString();
    }
    return NextResponse.json(resp);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch paste" },
      { status: 500 }
    );
  }
}
