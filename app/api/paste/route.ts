import { kv } from "@/app/lib/kv.server";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const id = nanoid(8);

    const paste = {
      content,
      created_at: Date.now(),
      views: 0,
      max_views: typeof body.max_views === "number" ? body.max_views : null,
      ttl_seconds: typeof body.ttl_seconds === "number" ? body.ttl_seconds : null,
    };

    await kv.set(`paste:${id}`, paste);

    return NextResponse.json({
      id,
      url: `/p/${id}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create paste" }, { status: 500 });
  }
}
