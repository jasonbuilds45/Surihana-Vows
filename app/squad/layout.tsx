// app/squad/layout.tsx
//
// Squad proposal pages are private, personal, unbranded.
// No navbar, no footer — just the proposal experience.

export default function SquadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <main>{children}</main>
    </div>
  );
}
