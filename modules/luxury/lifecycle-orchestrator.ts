import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { WeddingStageOverrideRow } from "@/lib/types";

export type LifecycleStage = "invitation" | "live" | "vault";

interface ResolveLifecycleStageInput {
  weddingId: string;
  weddingDate: string;
  now?: Date;
}

export interface LifecycleStageResolution {
  stage: LifecycleStage;
  source: "timeline" | "override";
}

const DEFAULT_LIVE_WINDOW_HOURS = 36;

function normalizeStage(value?: string | null): LifecycleStage | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "invite" || normalized === "invitation") {
    return "invitation";
  }

  if (normalized === "live") {
    return "live";
  }

  if (normalized === "vault" || normalized === "family") {
    return "vault";
  }

  return null;
}

function inferStageFromTimeline(weddingDate: string, now = new Date()): LifecycleStageResolution {
  const weddingStart = new Date(`${weddingDate}T00:00:00`);
  const liveStart = new Date(weddingStart.getTime() - 6 * 60 * 60 * 1000);
  const vaultStart = new Date(weddingStart.getTime() + DEFAULT_LIVE_WINDOW_HOURS * 60 * 60 * 1000);

  if (now >= vaultStart) {
    return { stage: "vault", source: "timeline" };
  }

  if (now >= liveStart) {
    return { stage: "live", source: "timeline" };
  }

  return { stage: "invitation", source: "timeline" };
}

function resolveStageFromOverride(
  override: WeddingStageOverrideRow,
  now = new Date()
): LifecycleStage | null {
  if (override.private_mode) {
    return "vault";
  }

  const explicit = normalizeStage(override.stage);
  if (explicit) {
    return explicit;
  }

  if (override.live_starts_at && override.live_ends_at) {
    const startsAt = new Date(override.live_starts_at);
    const endsAt = new Date(override.live_ends_at);

    if (now >= endsAt) {
      return "vault";
    }

    if (now >= startsAt) {
      return "live";
    }
  }

  return null;
}

export async function resolveLifecycleStage({
  weddingId,
  weddingDate,
  now = new Date()
}: ResolveLifecycleStageInput): Promise<LifecycleStageResolution> {
  const client = getConfiguredSupabaseClient(true);

  if (client) {
    // ── Fully typed: no (client as any) cast needed ──────────────────────────
    const { data, error } = await client
      .from("wedding_stage_overrides")
      .select("id, wedding_id, stage, private_mode, live_starts_at, live_ends_at, updated_at")
      .eq("wedding_id", weddingId)
      .maybeSingle();

    if (error) {
      if (!shouldFallbackToDemoData(error)) {
        throw new Error(error.message);
      }
    } else if (data) {
      const overrideStage = resolveStageFromOverride(data as WeddingStageOverrideRow, now);

      if (overrideStage) {
        return { stage: overrideStage, source: "override" };
      }
    }
  }

  return inferStageFromTimeline(weddingDate, now);
}

export function isVaultStage(stage: LifecycleStage) {
  return stage === "vault";
}
