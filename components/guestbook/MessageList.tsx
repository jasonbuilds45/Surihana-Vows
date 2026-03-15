import type { GuestMessageRow } from "@/lib/types";
import { formatRelativeDate } from "@/utils/formatDate";
import { MessageSquare } from "lucide-react";

const THEMES = [
  { bg: "#FDF0EF", border: "#F5C5CB", av: "#C0364A", avText: "#FFFFFF" },
  { bg: "#F5EEF8", border: "#D8B8E8", av: "#7A3090", avText: "#FFFFFF" },
  { bg: "#F0F8F4", border: "#B8D8C8", av: "#3A8060", avText: "#FFFFFF" },
  { bg: "#EDF4FA", border: "#B8D0E8", av: "#2878B0", avText: "#FFFFFF" },
  { bg: "#FBF5E8", border: "#E8D0A0", av: "#B8820A", avText: "#FFFFFF" },
  { bg: "#FDF0EE", border: "#F0C0B0", av: "#C85040", avText: "#FFFFFF" },
];

const BF = "var(--font-body), -apple-system, system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";
const INK  = "#1A1012";
const INK2 = "#3D2530";
const INK3 = "#7A5460";

export function MessageList({ messages }: { messages: GuestMessageRow[] }) {
  if (!messages.length) return (
    <div style={{ padding: "3rem 2rem", textAlign: "center", background: "#FAF8F6", borderRadius: 20, border: "1.5px dashed #D0C0BC" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FDEAEC", border: "1px solid #F5C5CB", display: "grid", placeItems: "center", margin: "0 auto 1rem" }}>
        <MessageSquare size={22} style={{ color: "#C0364A" }} />
      </div>
      <p style={{ fontFamily: DF, fontSize: "1.25rem", fontWeight: 700, color: INK, marginBottom: "0.5rem" }}>
        Be the first to leave a blessing
      </p>
      <p style={{ fontSize: "0.875rem", color: INK3, fontFamily: BF }}>
        Your message will stay with the couple forever.
      </p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {messages.map((msg, i) => {
        const t      = THEMES[i % THEMES.length]!;
        const letter = (msg.guest_name.trim()[0] ?? "?").toUpperCase();
        return (
          <div key={msg.id}
            style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1.25rem", background: t.bg, borderRadius: 16, border: `1px solid ${t.border}`, transition: "transform 0.18s ease, box-shadow 0.18s ease" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(80,20,30,0.10)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            {/* Avatar */}
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.av, color: t.avText, display: "grid", placeItems: "center", flexShrink: 0, fontFamily: DF, fontSize: "1rem", fontWeight: 700 }}>
              {letter}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.625rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: INK, fontFamily: BF }}>{msg.guest_name}</p>
                {msg.created_at && (
                  <p style={{ fontSize: "0.75rem", color: INK3, fontFamily: BF }}>{formatRelativeDate(msg.created_at)}</p>
                )}
              </div>
              <p style={{ fontSize: "0.9rem", color: INK2, lineHeight: 1.65, fontFamily: BF }}>{msg.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MessageList;
