// app/invite/layout.tsx
//
// Layout for all /invite/* guest routes.
//
// The global SiteShell (in the root layout) now provides the floating Navbar
// on all public pages including invite pages. Guests need to be able to
// navigate to Story, Gallery, Travel, etc. from their invite.
//
// This layout adds NO extra chrome — it simply passes children through.
// The CinematicIntro component inside each page provides the full-screen
// entry gate experience independently of the navbar.

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
