// ─────────────────────────────────────────────────────────────────────────────
// lib/realtimeManager.ts  (Phase 6.2)
//
// Singleton Supabase Realtime connection guard.
//
// Problem: Supabase limits concurrent Realtime connections per project. In the
// default LiveHubClient implementation, every React render cycle that runs the
// useEffect creates a fresh channel and subscribes to it independently. On the
// free Supabase tier this limit is 200 concurrent connections — hit quickly
// in production with many guests on the live hub simultaneously.
//
// Solution: a module-level singleton that keeps exactly one named channel alive
// per weddingId, routes all change events through shared listener callbacks,
// and reference-counts subscriptions so the channel is only removed when the
// last subscriber unmounts.
//
// API:
//   subscribeToWeddingUpdates(weddingId, callback) → unsubscribe()
//
// The returned unsubscribe function is safe to call multiple times.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type WeddingUpdateEvent =
  | "guest_message"
  | "photo"
  | "invite_analytics";

export type WeddingUpdateCallback = (event: WeddingUpdateEvent) => void;

interface ChannelEntry {
  channel: RealtimeChannel;
  callbacks: Set<WeddingUpdateCallback>;
  refCount: number;
}

// Module-level singleton: one entry per weddingId
const activeChannels = new Map<string, ChannelEntry>();

/**
 * Subscribe to Supabase Realtime events for a given wedding.
 *
 * Multiple callers with the same weddingId share a single Supabase channel.
 * Returns an unsubscribe function that cleans up only when the last subscriber
 * calls it.
 *
 * Safe to call in React effects — the returned cleanup is idempotent.
 */
export function subscribeToWeddingUpdates(
  weddingId: string,
  callback: WeddingUpdateCallback
): () => void {
  const supabase = getSupabaseBrowserClient();

  // No Supabase browser client available (SSR / demo mode) — return a no-op.
  if (!supabase) {
    return () => undefined;
  }

  // ── Reuse an existing channel if one is already open for this wedding ────
  const existing = activeChannels.get(weddingId);

  if (existing) {
    existing.callbacks.add(callback);
    existing.refCount += 1;
    return buildUnsubscribe(weddingId, callback);
  }

  // ── Create a new channel ─────────────────────────────────────────────────
  const callbacks = new Set<WeddingUpdateCallback>([callback]);

  function dispatch(event: WeddingUpdateEvent) {
    for (const cb of callbacks) {
      cb(event);
    }
  }

  const channel = supabase
    .channel(`surihana-live-${weddingId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "guest_messages", filter: `wedding_id=eq.${weddingId}` },
      () => dispatch("guest_message")
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "photos", filter: `wedding_id=eq.${weddingId}` },
      () => dispatch("photo")
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "invite_analytics" },
      () => dispatch("invite_analytics")
    )
    .subscribe();

  activeChannels.set(weddingId, { channel, callbacks, refCount: 1 });

  return buildUnsubscribe(weddingId, callback);
}

function buildUnsubscribe(
  weddingId: string,
  callback: WeddingUpdateCallback
): () => void {
  let called = false;

  return () => {
    // Guard against double-calls from React StrictMode or careless cleanup
    if (called) return;
    called = true;

    const entry = activeChannels.get(weddingId);
    if (!entry) return;

    entry.callbacks.delete(callback);
    entry.refCount -= 1;

    // Only remove the channel when every subscriber has unsubscribed
    if (entry.refCount <= 0) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        void supabase.removeChannel(entry.channel);
      }
      activeChannels.delete(weddingId);
    }
  };
}
