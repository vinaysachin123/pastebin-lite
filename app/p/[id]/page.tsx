"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState(60); // default 1 minute
  const [maxViews, setMaxViews] = useState(2); // default 2 views
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreatePaste = async () => {
    if (!content.trim()) return alert("Paste cannot be empty!");
    setLoading(true);

    try {
      const res = await fetch("/api/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          ttl_seconds: Number(ttl),
          max_views: Number(maxViews),
        }),
      });

      const data = await res.json();

      if (data?.id) {
        // Redirect to the paste page
        router.push(`/p/${data.id}`);
      } else {
        alert("Failed to create paste");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace", maxWidth: 600, margin: "auto" }}>
      <h1>📋 Pastebin Lite</h1>
      <textarea
        placeholder="Paste your text here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", height: 200, padding: "1rem", borderRadius: "6px", fontFamily: "monospace" }}
      />

      <div style={{ marginTop: "1rem" }}>
        <label>
          TTL (seconds):{" "}
          <input type="number" value={ttl} onChange={(e) => setTtl(Number(e.target.value))} min={1} />
        </label>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>
          Max Views:{" "}
          <input type="number" value={maxViews} onChange={(e) => setMaxViews(Number(e.target.value))} min={1} />
        </label>
      </div>

      <button
        onClick={handleCreatePaste}
        disabled={loading}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {loading ? "Creating..." : "Create Paste"}
      </button>
    </main>
  );
}
