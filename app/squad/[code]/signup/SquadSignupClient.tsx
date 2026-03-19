"use client";

/**
 * SquadSignupClient — Enhanced
 *
 * Squad member profile form with step progress indicator.
 * Flow: form → submitting → confirmed → vault
 */

import { useRef, useState } from "react";
import type { SquadProposal } from "@/modules/squad/squad-system";

// ── Tokens ──────────────────────────────────────────────────────────────────
const ROSE      = "#BE2D45";
const ROSE_H    = "#A42539";
const ROSE_L    = "#D44860";
const ROSE_PALE = "#FBEBEE";
const ROSE_MID  = "#F0BEC6";
const GOLD      = "#A87808";
const GOLD_L    = "#C9960A";
const GOLD_PALE = "#FBF2DC";
const INK       = "#120B0E";
const INK_2     = "#2E1A1F";
const INK_3     = "#72504A";
const INK_4     = "#A88888";
const CREAM     = "#FDFAF7";
const PAPER     = "#F8F3EE";
const PAPER_2   = "#F1E9E0";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

const ROLE_CFG = {
  bridesmaid: {
    label:           "Bridesmaid",
    sizeLabel:       "Dress size",
    sizePlaceholder: "e.g. UK 10 / M / Bust 34\"",
    accent:          ROSE,
    accentPale:      ROSE_PALE,
    accentBd:        "rgba(190,45,69,.18)",
    gradient:        "linear-gradient(155deg,#1A0308 0%,#2C0910 45%,#1A0308 100%)",
    lightRgb:        "240,190,198",
    partnerName:     "Marion",
  },
  groomsman: {
    label:           "Groomsman",
    sizeLabel:       "Suit / shirt size",
    sizePlaceholder: "e.g. 40 chest / L / 32 waist",
    accent:          GOLD,
    accentPale:      GOLD_PALE,
    accentBd:        "rgba(168,120,8,.18)",
    gradient:        "linear-gradient(155deg,#0D0A00 0%,#1C1500 45%,#0D0A00 100%)",
    lightRgb:        "232,196,80",
    partnerName:     "Livingston",
  },
} as const;

// ── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "About you"   },
  { id: 2, label: "Vault login" },
  { id: 3, label: "Details"     },
];

interface Props {
  proposal:  SquadProposal;
  brideName: string;
  groomName: string;
}

type Stage = "form" | "submitting" | "confirmed";

