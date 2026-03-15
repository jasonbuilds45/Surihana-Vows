"use client";

import { CalendarPlus } from "lucide-react";

interface CalendarButtonProps {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
}

function buildIcsDate(date: string, time: string) {
  const [year, month, day] = date.split("-");
  const [hours, minutes] = time.split(":");
  return `${year}${month}${day}T${hours}${minutes}00`;
}

function buildGoogleCalendarUrl(props: CalendarButtonProps) {
  const start = buildIcsDate(props.date, props.time);
  const endHour = String(Math.min(Number(props.time.split(":")[0]) + 2, 23)).padStart(2, "0");
  const end = buildIcsDate(props.date, `${endHour}:${props.time.split(":")[1]}`);

  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: props.title,
    details: props.description,
    location: props.venue,
    dates: `${start}/${end}`
  });

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

export function CalendarButton(props: CalendarButtonProps) {
  function handleDownloadIcs() {
    const start = buildIcsDate(props.date, props.time);
    const endHour = String(Math.min(Number(props.time.split(":")[0]) + 2, 23)).padStart(2, "0");
    const end = buildIcsDate(props.date, `${endHour}:${props.time.split(":")[1]}`);

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Surihana Vows//EN",
      "BEGIN:VEVENT",
      `UID:${crypto.randomUUID()}`,
      `DTSTAMP:${start}Z`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${props.title}`,
      `DESCRIPTION:${props.description}`,
      `LOCATION:${props.venue}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${props.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a
        className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-800 transition hover:border-stone-300"
        href={buildGoogleCalendarUrl(props)}
        rel="noreferrer"
        target="_blank"
      >
        <CalendarPlus className="h-4 w-4" />
        Google Calendar
      </a>
      <button
        className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-800 transition hover:border-stone-300"
        onClick={handleDownloadIcs}
        type="button"
      >
        <CalendarPlus className="h-4 w-4" />
        Download ICS
      </button>
    </div>
  );
}

export default CalendarButton;
