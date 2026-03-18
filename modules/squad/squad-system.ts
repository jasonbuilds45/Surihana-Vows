/**
 * modules/squad/squad-system.ts
 *
 * Data layer for the Squad Proposal system.
 * All DB access goes through the service-role Supabase client.
 * Falls back gracefully to demo data when Supabase is not configured.
 */

import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { weddingConfig } from "@/lib/config";

export type SquadRole = "bridesmaid" | "groomsman";

export interface SquadProposal {
  id:                    string;
  wedding_id:            string;
  name:                  string;
  email:                 string | null;
  squad_role:            SquadRole;
  personal_note:         string;
  proposal_code:         string;
  accepted:              boolean | null;
  accepted_at:           string | null;
  response_note:         string | null;
  created_at:            string;
  opened_at:             string | null;
  // Profile fields — filled in by the squad member after accepting
  profile_full_name:      string | null;
  profile_phone:          string | null;
  profile_photo_url:      string | null;
  profile_dress_size:     string | null;
  profile_dietary:        string | null;
  profile_emergency_name: string | null;
  profile_emergency_phone:string | null;
  profile_completed_at:   string | null;
}

const WEDDING_ID = weddingConfig.id;

// ── Demo data (shown when Supabase is not configured) ─────────────────────────
const NULL_PROFILE = {
  profile_full_name:       null as string | null,
  profile_phone:           null as string | null,
  profile_photo_url:       null as string | null,
  profile_dress_size:      null as string | null,
  profile_dietary:         null as string | null,
  profile_emergency_name:  null as string | null,
  profile_emergency_phone: null as string | null,
  profile_completed_at:    null as string | null,
};

const DEMO_PROPOSALS: SquadProposal[] = [
  {
    id: "demo-sq-1",
    wedding_id: WEDDING_ID,
    name: "Sarah",
    email: "sarah@demo.com",
    squad_role: "bridesmaid",
    personal_note: "You have been my closest friend through every season of life. I cannot imagine standing at the altar without you beside me.",
    proposal_code: "demo-bridesmaid-sarah",
    accepted: null,
    accepted_at: null,
    response_note: null,
    created_at: new Date().toISOString(),
    opened_at: null,
    ...NULL_PROFILE,
  },
  {
    id: "demo-sq-2",
    wedding_id: WEDDING_ID,
    name: "Rajan",
    email: "rajan@demo.com",
    squad_role: "groomsman",
    personal_note: "You have been my brother in every sense of the word. Stand with me on the most important day of my life.",
    proposal_code: "demo-groomsman-rajan",
    accepted: true,
    accepted_at: new Date().toISOString(),
    response_note: "I would be honoured!",
    created_at: new Date().toISOString(),
    opened_at: new Date().toISOString(),
    ...NULL_PROFILE,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Generate a URL-safe proposal code */
export function generateProposalCode(name: string, role: SquadRole): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  const rand = Math.random().toString(36).slice(2, 8);
  return `${role.slice(0, 2)}-${slug}-${rand}`;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getAllSquadProposals(): Promise<SquadProposal[]> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return DEMO_PROPOSALS;

  const { data, error } = await client
    .from("squad_proposals")
    .select("*")
    .eq("wedding_id", WEDDING_ID)
    .order("created_at", { ascending: false });

  if (error) {
    if (shouldFallbackToDemoData(error)) return DEMO_PROPOSALS;
    throw new Error(error.message);
  }
  return (data ?? []) as SquadProposal[];
}

export async function getProposalByCode(code: string): Promise<SquadProposal | null> {
  const client = getConfiguredSupabaseClient(true);

  if (!client) {
    return DEMO_PROPOSALS.find(p => p.proposal_code === code) ?? null;
  }

  const { data, error } = await client
    .from("squad_proposals")
    .select("*")
    .eq("proposal_code", code)
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) return null;
    throw new Error(error.message);
  }
  return (data ?? null) as SquadProposal | null;
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function createSquadProposal(
  input: Pick<SquadProposal, "name" | "email" | "squad_role" | "personal_note">
): Promise<SquadProposal> {
  const proposal_code = generateProposalCode(input.name, input.squad_role);

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    // Demo mode — return a fake row
    return {
      id: `demo-${Date.now()}`,
      wedding_id: WEDDING_ID,
      ...input,
      proposal_code,
      accepted: null,
      accepted_at: null,
      response_note: null,
      created_at: new Date().toISOString(),
      opened_at: null,
      ...NULL_PROFILE,
    };
  }

  const { data, error } = await client
    .from("squad_proposals")
    .insert({
      id: crypto.randomUUID(),
      wedding_id: WEDDING_ID,
      name: input.name,
      email: input.email ?? null,
      squad_role: input.squad_role,
      personal_note: input.personal_note,
      proposal_code,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as SquadProposal;
}

export async function markProposalOpened(code: string): Promise<void> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return;

  await client
    .from("squad_proposals")
    .update({ opened_at: new Date().toISOString() })
    .eq("proposal_code", code)
    .is("opened_at", null); // only set once
}

export async function acceptProposal(
  code: string,
  responseNote?: string
): Promise<{ success: boolean; message: string }> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return { success: true, message: "Accepted (demo mode)." };
  }

  const { error } = await client
    .from("squad_proposals")
    .update({
      accepted: true,
      accepted_at: new Date().toISOString(),
      response_note: responseNote ?? null,
    })
    .eq("proposal_code", code);

  if (error) return { success: false, message: error.message };
  return { success: true, message: "Accepted." };
}

export async function declineProposal(
  code: string
): Promise<{ success: boolean; message: string }> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return { success: true, message: "Declined (demo mode)." };

  const { error } = await client
    .from("squad_proposals")
    .update({ accepted: false, accepted_at: new Date().toISOString() })
    .eq("proposal_code", code);

  if (error) return { success: false, message: error.message };
  return { success: true, message: "Declined." };
}

export async function deleteSquadProposal(id: string): Promise<void> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return;

  const { error } = await client
    .from("squad_proposals")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export interface SquadProfileInput {
  full_name:       string;
  phone:           string;
  photo_url?:      string | null;
  dress_size?:     string | null;
  dietary?:        string | null;
  emergency_name?: string | null;
  emergency_phone?:string | null;
}

export async function saveSquadProfile(
  code: string,
  profile: SquadProfileInput
): Promise<{ success: boolean; message: string }> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return { success: true, message: "Saved (demo mode)." };

  const { error } = await client
    .from("squad_proposals")
    .update({
      profile_full_name:       profile.full_name,
      profile_phone:           profile.phone,
      profile_photo_url:       profile.photo_url       ?? null,
      profile_dress_size:      profile.dress_size      ?? null,
      profile_dietary:         profile.dietary         ?? null,
      profile_emergency_name:  profile.emergency_name  ?? null,
      profile_emergency_phone: profile.emergency_phone ?? null,
      profile_completed_at:    new Date().toISOString(),
    })
    .eq("proposal_code", code);

  if (error) return { success: false, message: error.message };
  return { success: true, message: "Profile saved." };
}