export function SquadSignupClient({ proposal, brideName, groomName }: Props) {
  const cfg        = ROLE_CFG[proposal.squad_role];
  const firstName  = proposal.name.split(" ")[0]!;
  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;

  // ── Form state ──────────────────────────────────────────────────────────
  const [fullName,       setFullName]       = useState(proposal.profile_full_name       ?? proposal.name);
  const [email,          setEmail]          = useState(proposal.email                   ?? "");
  const [password,       setPassword]       = useState("");
  const [phone,          setPhone]          = useState(proposal.profile_phone            ?? "");
  const [dressSize,      setDressSize]      = useState(proposal.profile_dress_size       ?? "");
  const [emergencyName,  setEmergencyName]  = useState(proposal.profile_emergency_name  ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(proposal.profile_emergency_phone ?? "");
  const [showPass,       setShowPass]       = useState(false);

  // ── Photo ───────────────────────────────────────────────────────────────
  const [photoFile,    setPhotoFile]    = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(proposal.profile_photo_url ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  // ── Active step (visual progress, not a blocker) ─────────────────────────
  const [activeStep, setActiveStep] = useState(1);

  // ── Stage ───────────────────────────────────────────────────────────────
  const [stage,    setStage]    = useState<Stage>(
    proposal.profile_completed_at ? "confirmed" : "form"
  );
  const [error,    setError]    = useState<string | null>(null);
  const [vaultUrl, setVaultUrl] = useState<string | null>(null);

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim() || password.length < 8) return;
    setStage("submitting");
    setError(null);

    try {
      const fd = new FormData();
      fd.append("code",      proposal.proposal_code);
      fd.append("full_name", fullName.trim());
      fd.append("email",     email.trim());
      fd.append("password",  password);
      fd.append("phone",     phone.trim());
      if (dressSize.trim())      fd.append("dress_size",      dressSize.trim());
      if (emergencyName.trim())  fd.append("emergency_name",  emergencyName.trim());
      if (emergencyPhone.trim()) fd.append("emergency_phone", emergencyPhone.trim());
      if (photoFile)             fd.append("photo", photoFile);

      const res  = await fetch("/api/squad/profile", { method: "POST", body: fd });
      const json = (await res.json()) as { success: boolean; redirectTo?: string; message?: string };

      if (!json.success) throw new Error(json.message ?? "Something went wrong.");

      if (json.redirectTo) {
        window.location.href = json.redirectTo;
        return;
      }
      setStage("confirmed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStage("form");
    }
  }

  // ── Shared input style ───────────────────────────────────────────────────
  const inp: React.CSSProperties = {
    display: "block", width: "100%",
    background: PAPER,
    border: `1.5px solid rgba(190,45,69,.14)`,
    borderRadius: 12, padding: "12px 16px",
    color: INK, fontSize: "0.9375rem",
    fontFamily: BF, outline: "none",
    transition: "border-color .18s, box-shadow .18s",
  };

  const lbl: React.CSSProperties = {
    display: "block", fontFamily: BF,
    fontSize: ".52rem", letterSpacing: ".28em",
    textTransform: "uppercase", color: INK_3,
    fontWeight: 700, marginBottom: ".5rem",
  };

  const opt: React.CSSProperties = { fontWeight: 400, color: INK_4 };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes ss-fade    {from{opacity:0}to{opacity:1}}
        @keyframes ss-rise    {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ss-pop     {0%{transform:scale(0) rotate(-15deg);opacity:0}65%{transform:scale(1.15) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes ss-dots    {0%,80%,100%{opacity:.25;transform:scale(.75)}40%{opacity:1;transform:scale(1)}}
        @keyframes ss-confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(90px) rotate(540deg);opacity:0}}
        @keyframes ss-checkIn {0%{stroke-dashoffset:40}100%{stroke-dashoffset:0}}
        @keyframes ss-pulse   {0%,100%{opacity:.6}50%{opacity:1}}

        .ss-0{opacity:0;animation:ss-fade .6s .0s ease forwards}
        .ss-1{opacity:0;animation:ss-rise .8s .1s cubic-bezier(.16,1,.3,1) forwards}
        .ss-2{opacity:0;animation:ss-rise .8s .2s cubic-bezier(.16,1,.3,1) forwards}
        .ss-3{opacity:0;animation:ss-rise .8s .3s cubic-bezier(.16,1,.3,1) forwards}
        .ss-4{opacity:0;animation:ss-rise .8s .4s cubic-bezier(.16,1,.3,1) forwards}
        .ss-5{opacity:0;animation:ss-rise .7s .5s cubic-bezier(.16,1,.3,1) forwards}
        .ss-6{opacity:0;animation:ss-rise .7s .6s cubic-bezier(.16,1,.3,1) forwards}
        .ss-7{opacity:0;animation:ss-rise .7s .7s cubic-bezier(.16,1,.3,1) forwards}

        .ss-inp:focus{border-color:${ROSE} !important;box-shadow:0 0 0 3px rgba(190,45,69,.08)!important}
        .ss-inp::placeholder{color:${INK_4}}

        .ss-photo-zone{
          width:130px;height:130px;border-radius:50%;flex-shrink:0;
          border:2.5px dashed rgba(190,45,69,.25);background:${PAPER};
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;overflow:hidden;position:relative;
          transition:border-color .2s,transform .2s;
        }
        .ss-photo-zone:hover{border-color:${ROSE};transform:scale(1.03)}

        .ss-submit{
          display:flex;align-items:center;justify-content:center;gap:10px;
          width:100%;padding:18px;border-radius:999px;border:none;cursor:pointer;
          font-family:${BF};font-size:.82rem;font-weight:700;
          letter-spacing:.22em;text-transform:uppercase;color:#fff;
          background:linear-gradient(135deg,${ROSE_L} 0%,${ROSE} 52%,${ROSE_H} 100%);
          box-shadow:0 8px 28px rgba(190,45,69,.30),0 2px 8px rgba(190,45,69,.14);
          transition:filter .2s,transform .2s;
        }
        .ss-submit:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-2px)}
        .ss-submit:disabled{opacity:.65;cursor:not-allowed}

        .ss-vault-btn{
          display:flex;align-items:center;justify-content:center;gap:10px;
          width:100%;padding:18px;border-radius:999px;
          font-family:${BF};font-size:.82rem;font-weight:700;
          letter-spacing:.22em;text-transform:uppercase;color:#fff;text-decoration:none;
          background:linear-gradient(135deg,${ROSE_L} 0%,${ROSE} 52%,${ROSE_H} 100%);
          box-shadow:0 8px 28px rgba(190,45,69,.30),0 2px 8px rgba(190,45,69,.14);
          transition:filter .2s,transform .2s;
        }
        .ss-vault-btn:hover{filter:brightness(1.08);transform:translateY(-2px)}

        .ss-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#fff;animation:ss-dots 1.2s ease-in-out infinite}
        .ss-dot:nth-child(2){animation-delay:.2s}
        .ss-dot:nth-child(3){animation-delay:.4s}

        @media(max-width:540px){
          .ss-grid-2{grid-template-columns:1fr !important}
          .ss-photo-row{flex-direction:column;align-items:center}
        }
      `}</style>

      {/* Background */}
      <div style={{
        minHeight: "100dvh", background: CREAM,
        backgroundImage: `
          radial-gradient(ellipse 55% 40% at 8% 12%, rgba(190,45,69,.04) 0%, transparent 55%),
          radial-gradient(ellipse 45% 38% at 92% 90%, rgba(168,120,8,.04) 0%, transparent 50%)
        `,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-start",
        padding: "clamp(2rem,5vh,4rem) clamp(1rem,4vw,2rem)",
        position: "relative",
      }}>
        <div style={{ width: "100%", maxWidth: 580, position: "relative" }}>

          {/* ══════════════════════════════════════════════════════════════
              STAGE: CONFIRMED
          ══════════════════════════════════════════════════════════════ */}
          {stage === "confirmed" && (
            <div style={{ textAlign: "center", paddingTop: "2rem" }}>

              {/* Confetti */}
              <div aria-hidden style={{ position: "relative", height: 80, marginBottom: "-.5rem" }}>
                {[...Array(16)].map((_, i) => (
                  <div key={i} style={{
                    position: "absolute",
                    left: `${15 + (i * 5) % 70}%`, top: 0,
                    width: 7 + (i % 3) * 2, height: 7 + (i % 3) * 2,
                    borderRadius: i % 2 === 0 ? "50%" : "2px",
                    background: i % 3 === 0 ? ROSE : i % 3 === 1 ? GOLD_L : ROSE_MID,
                    animation: `ss-confetti ${1.4 + (i % 4) * .25}s ${i * .08}s ease-in forwards`,
                  }} />
                ))}
              </div>

              {/* Animated checkmark */}
              <div className="ss-0" style={{ marginBottom: "1.75rem" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 88, height: 88, borderRadius: "50%",
                  background: "rgba(107,142,110,.09)",
                  border: "2.5px solid rgba(107,142,110,.30)",
                  animation: "ss-pop .55s .1s cubic-bezier(.34,1.56,.64,1) both",
                }}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
                    <path
                      d="M8 18 L15 25 L28 11"
                      stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      strokeDasharray="40" strokeDashoffset="0"
                      style={{ animation: "ss-checkIn .5s .35s ease both" }}
                    />
                  </svg>
                </div>
              </div>

              <h1 className="ss-1" style={{
                fontFamily: DF, fontWeight: 600,
                fontSize: "clamp(2rem,6vw,2.875rem)",
                color: INK, lineHeight: 1.08, marginBottom: ".75rem",
              }}>
                You&apos;re officially in the squad.
              </h1>

              <p className="ss-2" style={{
                fontFamily: DF, fontStyle: "italic",
                fontSize: "clamp(.95rem,2.2vw,1.1rem)",
                color: INK_2, lineHeight: 1.88,
                maxWidth: 460, margin: "0 auto 2.25rem",
              }}>
                {brideFirst} &amp; {groomFirst} have everything they need from you.
                Your details are saved. Now step into your private vault.
              </p>

              {/* Profile card */}
              <div className="ss-3" style={{
                background: "#FFFFFF",
                border: "1px solid rgba(190,45,69,.09)",
                borderRadius: 20, padding: "1.375rem 1.625rem",
                marginBottom: "2rem", textAlign: "left",
                boxShadow: "0 2px 16px rgba(18,11,14,.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt={fullName}
                      style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2.5px solid rgba(190,45,69,.18)" }} />
                  ) : (
                    <div style={{
                      width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
                      background: ROSE_PALE, border: "2.5px solid rgba(190,45,69,.18)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontFamily: DF, fontSize: "1.4rem", fontWeight: 600, color: ROSE }}>
                        {fullName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: DF, fontSize: "1.2rem", fontWeight: 600, color: INK, lineHeight: 1.1, marginBottom: ".375rem" }}>
                      {fullName}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: ".375rem" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 999,
                        background: cfg.accentPale, border: `1px solid ${cfg.accentBd}`,
                        fontFamily: BF, fontSize: ".54rem", fontWeight: 700,
                        letterSpacing: ".16em", textTransform: "uppercase", color: cfg.accent,
                      }}>
                        {cfg.label}
                      </span>
                      {phone && (
                        <span style={{ padding: "3px 10px", borderRadius: 999, background: PAPER, border: "1px solid rgba(18,11,14,.08)", fontFamily: BF, fontSize: ".62rem", color: INK_3 }}>
                          {phone}
                        </span>
                      )}
                      {dressSize && (
                        <span style={{ padding: "3px 10px", borderRadius: 999, background: PAPER, border: "1px solid rgba(18,11,14,.08)", fontFamily: BF, fontSize: ".62rem", color: INK_3 }}>
                          Size: {dressSize}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vault CTA */}
              <div className="ss-4">
                {vaultUrl ? (
                  <>
                    <p style={{
                      fontFamily: DF, fontStyle: "italic",
                      fontSize: "clamp(.88rem,2vw,.98rem)",
                      color: INK_3, lineHeight: 1.72, marginBottom: "1.25rem",
                    }}>
                      Your private vault is ready — your Squad Hub, day timeline,
                      and everything {brideFirst} &amp; {groomFirst} have prepared for you.
                    </p>
                    <a href={vaultUrl} className="ss-vault-btn">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="rgba(255,255,255,.9)" strokeWidth="1.8" fill="rgba(255,255,255,.12)" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="rgba(255,255,255,.9)" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      Enter your private vault
                    </a>
                  </>
                ) : (
                  <div style={{
                    padding: "1rem 1.25rem", borderRadius: 14,
                    background: "rgba(168,120,8,.06)", border: "1px solid rgba(168,120,8,.18)",
                    textAlign: "left",
                  }}>
                    <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".9rem", color: INK_2, lineHeight: 1.65 }}>
                      {cfg.partnerName} will send your vault access link shortly.
                    </p>
                  </div>
                )}
              </div>

              <p className="ss-5" style={{ marginTop: "1.75rem" }}>
                <button type="button" onClick={() => setStage("form")}
                  style={{ fontFamily: BF, fontSize: ".65rem", letterSpacing: ".16em", textTransform: "uppercase", color: INK_4, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  Update my details
                </button>
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STAGE: FORM / SUBMITTING
          ══════════════════════════════════════════════════════════════ */}
          {(stage === "form" || stage === "submitting") && (
            <>
              {/* ── Page header ── */}
              <div className="ss-0" style={{ marginBottom: "clamp(1.5rem,3.5vh,2.25rem)" }}>

                {/* Couple byline */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to right,transparent,rgba(190,45,69,.25))` }} />
                  <span style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".52em", textTransform: "uppercase", color: ROSE, fontWeight: 700 }}>
                    {brideFirst} &amp; {groomFirst}
                  </span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to left,transparent,rgba(190,45,69,.25))` }} />
                </div>

                {/* Role badge */}
                <div style={{ marginBottom: ".75rem" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 16px", borderRadius: 999,
                    background: cfg.accentPale, border: `1px solid ${cfg.accentBd}`,
                    fontFamily: BF, fontSize: ".60rem", fontWeight: 700,
                    letterSpacing: ".18em", textTransform: "uppercase", color: cfg.accent,
                  }}>
                    ✦ {cfg.label}
                  </span>
                </div>

                <h1 style={{
                  fontFamily: DF, fontWeight: 600,
                  fontSize: "clamp(1.6rem,4.5vw,2.25rem)",
                  color: INK, lineHeight: 1.1, letterSpacing: "-.01em",
                  marginBottom: ".5rem",
                }}>
                  Your welcome kit
                </h1>
                <p style={{
                  fontFamily: DF, fontStyle: "italic",
                  fontSize: "clamp(.88rem,2vw,.98rem)",
                  color: INK_3, lineHeight: 1.78,
                }}>
                  A few details for {brideFirst} &amp; {groomFirst} — takes two minutes,
                  and unlocks your private vault.
                </p>
              </div>

              {/* ── Step progress bar ── */}
              <div className="ss-1" style={{
                display: "flex", alignItems: "center",
                marginBottom: "clamp(1.5rem,3vh,2rem)",
              }}>
                {STEPS.map((step, i) => {
                  const done   = activeStep > step.id;
                  const active = activeStep === step.id;
                  return (
                    <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                      <button
                        type="button"
                        onClick={() => setActiveStep(step.id)}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center",
                          gap: ".35rem", background: "none", border: "none", cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: done ? ROSE : active ? ROSE_PALE : "transparent",
                          border: `2px solid ${done || active ? ROSE : "rgba(190,45,69,.22)"}`,
                          transition: "all .2s",
                          flexShrink: 0,
                        }}>
                          {done ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <span style={{
                              fontFamily: BF, fontSize: ".65rem", fontWeight: 700,
                              color: active ? ROSE : INK_4,
                            }}>
                              {step.id}
                            </span>
                          )}
                        </div>
                        <span style={{
                          fontFamily: BF, fontSize: ".48rem", letterSpacing: ".20em",
                          textTransform: "uppercase", fontWeight: 600,
                          color: active ? ROSE : done ? ROSE : INK_4,
                          whiteSpace: "nowrap",
                        }}>
                          {step.label}
                        </span>
                      </button>
                      {i < STEPS.length - 1 && (
                        <div style={{
                          flex: 1, height: 2, margin: "0 .5rem", marginBottom: "1.25rem",
                          background: activeStep > step.id
                            ? `linear-gradient(to right,${ROSE},${ROSE_MID})`
                            : "rgba(190,45,69,.14)",
                          borderRadius: 999, transition: "background .3s",
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Form card ── */}
              <form onSubmit={handleSubmit} style={{
                background: "#FFFFFF",
                borderRadius: 22, overflow: "hidden",
                boxShadow: "0 1px 3px rgba(18,11,14,.04),0 4px 16px rgba(18,11,14,.07),0 24px 56px rgba(18,11,14,.09)",
                border: "1px solid rgba(190,45,69,.07)",
              }}>

                {/* Dark header */}
                <div style={{
                  background: cfg.gradient,
                  padding: "clamp(1.25rem,3.5vw,1.875rem) clamp(1.5rem,4vw,2.25rem)",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${cfg.accent} 30%,${cfg.accent} 70%,transparent)` }} />
                  <p style={{ fontFamily: BF, fontSize: ".50rem", letterSpacing: ".38em", textTransform: "uppercase", color: `rgba(${cfg.lightRgb},.62)`, fontWeight: 700, marginBottom: ".35rem" }}>
                    Your details
                  </p>
                  <p style={{ fontFamily: DF, fontStyle: "italic", fontWeight: 300, fontSize: "clamp(1.05rem,2.8vw,1.35rem)", color: "rgba(255,252,248,.88)", lineHeight: 1.25 }}>
                    Tell us a little about yourself, {firstName}.
                  </p>
                </div>

                <div style={{ padding: "clamp(1.5rem,4vw,2.25rem)", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

                  {/* ─ STEP 1: About you ─ */}
                  <section>
                    <div style={{
                      display: "flex", alignItems: "center", gap: ".75rem",
                      marginBottom: "1.25rem", paddingBottom: ".875rem",
                      borderBottom: `1px solid ${PAPER_2}`,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: ROSE_PALE, border: `1.5px solid rgba(190,45,69,.22)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{ fontFamily: BF, fontSize: ".62rem", fontWeight: 700, color: ROSE }}>1</span>
                      </div>
                      <p style={{ fontFamily: BF, fontSize: ".56rem", letterSpacing: ".26em", textTransform: "uppercase", color: ROSE, fontWeight: 700 }}>
                        About you
                      </p>
                    </div>

                    {/* Photo + name row */}
                    <div className="ss-2 ss-photo-row" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.25rem" }}>
                      <div
                        className="ss-photo-zone"
                        onClick={() => fileRef.current?.click()}
                        role="button" tabIndex={0}
                        onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
                        aria-label="Upload your photo"
                      >
                        {photoPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ textAlign: "center", padding: ".875rem" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(190,45,69,.40)" strokeWidth="1.5" strokeLinecap="round" aria-hidden style={{ marginBottom: ".5rem" }}>
                              <circle cx="12" cy="8" r="4" />
                              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                            <p style={{ fontFamily: BF, fontSize: ".50rem", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(190,45,69,.45)", fontWeight: 600, lineHeight: 1.4 }}>
                              Add<br />photo
                            </p>
                          </div>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />

                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: DF, fontSize: ".975rem", fontWeight: 600, color: INK, marginBottom: ".25rem" }}>
                          Your headshot
                        </p>
                        <p style={{ fontFamily: BF, fontSize: ".74rem", color: INK_4, lineHeight: 1.6, marginBottom: ".5rem" }}>
                          Optional · helps with seating cards &amp; memories
                        </p>
                        {photoFile ? (
                          <button type="button"
                            onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                            style={{ fontFamily: BF, fontSize: ".58rem", letterSpacing: ".14em", textTransform: "uppercase", color: ROSE, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                            Remove photo
                          </button>
                        ) : (
                          <button type="button"
                            onClick={() => fileRef.current?.click()}
                            style={{ fontFamily: BF, fontSize: ".58rem", letterSpacing: ".14em", textTransform: "uppercase", color: cfg.accent, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                            Browse files →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Name + phone */}
                    <div className="ss-3 ss-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={lbl}>Full name <span style={{ color: ROSE }}>*</span></label>
                        <input className="ss-inp" style={inp} value={fullName}
                          onChange={e => { setFullName(e.target.value); setActiveStep(Math.max(activeStep, 1)); }}
                          placeholder={proposal.name} required />
                      </div>
                      <div>
                        <label style={lbl}>Phone <span style={{ color: ROSE }}>*</span></label>
                        <input className="ss-inp" style={inp} type="tel" value={phone}
                          onChange={e => { setPhone(e.target.value); setActiveStep(Math.max(activeStep, 1)); }}
                          placeholder="+91 98765 43210" required />
                      </div>
                    </div>
                  </section>

                  {/* ─ STEP 2: Vault login ─ */}
                  <section>
                    <div style={{
                      display: "flex", alignItems: "center", gap: ".75rem",
                      marginBottom: "1.25rem", paddingBottom: ".875rem",
                      borderBottom: `1px solid ${PAPER_2}`,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: activeStep >= 2 ? ROSE_PALE : "transparent",
                        border: `1.5px solid ${activeStep >= 2 ? "rgba(190,45,69,.22)" : "rgba(190,45,69,.14)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        transition: "all .2s",
                      }}>
                        <span style={{ fontFamily: BF, fontSize: ".62rem", fontWeight: 700, color: activeStep >= 2 ? ROSE : INK_4 }}>2</span>
                      </div>
                      <p style={{ fontFamily: BF, fontSize: ".56rem", letterSpacing: ".26em", textTransform: "uppercase", color: activeStep >= 2 ? ROSE : INK_4, fontWeight: 700, transition: "color .2s" }}>
                        Vault login
                      </p>
                    </div>

                    <div style={{
                      padding: ".875rem 1rem", borderRadius: 12, marginBottom: "1rem",
                      background: "rgba(190,45,69,.04)", border: "1px solid rgba(190,45,69,.10)",
                    }}>
                      <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".88rem", color: INK_3, lineHeight: 1.62, margin: 0 }}>
                        Create an email and password to access the private vault any time after today.
                      </p>
                    </div>

                    <div className="ss-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={lbl}>Email <span style={{ color: ROSE }}>*</span></label>
                        <input className="ss-inp" style={inp} type="email" value={email}
                          onChange={e => { setEmail(e.target.value); setActiveStep(Math.max(activeStep, 2)); }}
                          placeholder="your@email.com" autoComplete="email" required />
                      </div>
                      <div>
                        <label style={lbl}>Password <span style={{ color: ROSE }}>*</span></label>
                        <div style={{ position: "relative" }}>
                          <input className="ss-inp" style={{ ...inp, paddingRight: 44 }}
                            type={showPass ? "text" : "password"} value={password}
                            onChange={e => { setPassword(e.target.value); setActiveStep(Math.max(activeStep, 2)); }}
                            placeholder="Min. 8 characters"
                            autoComplete="new-password" minLength={8} required />
                          <button type="button" onClick={() => setShowPass(s => !s)}
                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: INK_4, padding: 0, lineHeight: 1 }}
                            aria-label={showPass ? "Hide" : "Show"}>
                            {showPass ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {password.length > 0 && password.length < 8 && (
                          <p style={{ fontFamily: BF, fontSize: ".58rem", color: ROSE, marginTop: ".35rem" }}>
                            {8 - password.length} more character{8 - password.length !== 1 ? "s" : ""} needed
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* ─ STEP 3: Details ─ */}
                  <section>
                    <div style={{
                      display: "flex", alignItems: "center", gap: ".75rem",
                      marginBottom: "1.25rem", paddingBottom: ".875rem",
                      borderBottom: `1px solid ${PAPER_2}`,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: activeStep >= 3 ? ROSE_PALE : "transparent",
                        border: `1.5px solid ${activeStep >= 3 ? "rgba(190,45,69,.22)" : "rgba(190,45,69,.14)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        transition: "all .2s",
                      }}>
                        <span style={{ fontFamily: BF, fontSize: ".62rem", fontWeight: 700, color: activeStep >= 3 ? ROSE : INK_4 }}>3</span>
                      </div>
                      <div>
                        <p style={{ fontFamily: BF, fontSize: ".56rem", letterSpacing: ".26em", textTransform: "uppercase", color: activeStep >= 3 ? ROSE : INK_4, fontWeight: 700, transition: "color .2s", marginBottom: ".15rem" }}>
                          Day details
                        </p>
                        <p style={{ fontFamily: BF, fontSize: ".50rem", color: INK_4 }}>Optional — helpful for the couple</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div>
                        <label style={lbl}>{cfg.sizeLabel} <span style={opt}>(optional)</span></label>
                        <input className="ss-inp" style={inp} value={dressSize}
                          onChange={e => { setDressSize(e.target.value); setActiveStep(Math.max(activeStep, 3)); }}
                          placeholder={cfg.sizePlaceholder} />
                        <p style={{ fontFamily: BF, fontSize: ".60rem", color: INK_4, marginTop: ".35rem" }}>
                          Helps the couple coordinate outfits for the day.
                        </p>
                      </div>

                      <div>
                        <label style={{ ...lbl, marginBottom: ".75rem" }}>
                          Emergency contact <span style={opt}>(optional)</span>
                        </label>
                        <div className="ss-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          <input className="ss-inp" style={inp} value={emergencyName}
                            onChange={e => setEmergencyName(e.target.value)}
                            placeholder="Contact name" />
                          <input className="ss-inp" style={inp} type="tel" value={emergencyPhone}
                            onChange={e => setEmergencyPhone(e.target.value)}
                            placeholder="Their phone number" />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ── Privacy note ── */}
                  <div style={{
                    padding: ".875rem 1.125rem", borderRadius: 12,
                    background: PAPER_2, border: `1px solid rgba(190,45,69,.09)`,
                  }}>
                    <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".88rem", color: INK_3, lineHeight: 1.65, margin: 0 }}>
                      🔒 Everything you share here is private — only {brideFirst} &amp; {groomFirst} can see it. Never shared with other guests.
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <p style={{ padding: "10px 16px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: ".82rem", fontFamily: BF }}>
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <button type="submit" className="ss-submit"
                    disabled={stage === "submitting" || !fullName.trim() || !phone.trim() || !email.trim() || password.length < 8}>
                    {stage === "submitting" ? (
                      <>Saving<span className="ss-dot" /><span className="ss-dot" /><span className="ss-dot" /></>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <rect x="3" y="11" width="18" height="11" rx="2" stroke="rgba(255,255,255,.9)" strokeWidth="1.8" fill="rgba(255,255,255,.12)" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="rgba(255,255,255,.9)" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        Save &amp; unlock my vault
                      </>
                    )}
                  </button>

                  {/* Previously saved note */}
                  {proposal.profile_completed_at && stage === "form" && (
                    <p style={{ textAlign: "center", fontFamily: BF, fontSize: ".68rem", color: INK_4 }}>
                      Last saved {new Date(proposal.profile_completed_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
                    </p>
                  )}

                </div>

                {/* Bottom stripe */}
                <div style={{ height: 3, background: `linear-gradient(90deg,transparent,rgba(190,45,69,.40) 30%,rgba(201,150,10,.50) 50%,rgba(190,45,69,.40) 70%,transparent)` }} />
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
