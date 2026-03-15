import Link from "next/link";
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

        <main>{children}</main>

        {/* Vault footer */}
        <footer
          className="py-8 text-center"
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
