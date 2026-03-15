// ─────────────────────────────────────────────────────────────────────────────
// app/invite/layout.tsx
//
// Dedicated layout for all /invite/* routes.
//
// Guests arrive through their personal invite link and should experience a
// fully cinematic, unbranded page — no platform navbar, no "Family Vault"
// or "Admin" links, no login button. The CinematicIntro component inside
// the page itself acts as the full-screen entry gate.
//
// This layout intentionally strips the global <Navbar> and <Footer> from
// the root layout by NOT rendering them here. The root layout wraps every
// route; this nested layout shadows it for the /invite segment.
// ─────────────────────────────────────────────────────────────────────────────

export default function InviteLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    // Minimal shell — no nav, no footer, transparent canvas background
    <div className="min-h-screen bg-canvas">
      <main>{children}</main>
    </div>
  );
}
