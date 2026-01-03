"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function createPaste() {
    setLoading(true);
    const res = await fetch("/api/paste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        ttl_seconds: 60,
        max_views: 2,
      }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main style={{ padding: 40, maxWidth: 700, margin: "auto" }}>
      <h1>📋 Pastebin Lite</h1>

      <textarea
        rows={10}
        style={{ width: "100%", padding: 10 }}
        placeholder="Paste your text here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <br /><br />

      <button onClick={createPaste} disabled={loading || !content}>
        {loading ? "Creating..." : "Create Paste"}
      </button>

      {result?.id && (
        <div style={{ marginTop: 20 }}>
          <p>✅ Paste created:</p>
          <a href={`/p/${result.id}`} target="_blank">
            {`${window.location.origin}/p/${result.id}`}
          </a>
        </div>
      )}
    </main>
  );
}
