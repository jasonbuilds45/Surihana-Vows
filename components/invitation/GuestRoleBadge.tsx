import type { GuestRole } from "@/lib/types";

interface GuestRoleBadgeProps {
  role: GuestRole | null | undefined;
  brideName: string;
  groomName: string;
}

const ROLE_CONFIG: Record<GuestRole, { label: (bride: string, groom: string) => string; style: React.CSSProperties }> = {
  bride_side: {
    label: (bride) => `${bride}'s side`,
    style: { background: "rgba(251,207,232,0.4)", border: "1px solid rgba(249,168,212,0.5)", color: "#be185d" },
  },
  groom_side: {
    label: (_, groom) => `${groom}'s side`,
    style: { background: "rgba(186,230,253,0.4)", border: "1px solid rgba(125,211,252,0.5)", color: "#0369a1" },
  },
  family: {
    label: () => "Family",
    style: { background: "rgba(253,230,138,0.4)", border: "1px solid rgba(252,211,77,0.5)", color: "#92400e" },
  },
  vip: {
    label: () => "Special guest",
    style: { background: "rgba(221,214,254,0.4)", border: "1px solid rgba(196,181,253,0.5)", color: "#5b21b6" },
  },
  friends: {
    label: () => "Friends of the couple",
    style: { background: "rgba(167,243,208,0.4)", border: "1px solid rgba(110,231,183,0.5)", color: "#065f46" },
  },
};

export function GuestRoleBadge({ role, brideName, groomName }: GuestRoleBadgeProps) {
  if (!role) return null;
  const config = ROLE_CONFIG[role];
  if (!config) return null;
  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];

  return (
    <span
      className="inline-flex items-center rounded-full px-3.5 py-1"
      style={{
        fontSize: "0.6rem",
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        fontWeight: 500,
        ...config.style,
      }}
    >
      {config.label(brideFirst, groomFirst)}
    </span>
  );
}

export default GuestRoleBadge;
