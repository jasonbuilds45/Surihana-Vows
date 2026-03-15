"use client";

import { useState } from "react";
import { Calendar, Eye, Lock, RefreshCcw, Zap } from "lucide-react";
import { Card, SectionLabel, Btn, Badge } from "@/components/ui";

interface LifecycleStageControlProps {
  weddingId: string;
  currentOverride?: "invitation" | "live" | "vault" | null;
}

type Stage = "invitation" | "live" | "vault";
interface ApiResponse { success: boolean; message?: string; stage?: Stage | null; }

const STAGES: { value: Stage; label: string; description: string; icon: React.ElementType; badge: "gold" | "rose" | "plum" }[] = [
  { value: "invitation", label: "Invitation",  description: "Guests see the cinematic invite, RSVP, and story.",       icon: Calendar, badge: "gold" },
  { value: "live",       label: "Live hub",    description: "Wedding day — guests see stream, photos, messages.",      icon: Zap,      badge: "rose" },
  { value: "vault",      label: "Vault",       description: "Post-wedding — invite link requires family login.",       icon: Lock,     badge: "plum" },
];

export function LifecycleStageControl({ weddingId, currentOverride }: LifecycleStageControlProps) {
  const [activeOverride, setActiveOverride] = useState<Stage | null>(currentOverride ?? null);
  const [loading, setLoading] = useState<Stage | "reset" | null>(null);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  async function setStage(stage: Stage | null) {
    const key = stage ?? "reset";
    setLoading(key); setStatus(null);
    try {
      const res = await fetch("/api/admin/lifecycle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weddingId, stage }) });
      const p = (await res.json()) as ApiResponse;
      if (!res.ok || !p.success) throw new Error(p.message ?? "Failed.");
      setActiveOverride(stage);
      setStatus({ success: true, message: stage ? `Stage forced to "${stage}". All guests see the ${stage} experience.` : "Stage reset to automatic." });
    } catch (err) {
      setStatus({ success: false, message: err instanceof Error ? err.message : "Failed." });
    } finally { setLoading(null); }
  }

  return (
    <Card className="space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <SectionLabel>Lifecycle control</SectionLabel>
        <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
          Force a platform stage
        </h2>
        <p className="text-sm leading-7 max-w-xl" style={{ color: "var(--color-text-secondary)" }}>
          Override the automatic date-based transition. Use this to go live early, extend the invitation window, or manually move guests to the vault.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <Eye className="h-3.5 w-3.5" style={{ color: "var(--color-text-muted)" }} />
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {activeOverride ? `Forced to: ${activeOverride}` : "Running on automatic schedule"}
          </p>
        </div>
      </div>

      {/* Stage buttons */}
      <div className="grid gap-3 sm:grid-cols-3">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const isActive = activeOverride === stage.value;
          return (
            <button
              key={stage.value}
              type="button"
              disabled={loading !== null}
              onClick={() => setStage(isActive ? null : stage.value)}
              className="flex flex-col items-start gap-3 rounded-2xl p-5 text-left transition-all duration-200"
              style={{
                background: isActive ? "var(--color-accent-light)" : "var(--color-surface-soft)",
                border: `1.5px solid ${isActive ? "rgba(184,84,58,0.3)" : "var(--color-border)"}`,
                boxShadow: isActive ? "0 0 0 3px var(--color-accent-muted)" : "none",
                opacity: loading !== null ? 0.6 : 1,
                cursor: loading !== null ? "not-allowed" : "pointer",
              }}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className="h-5 w-5" style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-muted)" }} />
                {isActive && <Badge variant={stage.badge}>Active</Badge>}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{stage.label}</p>
                <p className="mt-1 text-xs leading-5" style={{ color: "var(--color-text-secondary)" }}>{stage.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reset button */}
      <div>
        <Btn
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading !== null || activeOverride === null}
          onClick={() => setStage(null)}
          loading={loading === "reset"}
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Reset to automatic
        </Btn>
      </div>

      {/* Status */}
      {status && (
        <p className="rounded-xl px-4 py-3 text-sm" style={{ background: status.success ? "rgba(107,142,110,0.1)" : "#fef2f2", color: status.success ? "var(--color-sage)" : "#b91c1c", border: `1px solid ${status.success ? "rgba(107,142,110,0.2)" : "#fca5a5"}` }}>
          {status.message}
        </p>
      )}
    </Card>
  );
}

export default LifecycleStageControl;
