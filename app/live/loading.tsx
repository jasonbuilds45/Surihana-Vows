export default function LiveLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-stone-950">
      <div className="space-y-5 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-amber-400/60" />
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.38em] text-white/40">
            Connecting to live hub
          </p>
          <p className="text-xs text-white/20">This may take a moment</p>
        </div>
      </div>
    </div>
  );
}
