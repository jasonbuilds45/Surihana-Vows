export default function InviteLoading() {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-stone-950">
      <div className="space-y-5 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
        <p className="text-[11px] uppercase tracking-[0.38em] text-white/40">
          Preparing your invitation
        </p>
      </div>
    </div>
  );
}
