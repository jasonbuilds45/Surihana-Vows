"use client";

import { useMemo } from "react";
import { Trophy, Camera, MessageSquare, BarChart2, TrendingUp, Users, Zap } from "lucide-react";
import type { GuestTableRow } from "@/components/admin/GuestTable";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface PhotoUploadStat {
  guestName: string;
  count:     number;
}

interface MessageStat {
  guestName: string;
  count:     number;
}

interface HourlyUpload {
  hour:  string;
  count: number;
}

interface GuestInsightsProps {
  guests:          GuestTableRow[];
  photoStats:      PhotoUploadStat[];
  messageStats:    MessageStat[];
  hourlyUploads:   HourlyUpload[];
  predictionRate:  number; // 0-100
  totalPredictions: number;
}

const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";
const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BG   = "#FAF8F6";
const W    = "#FFFFFF";
const BDR  = "#D0C0BC";

const MEDAL = ["🥇", "🥈", "🥉"];

// ─────────────────────────────────────────────────────────────────────────────
function BarBar({ value, max, color = ROSE }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ height: 8, background: "#EDE0DC", borderRadius: 999, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width .5s ease" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function GuestInsights({
  guests,
  photoStats,
  messageStats,
  hourlyUploads,
  predictionRate,
  totalPredictions,
}: GuestInsightsProps) {

  // ── Engagement score per guest ─────────────────────────────────────────────
  const engagementScores = useMemo(() => {
    return guests.map(g => {
      const photoCount   = photoStats.find(p => p.guestName === g.guestName)?.count ?? 0;
      const messageCount = messageStats.find(m => m.guestName === g.guestName)?.count ?? 0;
      const opened       = g.inviteOpened ? 1 : 0;
      const rsvped       = g.attending !== null ? 1 : 0;
      const score        = photoCount * 3 + messageCount * 2 + opened + rsvped * 2;
      return { ...g, score, photoCount, messageCount };
    }).sort((a, b) => b.score - a.score).slice(0, 10);
  }, [guests, photoStats, messageStats]);

  // ── Invite engagement (opened multiple times proxy via analytics is missing here) ─
  const openedCount  = guests.filter(g => g.inviteOpened).length;
  const rsvpedCount  = guests.filter(g => g.attending !== null).length;
  const attendCount  = guests.filter(g => g.attending === true).length;
  const totalGuests  = guests.length;

  const maxHourly    = Math.max(...hourlyUploads.map(h => h.count), 1);
  const maxPhoto     = Math.max(...photoStats.map(p => p.count), 1);
  const maxMessage   = Math.max(...messageStats.map(m => m.count), 1);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* Header */}
      <div>
        <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: ROSE, fontFamily: BF }}>Post-wedding insights</p>
        <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 700, color: INK, marginTop: ".2rem" }}>Guest interaction insights</h2>
        <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>How your guests engaged with your wedding celebration.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
        {[
          { label: "Invites opened",  value: `${openedCount}/${totalGuests}`,  pct: totalGuests ? Math.round(openedCount/totalGuests*100) : 0,  icon: Zap,           color: "#F59E0B" },
          { label: "RSVP rate",       value: `${rsvpedCount}/${totalGuests}`,  pct: totalGuests ? Math.round(rsvpedCount/totalGuests*100) : 0,  icon: Users,         color: "#10B981" },
          { label: "Attending",       value: `${attendCount}/${totalGuests}`,  pct: totalGuests ? Math.round(attendCount/totalGuests*100) : 0,  icon: TrendingUp,    color: "#3B82F6" },
          { label: "Prediction rate", value: `${predictionRate}%`,             pct: predictionRate,                                              icon: BarChart2,     color: ROSE     },
        ].map(({ label, value, pct, icon: Icon, color }) => (
          <div key={label} style={{ background: W, border: `1px solid ${BDR}`, borderRadius: 16, padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".875rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}15`, display: "grid", placeItems: "center" }}>
                <Icon size={16} style={{ color }} />
              </div>
              <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF }}>{label}</p>
            </div>
            <p style={{ fontFamily: DF, fontSize: "1.625rem", fontWeight: 700, color: INK, lineHeight: 1 }}>{value}</p>
            <div style={{ marginTop: ".75rem", height: 5, background: "#EDE0DC", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Three-column insights */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>

        {/* Most active guests (engagement score) */}
        <div style={{ background: W, border: `1px solid ${BDR}`, borderRadius: 18, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BDR}`, background: BG, display: "flex", alignItems: "center", gap: ".625rem" }}>
            <Trophy size={16} style={{ color: "#D97706" }} />
            <p style={{ fontWeight: 700, fontSize: ".875rem", color: INK, fontFamily: BF }}>Most active guests</p>
          </div>
          <div style={{ padding: ".75rem 0" }}>
            {engagementScores.slice(0, 8).map((g, i) => (
              <div key={g.id} style={{ padding: ".625rem 1.25rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
                <span style={{ fontSize: "1rem", flexShrink: 0, width: 24, textAlign: "center" }}>{i < 3 ? MEDAL[i] : `${i+1}.`}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: ".875rem", fontWeight: 600, color: INK, fontFamily: BF, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {g.guestName}{g.familyName ? ` ${g.familyName}` : ""}
                  </p>
                  <p style={{ fontSize: ".7rem", color: INK3, fontFamily: BF }}>
                    {g.photoCount} photos · {g.messageCount} messages
                  </p>
                </div>
                <span style={{ fontSize: ".78rem", fontWeight: 700, color: ROSE, fontFamily: BF, flexShrink: 0 }}>{g.score}pts</span>
              </div>
            ))}
            {engagementScores.length === 0 && (
              <p style={{ padding: "2rem", textAlign: "center", fontSize: ".875rem", color: INK3, fontFamily: BF }}>No engagement data yet.</p>
            )}
          </div>
        </div>

        {/* Top photo uploaders */}
        <div style={{ background: W, border: `1px solid ${BDR}`, borderRadius: 18, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BDR}`, background: BG, display: "flex", alignItems: "center", gap: ".625rem" }}>
            <Camera size={16} style={{ color: "#3B82F6" }} />
            <p style={{ fontWeight: 700, fontSize: ".875rem", color: INK, fontFamily: BF }}>Top photo uploaders</p>
          </div>
          <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: ".875rem" }}>
            {photoStats.slice(0, 8).map((p, i) => (
              <div key={p.guestName}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".375rem" }}>
                  <span style={{ fontSize: ".82rem", color: INK, fontFamily: BF }}>{i < 3 ? `${MEDAL[i]} ` : ""}{p.guestName}</span>
                  <span style={{ fontSize: ".78rem", color: INK3, fontFamily: BF }}>{p.count}</span>
                </div>
                <BarBar value={p.count} max={maxPhoto} color="#3B82F6" />
              </div>
            ))}
            {photoStats.length === 0 && <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>No photos uploaded yet.</p>}
          </div>
        </div>

        {/* Top message writers */}
        <div style={{ background: W, border: `1px solid ${BDR}`, borderRadius: 18, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BDR}`, background: BG, display: "flex", alignItems: "center", gap: ".625rem" }}>
            <MessageSquare size={16} style={{ color: "#8B5CF6" }} />
            <p style={{ fontWeight: 700, fontSize: ".875rem", color: INK, fontFamily: BF }}>Top message writers</p>
          </div>
          <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: ".875rem" }}>
            {messageStats.slice(0, 8).map((m, i) => (
              <div key={m.guestName}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".375rem" }}>
                  <span style={{ fontSize: ".82rem", color: INK, fontFamily: BF }}>{i < 3 ? `${MEDAL[i]} ` : ""}{m.guestName}</span>
                  <span style={{ fontSize: ".78rem", color: INK3, fontFamily: BF }}>{m.count}</span>
                </div>
                <BarBar value={m.count} max={maxMessage} color="#8B5CF6" />
              </div>
            ))}
            {messageStats.length === 0 && <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>No messages yet.</p>}
          </div>
        </div>
      </div>

      {/* Hourly photo upload chart */}
      {hourlyUploads.length > 0 && (
        <div style={{ background: W, border: `1px solid ${BDR}`, borderRadius: 18, padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".625rem", marginBottom: "1.25rem" }}>
            <TrendingUp size={16} style={{ color: ROSE }} />
            <p style={{ fontWeight: 700, fontSize: ".875rem", color: INK, fontFamily: BF }}>Photos uploaded per hour (wedding day)</p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: ".375rem", height: 80 }}>
            {hourlyUploads.map(h => {
              const pct = maxHourly > 0 ? Math.max(4, Math.round((h.count / maxHourly) * 80)) : 0;
              return (
                <div key={h.hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: ".375rem" }}>
                  <div title={`${h.count} photos`} style={{ width: "100%", height: pct, background: ROSE, borderRadius: "4px 4px 0 0", minHeight: h.count > 0 ? 4 : 0, transition: "height .5s ease" }} />
                  <span style={{ fontSize: ".55rem", color: INK3, fontFamily: BF, writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }}>{h.hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prediction participation */}
      <div style={{ background: "linear-gradient(135deg, #1A0C10 0%, #2A1218 100%)", borderRadius: 18, padding: "1.75rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(245,197,203,.65)", fontFamily: BF }}>Prediction game</p>
          <p style={{ fontFamily: DF, fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 700, color: W, lineHeight: 1, marginTop: ".25rem" }}>{predictionRate}%</p>
          <p style={{ fontSize: ".875rem", color: "rgba(255,255,255,.55)", fontFamily: BF, marginTop: ".375rem" }}>participation rate</p>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ height: 12, background: "rgba(255,255,255,.1)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${predictionRate}%`, background: "linear-gradient(90deg, #C0364A, #F5C5CB)", borderRadius: 999, transition: "width .8s ease" }} />
          </div>
          <p style={{ fontSize: ".78rem", color: "rgba(255,255,255,.40)", fontFamily: BF, marginTop: ".625rem" }}>{totalPredictions} total votes cast</p>
        </div>
      </div>
    </section>
  );
}

export default GuestInsights;
