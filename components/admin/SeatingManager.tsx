"use client";

import { type FormEvent, useMemo, useState } from "react";
import { authFetch } from "@/lib/client/token";
import { Plus, Trash2, Users, Search, UserMinus, Loader2, X } from "lucide-react";
import type { GuestTableRow } from "@/components/admin/GuestTable";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface SeatingTable {
  id:         string;
  table_name: string;
  capacity:   number;
  notes:      string | null;
  sort_order: number;
  guests:     string[]; // guest IDs
}

interface SeatingManagerProps {
  initialTables: SeatingTable[];
  guests:        GuestTableRow[];
  weddingId:     string;
}

const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";
const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BG   = "#FAF8F6";
const W    = "#FFFFFF";
const BDR  = "#D0C0BC";

const inp: React.CSSProperties = {
  display: "block", width: "100%", background: W,
  border: `1.5px solid ${BDR}`, borderRadius: 10,
  padding: ".7rem 1rem", color: INK, fontSize: ".9rem",
  fontFamily: BF, outline: "none",
};

// ─────────────────────────────────────────────────────────────────────────────
export function SeatingManager({ initialTables, guests, weddingId }: SeatingManagerProps) {
  const [tables,   setTables]   = useState<SeatingTable[]>(initialTables);
  const [saving,   setSaving]   = useState<string | null>(null);
  const [search,   setSearch]   = useState("");
  const [adding,   setAdding]   = useState(false);
  const [newTable, setNewTable] = useState({ table_name: "", capacity: "8", notes: "" });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [dragGuest, setDragGuest] = useState<string | null>(null);

  function flash(msg: string) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  // ── Guests not yet seated ──────────────────────────────────────────────────
  const assignedGuestIds = new Set(tables.flatMap(t => t.guests));
  const unseatedGuests   = guests.filter(g => !assignedGuestIds.has(g.id));

  // ── Search filter ──────────────────────────────────────────────────────────
  const filteredUnseated = useMemo(() =>
    search.trim()
      ? unseatedGuests.filter(g => `${g.guestName} ${g.familyName ?? ""}`.toLowerCase().includes(search.toLowerCase()))
      : unseatedGuests,
    [unseatedGuests, search]
  );

  function guestById(id: string) { return guests.find(g => g.id === id); }

  // ── Create table ───────────────────────────────────────────────────────────
  async function handleCreateTable(e: FormEvent) {
    e.preventDefault();
    if (!newTable.table_name.trim()) return;
    setSaving("new");
    try {
      const res = await authFetch("/api/admin/seating/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId, tableName: newTable.table_name.trim(), capacity: parseInt(newTable.capacity) || 8, notes: newTable.notes.trim() || null }),
      });
      const data = await res.json() as { success: boolean; data?: SeatingTable };
      if (!res.ok || !data.success || !data.data) throw new Error();
      setTables(prev => [...prev, { ...data.data!, guests: [] }]);
      setNewTable({ table_name: "", capacity: "8", notes: "" });
      setAdding(false);
      flash("Table created ✓");
    } catch { flash("Failed to create table."); }
    finally { setSaving(null); }
  }

  // ── Delete table ───────────────────────────────────────────────────────────
  async function handleDeleteTable(tableId: string, tableName: string) {
    if (!window.confirm(`Delete "${tableName}"? All seating assignments will be removed.`)) return;
    setSaving(tableId);
    try {
      const res = await authFetch(`/api/admin/seating/tables/${tableId}`, { method: "DELETE" });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error();
      setTables(prev => prev.filter(t => t.id !== tableId));
      flash("Table deleted.");
    } catch { flash("Failed to delete table."); }
    finally { setSaving(null); }
  }

  // ── Assign guest to table ──────────────────────────────────────────────────
  async function assignGuest(guestId: string, tableId: string) {
    setSaving(`assign-${guestId}`);
    try {
      const res = await authFetch("/api/admin/seating/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, tableId }),
      });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error();
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, guests: [...t.guests, guestId] } : t));
    } catch { flash("Failed to assign guest."); }
    finally { setSaving(null); }
  }

  // ── Remove guest from table ────────────────────────────────────────────────
  async function removeGuest(guestId: string, tableId: string) {
    setSaving(`remove-${guestId}`);
    try {
      const res = await authFetch(`/api/admin/seating/assignments/${guestId}`, { method: "DELETE" });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error();
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, guests: t.guests.filter(g => g !== guestId) } : t));
    } catch { flash("Failed to remove guest."); }
    finally { setSaving(null); }
  }

  const totalSeated = tables.reduce((acc, t) => acc + t.guests.length, 0);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: ROSE, fontFamily: BF }}>Seating planner</p>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 700, color: INK, marginTop: ".2rem" }}>Table arrangements</h2>
          <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>
            {totalSeated} of {guests.length} guests seated · {unseatedGuests.length} unassigned
          </p>
        </div>
        <button onClick={() => setAdding(a => !a)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 999, background: adding ? BG : ROSE, color: adding ? INK : W, border: `1.5px solid ${adding ? BDR : ROSE}`, fontSize: ".82rem", fontWeight: 700, fontFamily: BF, cursor: "pointer" }}>
          {adding ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add table</>}
        </button>
      </div>

      {/* Add table form */}
      {adding && (
        <form onSubmit={handleCreateTable} style={{ background: BG, border: `1px solid ${BDR}`, borderRadius: 18, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontFamily: DF, fontSize: "1rem", fontWeight: 700, color: INK }}>New table</p>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: ".58rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Table name *</label>
              <input value={newTable.table_name} onChange={e => setNewTable(t => ({ ...t, table_name: e.target.value }))} required placeholder="Table 1 – Bride family" style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".58rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Capacity</label>
              <input type="number" min="1" max="50" value={newTable.capacity} onChange={e => setNewTable(t => ({ ...t, capacity: e.target.value }))} style={inp} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: ".58rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Notes (optional)</label>
            <input value={newTable.notes} onChange={e => setNewTable(t => ({ ...t, notes: e.target.value }))} placeholder="Near the stage, by the entrance…" style={inp} />
          </div>
          <button type="submit" disabled={saving === "new"} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 22px", borderRadius: 999, background: ROSE, color: W, border: "none", fontSize: ".82rem", fontWeight: 700, fontFamily: BF, cursor: "pointer", alignSelf: "flex-start" }}>
            {saving === "new" ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Create table
          </button>
        </form>
      )}

      {statusMsg && (
        <p style={{ padding: "10px 16px", borderRadius: 12, background: "rgba(107,142,110,0.1)", color: "#166534", border: "1px solid rgba(107,142,110,0.3)", fontSize: ".875rem", fontFamily: BF }}>
          {statusMsg}
        </p>
      )}

      {/* Layout: tables + unseated panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>

        {/* Tables */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tables.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", background: BG, borderRadius: 18, border: `1.5px dashed ${BDR}` }}>
              <Users size={32} style={{ color: BDR, margin: "0 auto 1rem" }} />
              <p style={{ fontFamily: DF, fontSize: "1.125rem", color: INK }}>No tables yet.</p>
              <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>Create your first table above.</p>
            </div>
          ) : (
            tables.map(table => {
              const used     = table.guests.length;
              const pct      = Math.min(100, Math.round((used / table.capacity) * 100));
              const isSaving = saving === table.id;
              return (
                <div key={table.id} style={{ background: W, border: `1px solid ${BDR}`, borderRadius: 16, overflow: "hidden" }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => { if (dragGuest) { assignGuest(dragGuest, table.id); setDragGuest(null); } }}
                >
                  {/* Table header */}
                  <div style={{ padding: ".875rem 1.25rem", background: BG, borderBottom: `1px solid ${BDR}`, display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: ".625rem" }}>
                        <p style={{ fontWeight: 700, fontSize: ".9375rem", color: INK, fontFamily: BF }}>{table.table_name}</p>
                        <span style={{ padding: "2px 8px", borderRadius: 999, background: pct >= 100 ? "#fef2f2" : pct >= 75 ? "#FBF5E8" : "rgba(107,142,110,0.1)", border: `1px solid ${pct >= 100 ? "#fca5a5" : pct >= 75 ? "#E8D0A0" : "rgba(107,142,110,0.25)"}`, fontSize: ".65rem", color: pct >= 100 ? "#b91c1c" : pct >= 75 ? "#92400E" : "#166534", fontFamily: BF, fontWeight: 600 }}>
                          {used}/{table.capacity}
                        </span>
                      </div>
                      {table.notes && <p style={{ fontSize: ".75rem", color: INK3, fontFamily: BF, marginTop: ".125rem" }}>{table.notes}</p>}
                      <div style={{ height: 4, background: "#EDE0DC", borderRadius: 999, overflow: "hidden", marginTop: ".5rem", maxWidth: 160 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? ROSE : pct >= 75 ? "#D97706" : "#16A34A", borderRadius: 999 }} />
                      </div>
                    </div>
                    <button onClick={() => handleDeleteTable(table.id, table.table_name)} disabled={isSaving} style={{ padding: 6, borderRadius: 9999, background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", cursor: "pointer", display: "grid", placeItems: "center" }}>
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>

                  {/* Guests in table */}
                  <div style={{ padding: ".75rem 1.25rem", display: "flex", flexWrap: "wrap", gap: ".5rem", minHeight: 56 }}>
                    {table.guests.map(gid => {
                      const g = guestById(gid);
                      if (!g) return null;
                      return (
                        <div key={gid} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 8px", borderRadius: 999, background: BG, border: `1px solid ${BDR}`, fontSize: ".78rem", color: INK, fontFamily: BF }}>
                          <span>{g.guestName}{g.familyName ? ` ${g.familyName}` : ""}</span>
                          <button onClick={() => removeGuest(gid, table.id)} disabled={saving === `remove-${gid}`} style={{ width: 14, height: 14, borderRadius: "50%", background: "#E0D0CC", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: INK3, flexShrink: 0, padding: 0 }}>
                            {saving === `remove-${gid}` ? <Loader2 size={10} /> : <UserMinus size={10} />}
                          </button>
                        </div>
                      );
                    })}
                    {table.guests.length === 0 && (
                      <p style={{ fontSize: ".78rem", color: "#C0A8A0", fontFamily: BF, fontStyle: "italic", padding: ".25rem 0" }}>Drag guests here or click + below</p>
                    )}
                  </div>

                  {/* Quick-add from unseated */}
                  {filteredUnseated.length > 0 && used < table.capacity && (
                    <div style={{ padding: ".5rem 1.25rem .875rem", borderTop: `1px solid #F0E8E4` }}>
                      <select onChange={e => { if (e.target.value) { assignGuest(e.target.value, table.id); e.target.value = ""; } }}
                        style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: `1px solid ${BDR}`, background: W, color: INK3, fontSize: ".8rem", fontFamily: BF, cursor: "pointer" }}>
                        <option value="">+ Add a guest…</option>
                        {filteredUnseated.map(g => (
                          <option key={g.id} value={g.id}>{g.guestName}{g.familyName ? ` ${g.familyName}` : ""}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Unseated guests panel */}
        <div style={{ position: "sticky", top: "1rem", background: W, border: `1px solid ${BDR}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: ".875rem 1rem", borderBottom: `1px solid ${BDR}`, background: BG }}>
            <p style={{ fontWeight: 700, fontSize: ".875rem", color: INK, fontFamily: BF, marginBottom: ".625rem" }}>Unassigned ({unseatedGuests.length})</p>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: INK3 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guests…" style={{ ...inp, paddingLeft: 30, padding: "7px 10px 7px 28px", fontSize: ".82rem" }} />
            </div>
          </div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {filteredUnseated.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>
                  {unseatedGuests.length === 0 ? "All guests are seated! 🎉" : "No matches."}
                </p>
              </div>
            ) : (
              filteredUnseated.map(g => (
                <div key={g.id}
                  draggable
                  onDragStart={() => setDragGuest(g.id)}
                  onDragEnd={() => setDragGuest(null)}
                  style={{ padding: ".75rem 1rem", borderBottom: `1px solid #F0E8E4`, cursor: "grab", background: dragGuest === g.id ? "#FDEAEC" : W, display: "flex", alignItems: "center", gap: ".625rem" }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FDEAEC", border: "1px solid #F5C5CB", display: "grid", placeItems: "center", fontFamily: DF, fontSize: ".8rem", fontWeight: 700, color: ROSE, flexShrink: 0 }}>
                    {(g.guestName[0] ?? "?").toUpperCase()}
                  </div>
                  <p style={{ fontSize: ".875rem", color: INK, fontFamily: BF }}>{g.guestName}{g.familyName ? ` ${g.familyName}` : ""}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SeatingManager;
