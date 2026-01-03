"use client";

import { useState } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTTL] = useState(60);
  const [maxViews, setMaxViews] = useState(2);
  const [loading, setLoading] = useState(false);
  const [pasteUrl, setPasteUrl] = useState<string | null>(null);

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

      if (data.id) {
        const url = (window.location.origin || "") + `/p/${data.id}`;
        // optionally set the produced URL (kept for accessibility)
        setPasteUrl(url);
        // Open the paste in a new tab so the original page stays open
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        alert("Error creating paste");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create paste");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>📋 Pastebin Lite</h1>
      <textarea
        style={{ width: "100%", height: "200px", fontFamily: "monospace" }}
        placeholder="Paste your text here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div style={{ marginTop: "1rem" }}>
        <label>
          TTL (seconds):{" "}
          <input
            type="number"
            value={ttl}
            onChange={(e) => setTTL(Number(e.target.value))}
          />
        </label>
      </div>
      <div style={{ marginTop: "0.5rem" }}>
        <label>
          Max Views:{" "}
          <input
            type="number"
            value={maxViews}
            onChange={(e) => setMaxViews(Number(e.target.value))}
          />
        </label>
      </div>
      <button
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
        onClick={handleCreatePaste}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Paste"}
      </button>
      {pasteUrl ? (
        <div style={{ marginTop: "1rem" }}>
          <p>Paste created:</p>
          <a href={pasteUrl} target="_blank" rel="noreferrer">
            {pasteUrl}
          </a>
          <button
            style={{ marginLeft: "1rem" }}
            onClick={() => navigator.clipboard?.writeText(pasteUrl)}
          >
            Copy
          </button>
        </div>
      ) : null}
    </main>
  );
}
