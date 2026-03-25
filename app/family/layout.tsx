import Link from "next/link";
import { BarChart2, Clock, Heart, Images, PenLine } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ElderModeProvider, ElderModeToggle } from "@/components/vault/ElderMode";
import { weddingConfig } from "@/lib/config";

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  const brideFirst = weddingConfig.brideName.split(" ")[0];
  const groomFirst = weddingConfig.groomName.split(" ")[0];

  return (
    <ElderModeProvider>
      <div className="min-h-screen" style={{ background: "var(--color-background)" }}>

        {/* Vault header */}
        <header
          className="sticky top-0 z-50"
          style={{
            background: "rgba(255,250,245,0.94)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(138,90,68,0.10)",
          }}
        >
          {/* Gold top stripe */}
          <div style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--color-accent-soft), var(--color-accent-gold, #c4914a), var(--color-accent-soft), transparent)" }} />

          <Container className="flex h-15 items-center justify-between py-3 gap-3">
            <Link href="/family" className="flex flex-col min-w-0">
              <span
                className="font-display leading-tight truncate"
                style={{ fontSize: "1rem", letterSpacing: "0.18em", color: "var(--color-text-primary)" }}
              >
                {brideFirst} &amp; {groomFirst}
              </span>
              <span
                style={{ fontSize: "0.55rem", letterSpacing: "0.45em", textTransform: "uppercase", color: "var(--color-accent)" }}
              >
                Family Vault
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              <ElderModeToggle />
              <Link
                href="/story"
                className="hidden sm:block rounded-full px-4 py-2 text-xs uppercase transition"
                style={{ letterSpacing: "0.2em", color: "var(--color-text-secondary)", background: "transparent" }}
              >
                Wedding
              </Link>
              <Link
                href="/logout"
                className="rounded-full border px-4 py-2 text-xs uppercase transition"
                style={{ letterSpacing: "0.2em", borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-secondary)" }}
              >
                Sign out
              </Link>
            </nav>
          </Container>
        </header>

        {/* Main content with bottom padding for mobile nav */}
        <main style={{ paddingBottom: "env(safe-area-inset-bottom)" }} className="pb-20 sm:pb-0">{children}</main>

        {/* Mobile bottom navigation — Instagram-style, hidden on desktop */}
        <nav
          className="sm:hidden fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: "rgba(255,250,246,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(190,45,69,0.10)",
            paddingBottom: "env(safe-area-inset-bottom)",
            boxShadow: "0 -8px 32px rgba(26,12,14,0.08)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", padding: "0.4rem 0.5rem" }}>
            {[
              { href: "#memories", icon: Heart, label: "Feed" },
              { href: "#photos", icon: Images, label: "Albums" },
              { href: "#", icon: PenLine, label: "Post", primary: true },
              { href: "#capsules", icon: Clock, label: "Capsules" },
              { href: "#polls", icon: BarChart2, label: "Polls" },
            ].map(({ href, icon: Icon, label, primary }) => (
              <a
                key={label}
                href={href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.2rem",
                  padding: "0.5rem 0.25rem",
                  textDecoration: "none",
                }}
              >
                {primary ? (
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "linear-gradient(135deg, #BE2D45, #7E2032)",
                    display: "grid", placeItems: "center",
                    boxShadow: "0 6px 18px rgba(190,45,69,0.35)",
                    marginTop: "-8px",
                  }}>
                    <Icon size={20} color="#fff" />
                  </div>
                ) : (
                  <Icon size={22} color="var(--color-text-muted)" />
                )}
                <span style={{
                  fontSize: "0.58rem",
                  letterSpacing: "0.06em",
                  color: primary ? "var(--color-accent)" : "var(--color-text-muted)",
                  fontWeight: primary ? 700 : 500,
                  marginTop: primary ? "0.3rem" : 0,
                }}>{label}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* Vault footer — desktop only */}
        <footer
          className="hidden sm:block py-8 text-center"
          style={{ background: "var(--color-surface-muted)", borderTop: "1px solid var(--color-border)" }}
        >
          <p
            style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-text-muted)" }}
          >
            {weddingConfig.celebrationTitle} · Private Family Archive
          </p>
        </footer>
      </div>
    </ElderModeProvider>
  );
}
