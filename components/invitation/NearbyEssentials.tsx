import { Bus, MapPin, Phone, Shield, ShoppingBag, Train } from "lucide-react";

export interface EssentialItem {
  id: string;
  title: string;
  description: string;
  link: string;
  icon?: string | null;
  category?: string | null;
}

function EssentialIcon({ icon }: { icon: string | null | undefined }) {
  switch (icon) {
    case "hospital":
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      );
    case "pharmacy": return <ShoppingBag className="h-4 w-4" />;
    case "police":   return <Shield className="h-4 w-4" />;
    case "bus":      return <Bus className="h-4 w-4" />;
    case "metro":
    case "train":    return <Train className="h-4 w-4" />;
    case "phone":    return <Phone className="h-4 w-4" />;
    default:         return <MapPin className="h-4 w-4" />;
  }
}

// Light-theme icon colours
const ICON_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  hospital: { bg: "rgba(254,202,202,0.4)", border: "rgba(252,165,165,0.4)", color: "#ef4444" },
  pharmacy: { bg: "rgba(167,243,208,0.4)", border: "rgba(110,231,183,0.4)", color: "#10b981" },
  police:   { bg: "rgba(191,219,254,0.4)", border: "rgba(147,197,253,0.4)", color: "#3b82f6" },
  bus:      { bg: "rgba(253,230,138,0.4)", border: "rgba(252,211,77,0.4)",  color: "#d97706" },
  metro:    { bg: "rgba(221,214,254,0.4)", border: "rgba(196,181,253,0.4)", color: "#7c3aed" },
  train:    { bg: "rgba(221,214,254,0.4)", border: "rgba(196,181,253,0.4)", color: "#7c3aed" },
  phone:    { bg: "rgba(253,230,138,0.4)", border: "rgba(252,211,77,0.4)",  color: "#d97706" },
};

export function NearbyEssentials({ items }: { items: EssentialItem[] }) {
  if (!items.length) return null;

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
          Nearby essentials
        </p>
        <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
          Everything you might need nearby.
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Emergency services, transport, and conveniences within reach of the venue.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const colors = ICON_COLORS[item.icon ?? ""] ?? {
            bg: "rgba(138,90,68,0.07)",
            border: "rgba(212,179,155,0.3)",
            color: "var(--color-accent-soft)",
          };
          return (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-4 rounded-xl p-4 transition"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-xs)" }}
            >
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.color }}
              >
                <EssentialIcon icon={item.icon} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs leading-5" style={{ color: "var(--color-text-muted)" }}>
                  {item.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export default NearbyEssentials;
