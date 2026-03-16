import type { Metadata } from "next";
import { weddingConfig } from "@/lib/config";
import { getSlideshowPhotos } from "@/modules/premium/photo-gallery";
import { formatDate } from "@/utils/formatDate";

export const metadata: Metadata = {
  title: `${weddingConfig.brideName} & ${weddingConfig.groomName} | ${weddingConfig.celebrationTitle}`,
  description: weddingConfig.heroSubtitle,
};

const DF = "var(--font-display), Georgia, serif";
const BF = "var(--font-body), system-ui, sans-serif";

export default function HomePage() {
  const slides = getSlideshowPhotos();
  const hero =
    slides[0]?.imageUrl ??
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85";

  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; background: #0c0808; color: #fff; }

        @keyframes slowZoom {
          0% { transform: scale(1); filter: brightness(0.9); }
          100% { transform: scale(1.1); filter: brightness(1.1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .bg-img {
          animation: slowZoom 30s ease-in-out infinite alternate;
        }

        .animate-in { animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        .delay-3 { animation-delay: 0.6s; }
        .delay-4 { animation-delay: 0.8s; }

        .btn-login {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          border-radius: 18px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
        }
        
        .btn-login:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        .btn-login-primary {
          background: linear-gradient(135deg, rgba(192,54,74,0.8), rgba(139,36,51,0.85));
          border-color: rgba(245,197,203,0.3);
        }
        
        .btn-login-primary::after {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 200%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmer 4s infinite linear;
        }

        .detail-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 100px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 0.8rem;
          color: rgba(255,255,255,0.8);
          font-family: ${BF};
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .detail-chip:hover {
            background: rgba(255,255,255,0.12);
            border-color: rgba(255,255,255,0.2);
            color: #fff;
        }

        @media (max-width: 650px) {
          .btn-row { flex-direction: column !important; }
          .btn-login { width: 100%; }
          .names-h1 { font-size: clamp(3.5rem, 18vw, 5.5rem) !important; }
        }
      `}</style>

      {/* ── Background Engine ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }} aria-hidden>
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${hero})`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
          }}
        />
        {/* Superior Gradient Masking */}
        <div style={{ 
          position: "absolute", 
          inset: 0, 
          background: `linear-gradient(to bottom, 
            rgba(12,8,8,0.5) 0%, 
            rgba(12,8,8,0.1) 40%, 
            rgba(12,8,8,0.4) 60%, 
            rgba(12,8,8,0.95) 100%)`,
          zIndex: 1 
        }} />
      </div>

      {/* ── Top Navigation Ticker ── */}
      <div className="animate-in" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30 }}>
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #C0364A, #B8820A, #C0364A, transparent)" }} />
        <div style={{ overflow: "hidden", padding: "10px 0", background: "rgba(12,8,8,0.4)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", gap: "4rem", whiteSpace: "nowrap", width: "max-content", animation: "ticker 40s linear infinite" }}>
            {Array(10).fill(
              `${weddingConfig.celebrationTitle}  •  ${formatDate(weddingConfig.weddingDate)}  •  ${weddingConfig.venueName}`
            ).map((t, i) => (
              <span key={i} style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: BF }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main
        style={{
          position: "relative", zIndex: 10,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 clamp(1.5rem, 8vw, 8rem) clamp(3rem, 10vh, 6rem)",
        }}
      >
        <div className="animate-in delay-1">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                <div style={{ width: 30, height: 1, background: "rgba(245,197,203,0.5)" }} />
                <span style={{ fontSize: "0.7rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "#F5C5CB", fontWeight: 700, fontFamily: BF }}>
                    {weddingConfig.celebrationTitle}
                </span>
            </div>
            
            <h1 className="names-h1" style={{
                fontFamily: DF,
                fontSize: "clamp(4.5rem, 12vw, 9.5rem)",
                fontWeight: 800,
                lineHeight: 0.85,
                letterSpacing: "-0.04em",
                color: "#fff",
                filter: "drop-shadow(0 0 20px rgba(0,0,0,0.4))",
                marginBottom: "0.1em"
            }}>
                {bf}<br/>
                <span style={{ color: "#F5C5CB", marginLeft: "-0.05em" }}>& {gf}</span>
            </h1>
        </div>

        <p className="animate-in delay-2" style={{
            fontFamily: BF,
            fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "35rem",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
            fontWeight: 400
        }}>
           <span style={{ color: "#F5C5CB", fontSize: "1.5rem", marginRight: '4px' }}>&ldquo;</span>
           {weddingConfig.introQuote}
           <span style={{ color: "#F5C5CB", fontSize: "1.5rem", marginLeft: '2px' }}>&rdquo;</span>
        </p>

        {/* ── Metadata Chips ── */}
        <div className="animate-in delay-2" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "3.5rem" }}>
          {[
            { icon: "📅", text: formatDate(weddingConfig.weddingDate) },
            { icon: "📍", text: weddingConfig.venueName },
            { icon: "👔", text: weddingConfig.dressCode.split(",")[0]! },
          ].map(({ icon, text }) => (
            <span key={text} className="detail-chip">
              <span>{icon}</span> {text}
            </span>
          ))}
        </div>

        {/* ── Actions ── */}
        <div className="animate-in delay-3" style={{ maxWidth: "700px" }}>
            <div style={{ height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)", marginBottom: "2rem" }} />
            
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: "1.5rem", fontFamily: BF }}>
                Private Portal Access
            </p>

            <div className="btn-row" style={{ display: "flex", gap: "1.25rem" }}>
                <a href="/login?hint=couple&redirect=/admin" className="btn-login btn-login-primary">
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "grid", placeItems: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                    💍
                    </div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <p style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontWeight: 700, marginBottom: 2 }}>The Couple</p>
                        <p style={{ fontSize: "1rem", fontWeight: 700 }}>Management Dashboard</p>
                    </div>
                    <svg style={{ marginLeft: "auto", opacity: 0.6 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>

                <a href="/login?hint=vault&redirect=/family" className="btn-login">
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                    🫂
                    </div>
                    <div>
                        <p style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 2 }}>The Family</p>
                        <p style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Family Vault</p>
                    </div>
                    <svg style={{ marginLeft: "auto", opacity: 0.3 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
            </div>

            <p className="animate-in delay-4" style={{ marginTop: "2rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontFamily: BF, fontWeight: 400 }}>
                Guests — please use the unique invitation link provided via WhatsApp or Mail.
            </p>
        </div>
      </main>

      {/* ── Border Accents ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, transparent, #C0364A, #B8820A, #C0364A, transparent)", zIndex: 30, opacity: 0.6 }} />
    </>
  );
}