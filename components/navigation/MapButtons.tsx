import Link from "next/link";
import { MapPinned, Navigation, Route } from "lucide-react";

interface MapButtonsProps { mapLink: string; venueName: string; }

const btnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  borderRadius: "9999px",
  padding: "0.5rem 1rem",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-secondary)",
  boxShadow: "var(--shadow-xs)",
  textDecoration: "none",
  transition: "border-color 0.15s",
};

export function MapButtons({ mapLink, venueName }: MapButtonsProps) {
  const appleLink = `https://maps.apple.com/?q=${encodeURIComponent(venueName)}`;
  const wazeLink  = `https://waze.com/ul?q=${encodeURIComponent(venueName)}`;

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={mapLink} target="_blank" style={btnStyle}>
        <MapPinned className="h-3.5 w-3.5" />
        Google Maps
      </Link>
      <Link href={appleLink} target="_blank" style={btnStyle}>
        <Navigation className="h-3.5 w-3.5" />
        Apple Maps
      </Link>
      <Link href={wazeLink} target="_blank" style={btnStyle}>
        <Route className="h-3.5 w-3.5" />
        Waze
      </Link>
    </div>
  );
}

export default MapButtons;
