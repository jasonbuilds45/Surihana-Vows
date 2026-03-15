"use client";

import type { ChangeEvent, FormEvent } from "react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Activity, Camera, Loader2, MessageCircleHeart, Radio, UploadCloud } from "lucide-react";
import { MessageList } from "@/components/guestbook/MessageList";
import { CountdownTimer } from "@/components/invitation/CountdownTimer";
import { WeddingDate } from "@/components/invitation/WeddingDate";
import { ImageTransforms } from "@/lib/storage";
import { subscribeToWeddingUpdates } from "@/lib/realtimeManager";
import type { LivestreamBundle } from "@/lib/types";

interface LiveHubClientProps {
  initialBundle: LivestreamBundle;
  allowGuestUploads?: boolean;
}

interface LiveBundleResponse {
  success: boolean;
  data?: LivestreamBundle;
}

interface UploadResponse {
  success: boolean;
  message: string;
  url?: string;
  demoMode?: boolean;
}

export function LiveHubClient({ initialBundle, allowGuestUploads = false }: LiveHubClientProps) {
  const [bundle, setBundle] = useState(initialBundle);
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const liveEvent = useMemo(
    () => bundle.timeline.find((item) => item.status !== "completed") ?? bundle.timeline[0],
    [bundle.timeline]
  );

  function handleUploadFileChange(event: ChangeEvent<HTMLInputElement>) {
    setUploadFile(event.target.files?.[0] ?? null);
  }

  async function handleGuestUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uploadFile) {
      setUploadStatus({ success: false, message: "Choose a photo to upload." });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("uploadedBy", uploadName.trim() || "Guest");
      formData.append("category", "live");
      formData.append("weddingId", bundle.weddingId);

      const response = await fetch("/api/upload-photo", { method: "POST", body: formData });
      const payload = (await response.json()) as UploadResponse;
      setUploadStatus(payload);
      if (payload.success) setUploadFile(null);
    } catch (error) {
      setUploadStatus({
        success: false,
        message: error instanceof Error ? error.message : "Unable to upload the photo."
      });
    } finally {
      setIsUploading(false);
    }
  }

  // ── Realtime subscription (Phase 6.2) ─────────────────────────────────────
  // Uses the shared channel manager instead of creating a per-component
  // subscription. All guests on the live hub share a single Supabase channel.
  useEffect(() => {
    async function refreshBundle() {
      const response = await fetch(`/api/live?weddingId=${encodeURIComponent(bundle.weddingId)}`, {
        cache: "no-store"
      });
      if (!response.ok) return;

      const payload = (await response.json()) as LiveBundleResponse;
      if (!payload.success || !payload.data) return;

      startTransition(() => {
        setBundle(payload.data!);
      });
    }

    const scheduleRefresh = () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => void refreshBundle(), 250);
    };

    // subscribeToWeddingUpdates returns a stable unsubscribe function.
    // All event types (guest_message, photo, invite_analytics) trigger a
    // single debounced bundle refresh — same behaviour as before but via
    // the shared channel singleton.
    const unsubscribe = subscribeToWeddingUpdates(bundle.weddingId, scheduleRefresh);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      unsubscribe();
    };
  }, [bundle.weddingId]);

  return (
    <div className="space-y-10 py-10 lg:py-14">
      <section className="grid gap-8 lg:grid-cols-[1fr,0.95fr] lg:items-start">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-stone-950 shadow-[0_24px_80px_rgba(73,45,34,0.16)]">
          <div className="aspect-video">
            {bundle.embedUrl && bundle.embedUrl !== "[authenticated]" ? (
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
                src={bundle.embedUrl}
                title="Surihana Vows Livestream"
              />
            ) : (
              // Embed URL redacted for public guests — show a placeholder
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <Radio className="mx-auto h-10 w-10 text-stone-500" />
                  <p className="mt-4 text-xs uppercase tracking-[0.32em] text-stone-400">Live now</p>
                  <p className="mt-2 text-sm text-stone-500">Sign in to watch the livestream.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Live now</p>
            <h1 className="mt-3 font-display text-4xl text-stone-950">{bundle.headline}</h1>
            <p className="mt-3 text-sm leading-7 text-stone-600">{bundle.description}</p>
          </div>
          <WeddingDate
            date={bundle.countdownTarget.slice(0, 10)}
            time={bundle.countdownTarget.slice(11, 16)}
            venueName={liveEvent?.title ?? "Ceremony"}
          />
          <CountdownTimer
            target={bundle.countdownTarget}
            label={liveEvent ? `Until ${liveEvent.title}` : "Until ceremony"}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {/* analytics is null for unauthenticated guests — only show to family/admin */}
            {bundle.analytics ? (
              <>
                <article className="rounded-[1.5rem] border border-white/60 bg-white/80 p-5 shadow-soft">
                  <Radio className="h-5 w-5 text-stone-700" />
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-stone-500">Invites opened</p>
                  <p className="mt-2 font-display text-3xl text-stone-950">{bundle.analytics.openedInvites}</p>
                </article>
                <article className="rounded-[1.5rem] border border-white/60 bg-white/80 p-5 shadow-soft">
                  <MessageCircleHeart className="h-5 w-5 text-stone-700" />
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-stone-500">Messages live</p>
                  <p className="mt-2 font-display text-3xl text-stone-950">{bundle.guestMessages.length}</p>
                </article>
                <article className="rounded-[1.5rem] border border-white/60 bg-white/80 p-5 shadow-soft">
                  <Camera className="h-5 w-5 text-stone-700" />
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-stone-500">Confirmed seats</p>
                  <p className="mt-2 font-display text-3xl text-stone-950">{bundle.analytics.attendanceGuests}</p>
                </article>
              </>
            ) : (
              // Public guest view — show only message count, no RSVP analytics
              <article className="rounded-[1.5rem] border border-white/60 bg-white/80 p-5 shadow-soft sm:col-span-3">
                <MessageCircleHeart className="h-5 w-5 text-stone-700" />
                <p className="mt-3 text-xs uppercase tracking-[0.24em] text-stone-500">Celebration messages</p>
                <p className="mt-2 font-display text-3xl text-stone-950">{bundle.guestMessages.length}</p>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr,0.9fr]">
        <article className="rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-soft">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Event timeline</p>
          <div className="mt-6 grid gap-4">
            {bundle.timeline.map((item) => (
              <div
                key={`${item.time}-${item.title}`}
                className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl text-stone-950">{item.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{item.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.24em] ${
                      item.status === "live"
                        ? "bg-rose-100 text-rose-800"
                        : item.status === "completed"
                          ? "bg-stone-200 text-stone-700"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/60 bg-stone-950 p-8 text-white shadow-[0_24px_80px_rgba(73,45,34,0.16)]">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-300">Live photo feed</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {bundle.livePhotos.map((photo) => (
              <div key={photo.id} className="group relative h-56 overflow-hidden rounded-[1.5rem]">
                <Image
                  alt={photo.category}
                  // 6.1: 400 px CDN thumbnail; falls back for non-Supabase URLs
                  src={ImageTransforms.gridThumb(photo.image_url)}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 1280px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/70">{photo.category}</p>
                  <p className="mt-2 text-sm">{photo.uploaded_by}</p>
                </div>
              </div>
            ))}
          </div>

          {allowGuestUploads ? (
            <form
              className="mt-6 space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              onSubmit={handleGuestUpload}
            >
              <div className="flex items-center gap-3">
                <UploadCloud className="h-5 w-5 text-stone-200" />
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-300">Guest upload</p>
                  <p className="mt-1 text-sm text-stone-300">
                    Add a photo and it will appear in the live feed and gallery.
                  </p>
                </div>
              </div>

              <label className="grid gap-2 text-sm text-stone-200">
                Your name
                <input
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white/30"
                  onChange={(event) => setUploadName(event.target.value)}
                  placeholder="A guest from the dance floor"
                  value={uploadName}
                />
              </label>

              <label className="grid gap-2 text-sm text-stone-200">
                Photo
                <input
                  accept="image/*"
                  className="rounded-2xl border border-dashed border-white/20 bg-black/20 px-4 py-4 text-white"
                  onChange={handleUploadFileChange}
                  type="file"
                />
              </label>

              {uploadStatus ? (
                <p
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    uploadStatus.success
                      ? "bg-emerald-100/10 text-emerald-200"
                      : "bg-rose-100/10 text-rose-200"
                  }`}
                >
                  {uploadStatus.message}
                </p>
              ) : null}

              <button
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs uppercase tracking-[0.24em] text-stone-950 transition hover:bg-stone-100 disabled:opacity-70"
                disabled={isUploading}
                type="submit"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
                Upload photo
              </button>
            </form>
          ) : null}
        </article>

        {/* Realtime activity panel — only visible to authenticated users (family/admin).
             For public guests, bundle.analytics is null and recentActivity is empty,
             so we hide this panel entirely to avoid showing a blank column. */}
        {bundle.analytics ? (
          <article className="rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-soft">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-stone-700" />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Realtime activity</p>
                <p className="mt-1 text-sm text-stone-600">Invite analytics refresh automatically.</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {bundle.recentActivity.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-stone-950">{item.guestName}</p>
                    <span className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                      {item.device ?? "unknown"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">{item.action.replace(/_/g, " ")}</p>
                </div>
              ))}
            </div>
          </article>
        ) : null}
      </section>

      <section>
        <div className="mb-6 max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Messages</p>
          <h2 className="font-display text-4xl text-stone-950">Notes arriving in real time</h2>
        </div>
        <MessageList messages={bundle.guestMessages} />
      </section>
    </div>
  );
}

export default LiveHubClient;
