"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "@/lib/client/token";
import { Activity, Camera, MessageSquare, Users, Radio, Zap, Clock, RefreshCcw } from "lucide-react";
import { weddingConfig } from "@/lib/config";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface CommandMetrics {
  photosToday:    number;
  messagesToday:  number;
  activeGuests:   number;
  liveViewers:    number;
  currentStage:   string;
  nextEvent:      string | null;
  nextEventTime:  string | null;
}

interface ActivityItem {
  id:        string;
  type:      "photo" | "message" | "rsvp" | "invite_opened";
  actor:     string;
  detail:    string;
  timestamp: string;
}

interface WeddingCommandCenterProps {
  initialMetrics:  CommandMetrics;
  initialActivity: ActivityItem[];
  weddingId:       string;
}

const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";
const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const W    = "#FFFFFF";
const BDR  = "#D0C0BC";

const ACTIVITY_ICONS: Record<ActivityItem["type"], React.ElementType> = {
  photo:         Camera,
  message:       MessageSquare,
  rsvp:          Users,
  invite_opened: Zap,
};

const ACTIVITY_COLORS: Record<ActivityItem["type"], string> = {
  photo:         "#3B82F6",
  message:       "#8B5CF6",
  rsvp:          "#10B981",
  invite_opened: "#F59E0B",
};

function relTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
export function WeddingCommandCenter({ initialMetrics, initialActivity, weddingId }: WeddingCommandCenterProps) {
  const [metrics,  setMetrics]  = useState<CommandMetrics>(initialMetrics);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const [loading,  setLoading]  = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/admin/command-center?weddingId=${encodeURIComponent(weddingId)}`);
      if (!res.ok) return;
      const data = await res.json() as { metrics: CommandMetrics; activity: ActivityItem[] };
      setMetrics(data.metrics);
      setActivity(data.activity);
      setLastUpdate(new Date());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [weddingId]);

  // Auto-refresh every 30s
  useEffect(() => {
    intervalRef.current = setInterval(refresh, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [refresh]);

  const metricCards = [
    { label: "Photos today",   value: metrics.photosToday,   icon: Camera,       color: "#3B82F6" },
    { label: "Messages today", value: metrics.messagesToday, icon: MessageSquare, color: "#8B5CF6" },
    { label: "Active guests",  value: metrics.activeGuests,  icon: Users,        color: "#10B981" },
    { label: "Live viewers",   value: metrics.liveViewers,   icon: Radio,        color: ROSE },
  ];

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: ROSE, fontFamily: BF }}>Wedding day</p>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 700, color: INK, marginTop: ".2rem" }}>Command center</h2>
          <p style={{ fontSize: ".8rem", color: INK3, fontFamily: BF, marginTop: ".25rem" }}>
            Auto-refreshes every 30s · Last updated {relTime(lastUpdate.toISOString())}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
          {/* Stage badge */}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "#FDEAEC", border: "1px solid #F5C5CB", fontSize: ".78rem", fontWeight: 700, color: ROSE, fontFamily: BF }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: ROSE, animation: "pulse 1.5s infinite" }} />
            Stage: {metrics.currentStage}
          </span>
          <button onClick={refresh} disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 999, background: W, border: `1.5px solid ${BDR}`, fontSize: ".8rem", color: INK3, fontFamily: BF, cursor: "pointer" }}>
            <RefreshCcw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
        {metricCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: W, border: `1px solid ${BDR}`, borderRadius: 16, padding: "1.25rem", display: "flex", flexDirection: "column", gap: ".75rem" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}15`, display: "grid", placeItems: "center" }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p style={{ fontFamily: DF, fontSize: "2rem", fontWeight: 700, color: INK, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".25rem" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Next event + activity feed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>

        {/* Next event */}
        <div style={{ background: "linear-gradient(135deg, #1A0C10 0%, #2A1218 100%)", borderRadius: 18, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".625rem" }}>
            <Clock size={16} style={{ color: "#F5C5CB" }} />
            <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(245,197,203,.65)", fontFamily: BF }}>Next event</p>
          </div>
          {metrics.nextEvent ? (
            <>
              <p style={{ fontFamily: DF, fontSize: "1.375rem", fontWeight: 700, color: W, lineHeight: 1.25 }}>{metrics.nextEvent}</p>
              <p style={{ fontSize: ".875rem", color: "rgba(255,255,255,.55)", fontFamily: BF }}>{metrics.nextEventTime}</p>
            </>
          ) : (
            <p style={{ fontSize: ".875rem", color: "rgba(255,255,255,.40)", fontFamily: BF }}>All events completed.</p>
          )}
          <div style={{ marginTop: "auto" }}>
            <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(245,197,203,.5)", fontFamily: BF, marginBottom: ".375rem" }}>Venue</p>
            <p style={{ fontSize: ".875rem", color: "rgba(255,255,255,.65)", fontFamily: BF }}>{weddingConfig.venueName}</p>
          </div>
        </div>

        {/* Activity feed */}
        <div style={{ background: W, border: `1px solid ${BDR}`, borderRadius: 18, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BDR}`, display: "flex", alignItems: "center", gap: ".625rem" }}>
            <Activity size={16} style={{ color: ROSE }} />
            <p style={{ fontFamily: BF, fontWeight: 700, fontSize: ".875rem", color: INK }}>Live activity feed</p>
          </div>
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {activity.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>No activity yet today.</p>
              </div>
            ) : (
              activity.map(item => {
                const Icon  = ACTIVITY_ICONS[item.type];
                const color = ACTIVITY_COLORS[item.type];
                return (
                  <div key={item.id} style={{ padding: ".875rem 1.25rem", borderBottom: `1px solid #F0E8E4`, display: "flex", alignItems: "flex-start", gap: ".875rem" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${color}15`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: ".875rem", color: INK, fontFamily: BF }}>{item.actor}</p>
                      <p style={{ fontSize: ".8rem", color: INK3, fontFamily: BF, marginTop: ".125rem" }}>{item.detail}</p>
                    </div>
                    <span style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, flexShrink: 0 }}>{relTime(item.timestamp)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WeddingCommandCenter;
