"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface DownloadAlbumButtonProps { weddingId: string; }

export function DownloadAlbumButton({ weddingId }: DownloadAlbumButtonProps) {
  const [state, setState] = useState<"idle"|"loading"|"unavailable"|"error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setState("loading"); setMessage(null);
    try {
      const res = await fetch(`/api/download-album?weddingId=${encodeURIComponent(weddingId)}`, { method: "GET", cache: "no-store" });
      if (res.status === 404) {
        const json = (await res.json()) as { message?: string };
        setState("unavailable"); setMessage(json.message ?? "Album not yet available. Check back after the wedding."); return;
      }
      if (!res.ok) { setState("error"); setMessage("Something went wrong. Please try again."); return; }
      window.open(res.url, "_blank", "noopener,noreferrer");
      setState("idle");
    } catch { setState("error"); setMessage("Unable to reach the server. Check your connection and try again."); }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={state === "loading" || state === "unavailable"}
        onClick={() => void handleClick()}
        className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm uppercase transition"
        style={{
          letterSpacing: "0.22em",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: state === "unavailable" ? "var(--color-text-muted)" : "var(--color-text-secondary)",
          boxShadow: "var(--shadow-xs)",
          opacity: (state === "loading" || state === "unavailable") ? 0.65 : 1,
        }}
      >
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {state === "unavailable" ? "Album not yet available" : "Download album"}
      </button>

      {message && (
        <p className="text-xs leading-5" style={{ color: state === "error" ? "#b91c1c" : "var(--color-text-muted)" }}>
          {message}
          {state === "error" && (
            <button className="ml-2 underline" onClick={() => { setState("idle"); setMessage(null); }} type="button">
              Try again
            </button>
          )}
        </p>
      )}
    </div>
  );
}

export default DownloadAlbumButton;
