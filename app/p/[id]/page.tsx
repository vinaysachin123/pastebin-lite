import { kv } from "@/app/lib/kv";
import { notFound } from "next/navigation";

export default async function PastePage({ params: paramsArg }: { params: any }) {
  // `params` may be a Promise in this Next runtime — unwrap it before use
  const params = await (paramsArg as any);
  const id = params.id;

  const paste: any = await kv.get(`paste:${id}`);

  if (!paste) {
    notFound();
  }

  const now = Date.now();

  // TTL check
    if (paste.ttl_seconds) {
      const expiresAt = paste.created_at + paste.ttl_seconds * 1000;
      if (now > expiresAt) {
        await kv.del(`paste:${id}`);
        notFound();
      }
    }

  // View limit check
  if (paste.max_views !== null && paste.views >= paste.max_views) {
    await kv.del(`paste:${id}`);
    notFound();
  }

  // Increment views
  paste.views = (paste.views ?? 0) + 1;
  await kv.set(`paste:${id}`, paste);

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Paste</h1>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#f5f5f5",
          padding: "1rem",
          borderRadius: "6px",
        }}
      >
        {paste.content}
      </pre>
    </main>
  );
}
