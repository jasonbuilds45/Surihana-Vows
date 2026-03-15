"use client";

import { startTransition, useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import type { GuestMessageRow } from "@/lib/types";
import { Card, SectionLabel, EmptyState } from "@/components/ui";

interface MessageModerationProps {
  initialMessages: GuestMessageRow[];
  weddingId: string;
}

interface DeleteResponse { success: boolean; message?: string; }

function fmt(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function MessageModeration({ initialMessages, weddingId }: MessageModerationProps) {
  const [messages, setMessages] = useState<GuestMessageRow[]>(initialMessages);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleDelete(id: string, guestName: string) {
    if (!window.confirm(`Remove message from ${guestName}? This cannot be undone.`)) return;
    setDeleting(id); setStatus(null);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weddingId }) });
      const p = (await res.json()) as DeleteResponse;
      if (!res.ok || !p.success) throw new Error(p.message ?? "Failed.");
      startTransition(() => { setMessages((cur) => cur.filter((m) => m.id !== id)); });
      setStatus("Message removed.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed.");
    } finally { setDeleting(null); }
  }

  return (
    <Card noPad>
      <div className="p-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--color-accent-light)", border: "1px solid rgba(184,84,58,0.18)" }}>
              <MessageCircle className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <SectionLabel>Message moderation</SectionLabel>
              <h2 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Guest messages</h2>
            </div>
          </div>
          <span className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase" style={{ letterSpacing: "0.2em", background: "var(--color-surface-dark)", color: "#fff" }}>
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Review and remove messages before they appear in the permanent archive.
        </p>
      </div>

      {status && (
        <div className="mx-6 mb-3 rounded-xl px-4 py-2.5 text-sm" style={{ background: "var(--color-surface-soft)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
          {status}
        </div>
      )}

      <div className="px-6 pb-6">
        {messages.length === 0 ? (
          <EmptyState icon={<MessageCircle className="h-9 w-9" />} title="No guest messages yet" description="Messages will appear here as guests leave notes in the guestbook." />
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start justify-between gap-4 rounded-xl p-4"
                style={{ background: "var(--color-surface-soft)", border: "1px solid var(--color-border)" }}
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>{msg.guest_name}</p>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{fmt(msg.created_at)}</span>
                  </div>
                  <p className="text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>{msg.message}</p>
                </div>
                <button
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs uppercase font-semibold transition disabled:opacity-50"
                  style={{ letterSpacing: "0.16em", background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#b91c1c" }}
                  disabled={deleting === msg.id}
                  onClick={() => handleDelete(msg.id, msg.guest_name)}
                  type="button"
                >
                  {deleting === msg.id
                    ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                    : <Trash2 className="h-3.5 w-3.5" />
                  }
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default MessageModeration;
