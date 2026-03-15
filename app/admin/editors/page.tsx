import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { weddingConfig, travelConfig } from "@/lib/config";
import { StoryEditor } from "@/components/admin/StoryEditor";
import { TravelInfoEditor } from "@/components/admin/TravelInfoEditor";

export const metadata: Metadata = { title: `Editors — ${weddingConfig.celebrationTitle}` };

const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";

export default async function EditorsPage() {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/admin")) {
    redirect("/login?redirect=%2Fadmin%2Feditors");
  }

  const story = ((weddingConfig as any).story ?? []).map((b: any) => ({
    year:        String(b.year        ?? ""),
    title:       String(b.title       ?? ""),
    description: String(b.description ?? ""),
    imageUrl:    String(b.imageUrl    ?? ""),
  }));

  const sections = ((travelConfig as any).sections ?? []).map((s: any, i: number) => ({
    id:          `cfg-${i}`,
    title:       String(s.title       ?? ""),
    description: String(s.description ?? ""),
    link:        String(s.link        ?? ""),
  }));

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#FAF8F6", borderBottom: "1px solid #E4D8D4", padding: "2.5rem clamp(1.25rem,5vw,4rem)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: ROSE, marginBottom: ".625rem", fontFamily: BF }}>Admin</p>
          <h1 style={{ fontFamily: DF, fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 700, color: INK, marginBottom: ".5rem" }}>Content editors</h1>
          <p style={{ fontSize: ".9375rem", color: INK3, fontFamily: BF }}>Edit your love story and travel guide directly from here.</p>
          <div style={{ display: "flex", gap: ".75rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
            <a href="#story"  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, background: "#FDEAEC", border: "1px solid #F5C5CB", color: ROSE, fontSize: ".78rem", fontWeight: 700, fontFamily: BF, textDecoration: "none" }}>↓ Story editor</a>
            <a href="#travel" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, background: "#FDEAEC", border: "1px solid #F5C5CB", color: ROSE, fontSize: ".78rem", fontWeight: 700, fontFamily: BF, textDecoration: "none" }}>↓ Travel editor</a>
            <a href="/admin"  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, background: "#FFFFFF", border: "1px solid #E4D8D4", color: INK, fontSize: ".78rem", fontWeight: 600, fontFamily: BF, textDecoration: "none" }}>← Back to dashboard</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem clamp(1.25rem,5vw,4rem) 6rem", display: "flex", flexDirection: "column", gap: "4rem" }}>
        <div id="story"><StoryEditor initialStory={story} /></div>
        <div style={{ height: 1, background: "#E4D8D4" }} />
        <div id="travel">
          <TravelInfoEditor
            initialSections={sections}
            initialFaq={(travelConfig as any).faq ?? []}
            initialArrivalTips={(travelConfig as any).arrivalTips ?? []}
          />
        </div>
      </div>
    </div>
  );
}
