"use client";

import { useEffect } from "react";

interface LiveErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LiveError({ error, reset }: LiveErrorProps) {
  useEffect(() => {
    console.error("[surihana] Live hub error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-stone-950 px-6 text-white">
      <div className="max-w-sm space-y-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-white/5">
          <span className="font-display text-2xl text-white/40">!</span>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl text-white">Live hub unavailable</h2>
          <p className="text-sm leading-7 text-white/55">
            The live celebration stream could not be loaded. Please check your connection and try
            again. The stream will return shortly.
          </p>
          {error.digest ? (
            <p className="text-xs text-white/25">Reference: {error.digest}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            className="rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-xs uppercase tracking-[0.28em] text-white transition hover:bg-white/15"
            onClick={reset}
            type="button"
          >
            Reconnect
          </button>
          <a
            className="rounded-full border border-white/10 px-6 py-2.5 text-xs uppercase tracking-[0.28em] text-white/60 transition hover:border-white/20"
            href="/"
          >
            Return home
          </a>
        </div>
      </div>
    </div>
  );
}
