"use client";

/**
 * AddToCalendarButton — Step 4
 * Reusable guest component for adding wedding events to calendar apps.
 * Supports Google Calendar, Apple Calendar (.ics), and Outlook.
 * Guest-facing only — no admin systems touched.
 */

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Apple } from "lucide-react";

interface AddToCalendarButtonProps {
  eventTitle:  string;
  date:        string;   // YYYY-MM-DD
  startTime:   string;   // HH:mm
  endTime?:    string;   // HH:mm  (defaults to startTime + 2 hours)
  venue:       string;
  description?: string;
  size?: "sm" | "md";
}

const BF = "var(--font-body), system-ui, sans-serif";

function toCalDate(date: string, time: string): string {
  // Returns YYYYMMDDTHHMMSS (local, no Z suffix for Google/Outlook)
  return `${date.replace(/-/g, "")}T${time.replace(/:/g, "")}00`;
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total  = (h! + hours) % 24;
  return `${String(total).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
}

function buildGoogleUrl(props: AddToCalendarButtonProps) {
  const end = props.endTime ?? addHours(props.startTime, 2);
  const params = new URLSearchParams({
    action:   "TEMPLATE",
    text:     props.eventTitle,
    dates:    `${toCalDate(props.date, props.startTime)}/${toCalDate(props.date, end)}`,
    location: props.venue,
    details:  props.description ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildICS(props: AddToCalendarButtonProps): string {
  const end = props.endTime ?? addHours(props.startTime, 2);
  const uid = `${props.eventTitle.replace(/\s+/g, "-").toLowerCase()}-${props.date}@surihana.vows`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Surihana Vows//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${toCalDate(props.date, props.startTime)}`,
    `DTEND:${toCalDate(props.date, end)}`,
    `SUMMARY:${props.eventTitle}`,
    `LOCATION:${props.venue}`,
    `DESCRIPTION:${props.description ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadICS(props: AddToCalendarButtonProps) {
  const ics  = buildICS(props);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${props.eventTitle.replace(/\s+/g, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function buildOutlookUrl(props: AddToCalendarButtonProps) {
  const end = props.endTime ?? addHours(props.startTime, 2);
  const params = new URLSearchParams({
    path:      "/calendar/action/compose",
    rru:       "addevent",
    subject:   props.eventTitle,
    startdt:   `${props.date}T${props.startTime}:00`,
    enddt:     `${props.date}T${end}:00`,
    location:  props.venue,
    body:      props.description ?? "",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function AddToCalendarButton(props: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isSm = props.size === "sm";

  const btnBase: React.CSSProperties = {
    display:       "inline-flex",
    alignItems:    "center",
    gap:           6,
    padding:       isSm ? "6px 14px" : "9px 18px",
    borderRadius:  999,
    background:    "var(--color-surface)",
    border:        "1.5px solid var(--color-border-medium)",
    color:         "var(--color-text-secondary)",
    fontSize:      isSm ? ".7rem" : ".78rem",
    fontWeight:    600,
    fontFamily:    BF,
    letterSpacing: ".12em",
    textTransform: "uppercase" as const,
    cursor:        "pointer",
    transition:    "background .15s, border-color .15s",
  };

  const optionStyle: React.CSSProperties = {
    display:     "flex",
    alignItems:  "center",
    gap:         10,
    padding:     "10px 16px",
    cursor:      "pointer",
    fontSize:    ".85rem",
    color:       "var(--color-text-primary)",
    fontFamily:  BF,
    transition:  "background .12s",
    background:  "transparent",
    border:      "none",
    width:       "100%",
    textAlign:   "left",
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={btnBase}>
        <Calendar size={isSm ? 12 : 14} />
        Add to calendar
        <ChevronDown size={isSm ? 10 : 12} style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div style={{
          position:    "absolute",
          top:         "calc(100% + 8px)",
          left:        0,
          zIndex:      100,
          background:  "#fff",
          border:      "1px solid var(--color-border)",
          borderRadius: 14,
          boxShadow:   "0 8px 28px rgba(0,0,0,.12)",
          minWidth:    200,
          overflow:    "hidden",
          animation:   "calDropIn .15s ease",
        }}>
          {/* Google */}
          <a
            href={buildGoogleUrl(props)}
            target="_blank"
            rel="noreferrer"
            style={{ ...optionStyle, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#FAF8F6")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            onClick={() => setOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google Calendar
          </a>

          {/* Apple */}
          <button
            type="button"
            style={optionStyle}
            onMouseEnter={e => (e.currentTarget.style.background = "#FAF8F6")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            onClick={() => { downloadICS(props); setOpen(false); }}
          >
            <Apple size={15} style={{ color: "#555" }} />
            Apple Calendar
          </button>

          {/* Outlook */}
          <a
            href={buildOutlookUrl(props)}
            target="_blank"
            rel="noreferrer"
            style={{ ...optionStyle, textDecoration: "none", borderTop: "1px solid var(--color-border)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#FAF8F6")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            onClick={() => setOpen(false)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#0078D4"><path d="M24 12.5c0-5.247-4.253-9.5-9.5-9.5S5 7.253 5 12.5 9.253 22 14.5 22 24 17.747 24 12.5zm-9.5 7c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7zm-.5-9h1v4.5l3.25 1.95-.5.866L14 15.75V10.5z"/></svg>
            Outlook
          </a>
        </div>
      )}

      <style>{`@keyframes calDropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

export default AddToCalendarButton;
