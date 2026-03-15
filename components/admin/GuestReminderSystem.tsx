"use client";

/**
 * GuestReminderSystem
 * Smart reminder panel in the admin dashboard.
 * Shows: guests who haven't opened their invite, guests with no RSVP, 
 * upcoming RSVP deadline, and lets the admin copy/generate reminder messages.
 */

import { useState } from "react";
import { Bell, Copy, CheckCircle2, Users, Mail, MessageSquare, Clock } from "lucide-react";
import type { GuestTableRow } from "@/components/admin/GuestTable";

const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK2 = "#3D2530";
const INK3 = "#7A5460";
const BG   = "#FAF8F6";
const W    = "#FFFFFF";
const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";

interface Props {
  guests:      GuestTableRow[];
  weddingDate: string;
  coupleName:  string;
  venueName:   string;
}

function copyToClipboard(text: string, cb: () => void) {
  navigator.clipboard.writeText(text).then(cb).catch(() => {
    // fallback
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    cb();
  });
}

function makeWhatsAppMsg(guest: GuestTableRow, coupleName: string, venueName: string, weddingDate: string): string {
  const first = guest.guestName.split(" ")[0] ?? guest.guestName;
  const date  = new Date(weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return `Hi ${first}! 🌸\n\nWe'd love to have you celebrate with us at the wedding of ${coupleName} on ${date} at ${venueName}.\n\nKindly confirm your attendance — it helps us make sure everything is perfect for you.\n\nYour invite link: [INVITE_LINK]\n\nWith love ❤️`;
}

function makeEmailMsg(guest: GuestTableRow, coupleName: string, weddingDate: string): string {
  const first = guest.guestName.split(" ")[0] ?? guest.guestName;
  const date  = new Date(weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return `Subject: Your RSVP reminder — ${coupleName}'s Wedding\n\nDear ${first},\n\nWe wanted to send a gentle reminder about the upcoming wedding celebration of ${coupleName} on ${date}.\n\nYour presence means everything to us. Please confirm your attendance at your earliest convenience using your personalised invite link.\n\nWith warmest regards,\nThe Wedding Team`;
}

export function GuestReminderSystem({ guests, weddingDate, coupleName, venueName }: Props) {
  const [tab,     setTab]     = useState<"unopened" | "norsvp" | "vip">("unopened");
  const [copied,  setCopied]  = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"whatsapp" | "email">("whatsapp");

  // Categorise
  const unopened = guests.filter((g) => !g.inviteOpened);
  const noRsvp   = guests.filter((g) => g.attending === null || g.attending === undefined);
  const vip      = guests.filter((g) => (g as any).guestRole === "vip" || (g as any).role === "vip");

  const lists: Record<typeof tab, GuestTableRow[]> = { unopened, norsvp: noRsvp, vip };
  const current = lists[tab];

  const daysLeft = Math.ceil((new Date(weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  function handleCopy(guest: GuestTableRow) {
    const msg = msgType === "whatsapp"
      ? makeWhatsAppMsg(guest, coupleName, venueName, weddingDate)
      : makeEmailMsg(guest, coupleName, weddingDate);
    copyToClipboard(msg, () => {
      setCopied(guest.id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function handleCopyAll() {
    const messages = current.map((g) =>
      msgType === "whatsapp"
        ? `--- ${g.guestName} ---\n${makeWhatsAppMsg(g, coupleName, venueName, weddingDate)}`
        : `--- ${g.guestName} ---\n${makeEmailMsg(g, coupleName, weddingDate)}`
    ).join("\n\n");
    copyToClipboard(messages, () => {
      setCopied("all");
      setTimeout(() => setCopied(null), 2500);
    });
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "7px 16px", borderRadius: 999, fontSize: ".78rem", fontWeight: active ? 700 : 500,
    background: active ? ROSE : W, color: active ? W : INK3,
    border: `1px solid ${active ? ROSE : "#E4D8D4"}`,
    cursor: "pointer", fontFamily: BF, transition: "all .15s ease",
  });

  return (
    <section>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Bell size={20} style={{ color: ROSE }} />
          <div>
            <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: ROSE, fontFamily: BF }}>Smart reminders</p>
            <h2 style={{ fontFamily: DF, fontSize: "clamp(1.25rem,3vw,2rem)", fontWeight: 700, color: INK, marginTop: ".2rem" }}>Guest reminder system</h2>
          </div>
        </div>

        {/* Countdown pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 999, background: daysLeft <= 30 ? "#FEF2F2" : BG, border: `1px solid ${daysLeft <= 30 ? "#FECACA" : "#E4D8D4"}` }}>
          <Clock size={14} style={{ color: daysLeft <= 30 ? "#DC2626" : ROSE }} />
          <span style={{ fontSize: ".8rem", fontWeight: 700, color: daysLeft <= 30 ? "#DC2626" : INK, fontFamily: BF }}>
            {daysLeft > 0 ? `${daysLeft} days to wedding` : "Wedding day!"}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { icon: Mail,         label: "Invite not opened",   count: unopened.length, tab: "unopened" as const },
          { icon: MessageSquare,label: "No RSVP yet",         count: noRsvp.length,   tab: "norsvp"  as const },
          { icon: Users,        label: "VIP guests",          count: vip.length,      tab: "vip"     as const },
        ].map(({ icon: Icon, label, count, tab: t }) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "1.25rem", background: tab === t ? "#FDEAEC" : W, border: `1px solid ${tab === t ? "#F5C5CB" : "#E4D8D4"}`, borderRadius: 16, textAlign: "left", cursor: "pointer", transition: "all .15s" }}>
            <Icon size={20} style={{ color: ROSE, marginBottom: ".625rem" }} />
            <p style={{ fontFamily: DF, fontSize: "1.5rem", fontWeight: 700, color: INK }}>{count}</p>
            <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".2rem" }}>{label}</p>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button onClick={() => setTab("unopened")} style={tabStyle(tab === "unopened")}>Unopened ({unopened.length})</button>
          <button onClick={() => setTab("norsvp")}   style={tabStyle(tab === "norsvp")}>No RSVP ({noRsvp.length})</button>
          <button onClick={() => setTab("vip")}      style={tabStyle(tab === "vip")}>VIP ({vip.length})</button>
        </div>
        <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
          <select value={msgType} onChange={(e) => setMsgType(e.target.value as any)}
            style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid #E4D8D4", background: W, color: INK, fontSize: ".8rem", fontFamily: BF, cursor: "pointer", outline: "none" }}>
            <option value="whatsapp">WhatsApp template</option>
            <option value="email">Email template</option>
          </select>
          {current.length > 0 && (
            <button onClick={handleCopyAll}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 999, background: ROSE, color: W, fontSize: ".78rem", fontWeight: 700, fontFamily: BF, cursor: "pointer", border: "none" }}>
              {copied === "all" ? <><CheckCircle2 size={13} /> Copied!</> : <><Copy size={13} /> Copy all ({current.length})</>}
            </button>
          )}
        </div>
      </div>

      {/* Guest list */}
      {current.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", background: BG, borderRadius: 20, border: "1.5px dashed #D0C0BC" }}>
          <CheckCircle2 size={32} style={{ color: "#16A34A", margin: "0 auto .875rem" }} />
          <p style={{ fontFamily: DF, fontSize: "1.125rem", fontWeight: 700, color: INK, marginBottom: ".375rem" }}>
            {tab === "unopened" ? "Every guest has opened their invite!" :
             tab === "norsvp"   ? "All guests have RSVPed!" :
             "No VIP guests marked yet."}
          </p>
          <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>
            {tab === "vip" ? "Mark guests as VIP in the Guest Management table above." : "Great work!"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
          {current.slice(0, 20).map((guest) => (
            <div key={guest.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem 1.25rem", background: W, border: "1px solid #E4D8D4", borderRadius: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".875rem", minWidth: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FDEAEC", border: "1px solid #F5C5CB", display: "grid", placeItems: "center", flexShrink: 0, fontFamily: DF, fontSize: ".9rem", fontWeight: 700, color: ROSE }}>
                  {(guest.guestName[0] ?? "?").toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: ".9375rem", color: INK, fontFamily: BF }}>{guest.guestName}</p>
                  <div style={{ display: "flex", gap: ".5rem", marginTop: ".2rem", flexWrap: "wrap" }}>
                    {!guest.inviteOpened && <span style={{ fontSize: ".62rem", padding: "2px 8px", borderRadius: 999, background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontFamily: BF }}>Invite not opened</span>}
                    {(guest.attending === null || guest.attending === undefined) && <span style={{ fontSize: ".62rem", padding: "2px 8px", borderRadius: 999, background: "#FBF5E8", border: "1px solid #E8D0A0", color: "#92400E", fontFamily: BF }}>No RSVP</span>}
                    {guest.phone && <span style={{ fontSize: ".72rem", color: INK3, fontFamily: BF }}>{guest.phone}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => handleCopy(guest)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 999, background: copied === guest.id ? "#F0FDF4" : BG, border: `1px solid ${copied === guest.id ? "#86EFAC" : "#E4D8D4"}`, color: copied === guest.id ? "#16A34A" : INK, fontSize: ".78rem", fontWeight: 600, fontFamily: BF, cursor: "pointer", flexShrink: 0, transition: "all .15s" }}>
                {copied === guest.id ? <><CheckCircle2 size={13} /> Copied!</> : <><Copy size={13} /> Copy message</>}
              </button>
            </div>
          ))}
          {current.length > 20 && (
            <p style={{ textAlign: "center", fontSize: ".8rem", color: INK3, fontFamily: BF, padding: "1rem" }}>
              Showing 20 of {current.length} guests.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
