import { kv } from "@/app/lib/kv.server";
import { notFound } from "next/navigation";

export default async function PastePage({ params: paramsArg }: { params: any }) {
  const params = await (paramsArg as any);
  const id = params.id as string;

  const paste: any = await kv.get(`paste:${id}`);
  if (!paste) return notFound();

  const now = Date.now();

  // TTL check
  if (typeof paste.ttl_seconds === "number") {
    const expiresAt = paste.created_at + paste.ttl_seconds * 1000;
    if (now > expiresAt) {
      if (typeof kv.del === "function") await kv.del(`paste:${id}`);
      return notFound();
    }
  }

  // Max views check
  if (typeof paste.max_views === "number" && paste.views >= paste.max_views) {
    if (typeof kv.del === "function") await kv.del(`paste:${id}`);
    return notFound();
  }

  // Increment views
  paste.views = (paste.views ?? 0) + 1;
  await kv.set(`paste:${id}`, paste);

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Paste</h1>

      <div style={{ marginBottom: "1rem", color: "#666" }}>
        {typeof paste.max_views === "number" ? (
          <div>Remaining views: {Math.max(paste.max_views - paste.views, 0)}</div>
        ) : null}
        {typeof paste.ttl_seconds === "number" ? (
          <div>
            Expires at: {new Date(paste.created_at + paste.ttl_seconds * 1000).toLocaleString()}
          </div>
        ) : null}
      </div>

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

