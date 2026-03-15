import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { weddingConfig } from "@/lib/config";
import { listGuestLinks } from "@/modules/elegant/guest-links";
import { getAnalyticsSnapshot, getRecentInviteActivity } from "@/modules/premium/analytics";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { FamilyMemberRow } from "@/components/admin/FamilyInviteManager";
import type { GuestMessageRow, WeddingStageOverrideRow } from "@/lib/types";
import type { VendorRow } from "@/components/admin/VendorHub";

export default async function AdminPage() {
  const session = await getSessionFromCookieStore(cookies());

  if (!session || !roleCanAccess(session.role, "/admin")) {
    redirect("/login?redirect=%2Fadmin");
  }

  // Fetch family members for the invite manager
  async function getFamilyMembers(): Promise<FamilyMemberRow[]> {
    const client = getConfiguredSupabaseClient(true);
    if (!client) {
      return [
        { id: "demo-family-user", email: process.env.FAMILY_LOGIN_EMAIL ?? "family@demo.com", role: "family" },
        { id: "demo-admin-user",  email: process.env.ADMIN_LOGIN_EMAIL  ?? "admin@demo.com",  role: "admin"  }
      ];
    }
    const { data, error } = await client
      .from("family_users")
      .select("id, email, role")
      .order("created_at", { ascending: true });
    if (error && !shouldFallbackToDemoData(error)) return [];
    return (data ?? []) as FamilyMemberRow[];
  }

  // Fetch current lifecycle stage override
  async function getLifecycleOverride(): Promise<WeddingStageOverrideRow | null> {
    const client = getConfiguredSupabaseClient(true);
    if (!client) return null;
    const { data, error } = await client
      .from("wedding_stage_overrides")
      .select("*")
      .eq("wedding_id", weddingConfig.id)
      .maybeSingle();
    if (error) return null;
    return (data ?? null) as WeddingStageOverrideRow | null;
  }

  // Fetch vendors for the vendor hub
  async function getVendors(): Promise<VendorRow[]> {
    const client = getConfiguredSupabaseClient(true);
    if (!client) return [];
    const { data, error } = await client
      .from("vendors")
      .select("*")
      .eq("wedding_id", weddingConfig.id)
      .order("arrival_time", { ascending: true, nullsFirst: false });
    if (error) return [];
    return (data ?? []) as VendorRow[];
  }

  // Fetch all guest messages for moderation panel
  async function getGuestMessages(): Promise<GuestMessageRow[]> {
    const client = getConfiguredSupabaseClient(true);
    if (!client) return [];
    const { data, error } = await client
      .from("guest_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as GuestMessageRow[];
  }

  const [stats, guests, recentActivity, familyMembers, lifecycleOverride, guestMessages, vendors] = await Promise.all([
    getAnalyticsSnapshot(weddingConfig.id),
    listGuestLinks(weddingConfig.id),
    getRecentInviteActivity(weddingConfig.id, 8),
    getFamilyMembers(),
    getLifecycleOverride(),
    getGuestMessages(),
    getVendors()
  ]);

  const rows = guests.map((guest) => ({
    id: guest.id,
    guestName: guest.guest_name,
    familyName: guest.family_name,
    phone: guest.phone,
    inviteCode: guest.invite_code,
    inviteLink: guest.inviteLink,
    inviteOpened: guest.invite_opened,
    deviceType: guest.device_type,
    attending: guest.attending,
    guestCount: guest.guestCount,
    city: (guest as typeof guest & { city?: string | null }).city ?? null,
    country: (guest as typeof guest & { country?: string | null }).country ?? null
  }));

  return (
    <div>
      <AdminDashboard
        initialActivity={recentActivity}
        initialFamilyMembers={familyMembers}
        initialRows={rows}
        initialStats={stats}
        guestMessages={guestMessages}
        initialVendors={vendors}
        lifecycleOverride={lifecycleOverride?.stage ?? null}
        weddingId={weddingConfig.id}
      />
    </div>
  );
}
