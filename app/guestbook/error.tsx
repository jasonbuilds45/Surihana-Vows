"use client";

import { useEffect } from "react";

interface GuestbookErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GuestbookError({ error, reset }: GuestbookErrorProps) {
  useEffect(() => {
    console.error("[surihana] Guestbook error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[65vh] items-center justify-center bg-stone-50 px-6">
      <div className="max-w-md space-y-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-stone-200 bg-white shadow-soft">
          <span className="font-display text-2xl text-stone-400">!</span>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl text-stone-900">Guestbook unavailable</h2>
          <p className="text-sm leading-7 text-stone-500">
            We could not load the guestbook right now. Your message is welcome — please try again
            in a moment and it will be ready to receive it.
          </p>
          {error.digest ? (
            <p className="text-xs text-stone-400">Reference: {error.digest}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            className="rounded-full bg-stone-950 px-6 py-2.5 text-xs uppercase tracking-[0.28em] text-white transition hover:bg-stone-800"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
          <a
            className="rounded-full border border-stone-200 px-6 py-2.5 text-xs uppercase tracking-[0.28em] text-stone-700 transition hover:border-stone-400"
            href="/"
          >
            Return home
          </a>
        </div>
      </div>
    </div>
  );
}
