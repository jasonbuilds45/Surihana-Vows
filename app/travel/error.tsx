"use client";

import { useEffect } from "react";

interface TravelErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TravelError({ error, reset }: TravelErrorProps) {
  useEffect(() => {
    console.error("[surihana] Travel page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[65vh] items-center justify-center px-6">
      <div className="max-w-md space-y-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-stone-200 bg-stone-50">
          <span className="font-display text-2xl text-stone-400">!</span>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl text-stone-900">Travel guide unavailable</h2>
          <p className="text-sm leading-7 text-stone-500">
            The travel and accommodation guide could not be loaded. Please try again shortly. For
            urgent travel questions, contact the couple directly.
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
