export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-stone-600" />
        <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Loading</p>
      </div>
    </div>
  );
}
