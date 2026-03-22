"use client";

/**
 * SnapClient — Luxury guest photo upload for Marion & Livingston's wedding
 *
 * Design direction: Warm ceremony programme × luxury editorial
 * — Deep maroon hero, Cormorant Garamond display, intimate copy
 * — Full-bleed layout, not a form — feels like picking up a camera at a wedding
 * — Every state (idle / uploading / success / error) is emotionally designed
 * — Mobile-first: real camera tap UX, name persisted in localStorage
 * — Zero login, zero submit button — one tap = instant upload
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface SnapClientProps {
  weddingId:   string;
  brideName:   string;
  groomName:   string;
  weddingDate: string;
}

type Phase =
  | { id: "idle" }
  | { id: "uploading"; preview: string; progress: number }
  | { id: "success";   preview: string }
  | { id: "error";     message: string };

// ── Tokens ────────────────────────────────────────────────────────────────────
const DF    = "'Cormorant Garamond',Georgia,serif";
const BF    = "'Manrope',system-ui,sans-serif";
const ROSE  = "#BE2D45";
const ROSEL = "#D44860";
const GOLD  = "#9A6C06";
const INK   = "#1A0D0A";
const CREAM = "#F0E4D4";
const WARM  = "#FAF6F0";

export function SnapClient({ weddingId, brideName, groomName, weddingDate }: SnapClientProps) {
  const bf   = brideName.split(" ")[0]!;
  const gf   = groomName.split(" ")[0]!;
  const date = new Date(weddingDate).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const days    = Math.max(0, Math.floor((new Date(weddingDate).getTime() - Date.now()) / 86_400_000));
  const isToday = days === 0;

  const [name,    setName]    = useState("");
  const [editing, setEditing] = useState(false);
  const [phase,   setPhase]   = useState<Phase>({ id: "idle" });
  const [count,   setCount]   = useState(0);
  const [entered, setEntered] = useState(false);

  const fileRef  = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      const s = localStorage.getItem("snap_name_mj_ls");
      if (s) setName(s);
    } catch { /**/ }
  }, []);

  function saveName(n: string) {
    setName(n);
    try { localStorage.setItem("snap_name_mj_ls", n); } catch { /**/ }
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  const upload = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file);
    setPhase({ id: "uploading", preview, progress: 0 });

    let p = 0;
    const ticker = setInterval(() => {
      p = Math.min(p + Math.random() * 18 + 4, 90);
      setPhase(s => s.id === "uploading" ? { ...s, progress: Math.round(p) } : s);
    }, 320);

    try {
      const fd = new FormData();
      fd.append("file",       file);
      fd.append("uploadedBy", name.trim() || "A guest");
      fd.append("category",   "snap");
      fd.append("weddingId",  weddingId);

      const res  = await fetch("/api/upload-photo", { method: "POST", body: fd });
      const data = await res.json() as { success: boolean; message: string };

      clearInterval(ticker);
      if (data.success) {
        setPhase({ id: "success", preview });
        setCount(c => c + 1);
      } else {
        URL.revokeObjectURL(preview);
        setPhase({ id: "error", message: data.message });
      }
    } catch {
      clearInterval(ticker);
      URL.revokeObjectURL(preview);
      setPhase({ id: "error", message: "Something went wrong. Please try again." });
    }
  }, [name, weddingId]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) void upload(f);
  }

  function snap() {
    if (phase.id === "uploading") return;
    fileRef.current?.click();
  }

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: BF, background: WARM, minHeight: "100dvh", overflowX: "hidden" }}>

      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        style={{ display:"none" }} onChange={onFile} />

      {/* ═══════════════════════════════════════════════════════
          HERO — deep maroon, full-bleed
      ═══════════════════════════════════════════════════════ */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(158deg,#7E1628 0%,${ROSE} 50%,#640F1E 100%)`,
        paddingBottom: "3rem",
      }}>
        {/* Ambient depth blooms */}
        <div aria-hidden style={{
          position:"absolute",inset:0,pointerEvents:"none",
          background:`
            radial-gradient(ellipse 60% 70% at 92% 8%,  rgba(255,255,255,.10) 0%,transparent 55%),
            radial-gradient(ellipse 45% 55% at 4%  92%, rgba(0,0,0,.22)       0%,transparent 50%),
            radial-gradient(ellipse 35% 45% at 50% 50%, rgba(255,140,120,.04) 0%,transparent 60%)
          `,
        }}/>
        {/* Gold top hairline */}
        <div aria-hidden style={{
          position:"absolute",top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,transparent 4%,rgba(154,108,6,.55) 28%,rgba(212,172,50,.88) 50%,rgba(154,108,6,.55) 72%,transparent 96%)`,
        }}/>
        {/* Grain */}
        <div aria-hidden style={{
          position:"absolute",inset:0,opacity:.18,pointerEvents:"none",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E")`,
        }}/>

        {/* Hero content */}
        <div style={{
          maxWidth: 540, margin: "0 auto",
          padding: "clamp(2.5rem,8vw,4.5rem) clamp(1.5rem,6vw,2.5rem) 0",
          position: "relative", zIndex: 1,
        }}>

          {/* Celebration label */}
          <div style={{
            display:"flex",alignItems:"center",gap:10,
            marginBottom:"1.5rem",
            opacity: entered ? 1 : 0,
            transform: entered ? "none" : "translateY(14px)",
            transition:"opacity .7s .05s ease,transform .7s .05s cubic-bezier(.16,1,.3,1)",
          }}>
            <div style={{width:20,height:1,background:"rgba(255,255,255,.40)"}}/>
            <span style={{
              fontFamily:BF,fontSize:".44rem",letterSpacing:".46em",
              textTransform:"uppercase",color:"rgba(255,255,255,.65)",fontWeight:700,
            }}>
              {isToday ? "The wedding day · Today" : `${days} days away · ${date}`}
            </span>
          </div>

          {/* Names — the hero centrepiece */}
          <div style={{
            marginBottom:"1.75rem",
            opacity: entered ? 1 : 0,
            transform: entered ? "none" : "translateY(24px)",
            transition:"opacity .88s .14s ease,transform .88s .14s cubic-bezier(.16,1,.3,1)",
          }}>
            <h1 style={{
              fontFamily:DF,fontWeight:300,margin:0,
              fontSize:"clamp(3.2rem,13vw,7rem)",
              lineHeight:.86,letterSpacing:"-.03em",
              color:"#FFFFFF",
            }}>{bf}</h1>
            <h1 style={{
              fontFamily:DF,fontWeight:300,fontStyle:"italic",margin:"0 0 1.25rem",
              fontSize:"clamp(3.2rem,13vw,7rem)",
              lineHeight:.86,letterSpacing:"-.03em",
              color:"rgba(255,255,255,.75)",
            }}>&amp; {gf}.</h1>

            {/* Gold hairline under names */}
            <div style={{
              width:"min(72px,18%)",height:1,
              background:`linear-gradient(to right,rgba(212,172,50,.75),transparent)`,
            }}/>
          </div>

          {/* Tagline */}
          <p style={{
            fontFamily:DF,fontStyle:"italic",
            fontSize:"clamp(.95rem,2.8vw,1.15rem)",
            color:"rgba(255,255,255,.62)",lineHeight:1.75,
            maxWidth:"30rem",margin:"0 0 1.75rem",
            opacity: entered ? 1 : 0,
            transform: entered ? "none" : "translateY(16px)",
            transition:"opacity .8s .26s ease,transform .8s .26s cubic-bezier(.16,1,.3,1)",
          }}>
            {isToday
              ? "You're at the wedding. Every photo you take is a gift they didn't know to ask for — the real, unguarded moments that no photographer catches."
              : `Every photo you share becomes part of ${bf} & ${gf}'s forever album. The ones taken by the people who love them most.`}
          </p>

          {/* Session count pill */}
          {count > 0 && (
            <div style={{
              display:"inline-flex",alignItems:"center",gap:8,
              padding:"6px 16px",borderRadius:999,
              background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.22)",
              backdropFilter:"blur(8px)",marginBottom:"1.5rem",
            }}>
              <span style={{fontFamily:BF,fontSize:".50rem",fontWeight:700,letterSpacing:".18em",color:"rgba(255,255,255,.82)"}}>
                ✦ {count} {count === 1 ? "photo" : "photos"} shared this session
              </span>
            </div>
          )}
        </div>

        {/* Curved bottom edge into warm background */}
        <div aria-hidden style={{
          position:"absolute",bottom:-1,left:0,right:0,height:40,
          background:WARM,
          clipPath:"ellipse(55% 100% at 50% 100%)",
        }}/>
      </div>

      {/* ═══════════════════════════════════════════════════════
          BODY
      ═══════════════════════════════════════════════════════ */}
      <div style={{
        maxWidth: 480, margin: "0 auto",
        padding: "2rem clamp(1.25rem,5vw,2rem) 4rem",
        display:"flex",flexDirection:"column",gap:"1.25rem",
      }}>

        {/* ── NAME CARD ── */}
        <div style={{
          background:"#fff",borderRadius:20,
          border:`1px solid ${CREAM}`,
          overflow:"hidden",
          boxShadow:"0 2px 18px rgba(26,13,10,.06)",
          opacity: entered ? 1 : 0,
          transform: entered ? "none" : "translateY(16px)",
          transition:"opacity .7s .36s ease,transform .7s .36s cubic-bezier(.16,1,.3,1)",
        }}>
          <div style={{height:2,background:`linear-gradient(90deg,${ROSE},${ROSEL},transparent)`}}/>
          <div style={{padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:".875rem"}}>
            <div style={{
              width:40,height:40,borderRadius:12,flexShrink:0,
              background:"rgba(190,45,69,.08)",border:"1px solid rgba(190,45,69,.16)",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke={ROSE} strokeWidth="1.8" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontFamily:BF,fontSize:".50rem",letterSpacing:".28em",
                textTransform:"uppercase",color:"rgba(26,13,10,.38)",
                fontWeight:600,marginBottom:".2rem"}}>Your name</p>
              {editing ? (
                <input ref={inputRef} type="text" value={name} maxLength={40} autoFocus
                  placeholder="How should we credit your photo?"
                  onChange={e => setName(e.target.value)}
                  onBlur={() => { setEditing(false); saveName(name); }}
                  onKeyDown={e => { if (e.key === "Enter") { setEditing(false); saveName(name); } }}
                  style={{width:"100%",border:"none",outline:"none",padding:0,
                    fontFamily:BF,fontSize:"1rem",color:INK,
                    background:"transparent",caretColor:ROSE}}/>
              ) : (
                <button type="button" onClick={() => setEditing(true)} style={{
                  background:"none",border:"none",cursor:"text",
                  textAlign:"left",padding:0,width:"100%",
                  fontFamily:BF,fontSize:"1rem",
                  color: name ? INK : "rgba(26,13,10,.30)"}}>
                  {name || "Optional — tap to add your name"}
                </button>
              )}
            </div>
            {name && !editing && (
              <button type="button" onClick={() => { saveName(""); setEditing(false); }}
                style={{background:"none",border:"none",cursor:"pointer",
                  padding:4,flexShrink:0,color:"rgba(26,13,10,.28)"}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ─────────────────── IDLE ─────────────────── */}
        {phase.id === "idle" && (
          <div style={{
            opacity: entered ? 1 : 0,
            transform: entered ? "none" : "translateY(20px)",
            transition:"opacity .7s .46s ease,transform .7s .46s cubic-bezier(.16,1,.3,1)",
          }}>
            {/* Camera button — the hero CTA */}
            <button type="button" onClick={snap} style={{
              width:"100%",background:"none",border:"none",cursor:"pointer",padding:0,
            }}>
              <div style={{
                width:"100%",borderRadius:28,overflow:"hidden",position:"relative",
                background:`linear-gradient(158deg,#8B1A2C 0%,${ROSE} 50%,#6E1020 100%)`,
                boxShadow:`0 18px 60px rgba(190,45,69,.34),0 4px 16px rgba(0,0,0,.10)`,
                transition:"transform .22s ease,box-shadow .22s ease",
              }}
                onMouseEnter={e=>{
                  (e.currentTarget as HTMLElement).style.transform="translateY(-4px) scale(1.005)";
                  (e.currentTarget as HTMLElement).style.boxShadow=`0 28px 80px rgba(190,45,69,.42),0 8px 24px rgba(0,0,0,.12)`;
                }}
                onMouseLeave={e=>{
                  (e.currentTarget as HTMLElement).style.transform="";
                  (e.currentTarget as HTMLElement).style.boxShadow=`0 18px 60px rgba(190,45,69,.34),0 4px 16px rgba(0,0,0,.10)`;
                }}
              >
                {/* Ambient overlays */}
                <div aria-hidden style={{position:"absolute",inset:0,pointerEvents:"none",
                  background:`radial-gradient(ellipse 65% 65% at 88% 12%,rgba(255,255,255,.10) 0%,transparent 55%)`}}/>
                <div aria-hidden style={{position:"absolute",inset:0,opacity:.15,pointerEvents:"none",
                  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E")`}}/>

                <div style={{
                  padding:"clamp(2rem,7vw,3.5rem) 2rem clamp(1.75rem,6vw,3rem)",
                  display:"flex",flexDirection:"column",
                  alignItems:"center",gap:"1.75rem",
                  position:"relative",zIndex:1,
                }}>
                  {/* Pulsing lens icon */}
                  <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {/* Ripple rings */}
                    {[105,88].map((s,i)=>(
                      <div key={s} aria-hidden style={{
                        position:"absolute",width:s,height:s,borderRadius:"50%",
                        border:`${i===0?"1.5px":"1px"} solid rgba(255,255,255,${i===0?.24:.16})`,
                        animation:`snapRipple 2.8s ${i*.7}s ease-out infinite`,
                      }}/>
                    ))}
                    {/* Lens body */}
                    <div style={{
                      width:80,height:80,borderRadius:"50%",
                      background:"rgba(255,255,255,.14)",
                      backdropFilter:"blur(10px)",
                      border:"1.5px solid rgba(255,255,255,.32)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      boxShadow:"0 4px 24px rgba(0,0,0,.18)",
                    }}>
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(255,255,255,.90)" strokeWidth="1.4" strokeLinecap="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </div>
                  </div>

                  {/* Text */}
                  <div style={{textAlign:"center"}}>
                    <p style={{
                      fontFamily:DF,fontWeight:300,
                      fontSize:"clamp(1.6rem,5.5vw,2.4rem)",
                      color:"#fff",lineHeight:1.1,
                      letterSpacing:"-.02em",marginBottom:".75rem",
                    }}>
                      Capture this moment
                    </p>
                    <p style={{
                      fontFamily:BF,fontSize:".54rem",letterSpacing:".32em",
                      textTransform:"uppercase",color:"rgba(255,255,255,.52)",
                      fontWeight:600,
                    }}>
                      Opens your camera · Uploads instantly
                    </p>
                  </div>

                  {/* Feature strip */}
                  <div style={{
                    width:"100%",
                    borderTop:"1px solid rgba(255,255,255,.12)",
                    paddingTop:"1.25rem",
                    display:"flex",justifyContent:"center",gap:"clamp(1.5rem,5vw,2.5rem)",
                  }}>
                    {[{icon:"📸",label:"One tap"},{icon:"⚡",label:"Instant"},{icon:"🎞️",label:"Gallery"}].map(({icon,label})=>(
                      <div key={label} style={{textAlign:"center"}}>
                        <div style={{fontSize:"1.15rem",marginBottom:".28rem"}}>{icon}</div>
                        <p style={{fontFamily:BF,fontSize:".46rem",letterSpacing:".18em",
                          textTransform:"uppercase",color:"rgba(255,255,255,.42)",fontWeight:600}}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </button>

            {/* Context note card */}
            <div style={{
              marginTop:"1.25rem",
              padding:"1.125rem 1.25rem",
              background:"#fff",borderRadius:18,
              border:`1px solid ${CREAM}`,
              display:"flex",alignItems:"flex-start",gap:".875rem",
              boxShadow:"0 2px 12px rgba(26,13,10,.05)",
            }}>
              <div style={{
                width:36,height:36,borderRadius:10,flexShrink:0,
                background:"rgba(154,108,6,.08)",border:"1px solid rgba(154,108,6,.18)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:".95rem",
              }}>✦</div>
              <div>
                <p style={{fontFamily:DF,fontStyle:"italic",fontSize:"1rem",
                  color:INK,lineHeight:1.5,marginBottom:".25rem"}}>
                  Your photos join their forever album
                </p>
                <p style={{fontFamily:BF,fontSize:".75rem",color:"rgba(26,13,10,.45)",lineHeight:1.65}}>
                  {isToday
                    ? `Every photo you share today is a gift to ${bf} & ${gf} — the ones their official photographer will never catch.`
                    : `${bf} & ${gf} will see every photo. Photos appear in the gallery after a quick review.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────── UPLOADING ─────────────────── */}
        {phase.id === "uploading" && (
          <div style={{animation:"snapFadeUp .4s ease both"}}>
            <div style={{
              position:"relative",borderRadius:24,overflow:"hidden",
              boxShadow:"0 12px 40px rgba(0,0,0,.12)",marginBottom:"1.25rem",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={phase.preview} alt="Uploading"
                style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",display:"block"}}/>
              <div style={{
                position:"absolute",inset:0,
                background:"rgba(250,246,240,.55)",backdropFilter:"blur(3px)",
                display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",gap:"1rem",
              }}>
                <div style={{
                  width:64,height:64,borderRadius:"50%",
                  border:`3px solid rgba(190,45,69,.18)`,
                  borderTopColor:ROSE,
                  animation:"snapSpin .85s linear infinite",
                }}/>
                <div style={{textAlign:"center"}}>
                  <p style={{fontFamily:DF,fontStyle:"italic",fontSize:"1.2rem",color:ROSE,marginBottom:".25rem"}}>
                    Sending your photo…
                  </p>
                  <p style={{fontFamily:BF,fontSize:".54rem",letterSpacing:".22em",
                    textTransform:"uppercase",color:"rgba(190,45,69,.60)"}}>
                    {phase.progress}% complete
                  </p>
                </div>
              </div>
            </div>
            <div style={{height:3,borderRadius:999,background:"rgba(190,45,69,.12)",overflow:"hidden"}}>
              <div style={{
                height:"100%",borderRadius:999,
                background:`linear-gradient(90deg,${ROSE},${ROSEL})`,
                width:`${phase.progress}%`,
                transition:"width .3s ease",
              }}/>
            </div>
          </div>
        )}

        {/* ─────────────────── SUCCESS ─────────────────── */}
        {phase.id === "success" && (
          <div style={{animation:"snapFadeUp .5s ease both"}}>
            {/* Polaroid card */}
            <div style={{
              background:"#fff",
              padding:"1rem 1rem .75rem",
              borderRadius:22,
              boxShadow:"0 20px 64px rgba(0,0,0,.14),0 4px 12px rgba(0,0,0,.07)",
              marginBottom:"1.5rem",
              animation:"snapLand .55s cubic-bezier(.34,1.56,.64,1) both",
            }}>
              <div style={{borderRadius:14,overflow:"hidden",position:"relative"}}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={phase.preview} alt="Shared"
                  style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",display:"block"}}/>
              </div>
              {/* Polaroid strip */}
              <div style={{
                padding:".875rem .5rem .375rem",textAlign:"center",
                borderTop:"none",
              }}>
                <p style={{fontFamily:DF,fontStyle:"italic",fontSize:"1rem",color:INK}}>
                  {name ? `— ${name}` : "A guest at the wedding"}
                </p>
                <p style={{fontFamily:BF,fontSize:".48rem",letterSpacing:".24em",
                  textTransform:"uppercase",color:"rgba(26,13,10,.35)",marginTop:".25rem"}}>
                  {bf} &amp; {gf} · {date}
                </p>
              </div>
            </div>

            {/* Success message card */}
            <div style={{
              textAlign:"center",padding:"1.5rem",
              background:"#fff",borderRadius:20,
              border:`1px solid ${CREAM}`,
              marginBottom:"1.25rem",
              boxShadow:"0 2px 14px rgba(0,0,0,.05)",
            }}>
              <div style={{
                width:52,height:52,borderRadius:"50%",
                background:`linear-gradient(135deg,${ROSEL},${ROSE})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                margin:"0 auto 1rem",
                boxShadow:`0 6px 20px rgba(190,45,69,.30)`,
                animation:"snapPopIn .45s cubic-bezier(.34,1.56,.64,1) both",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <p style={{fontFamily:DF,fontWeight:300,
                fontSize:"clamp(1.3rem,4vw,1.7rem)",
                color:INK,lineHeight:1.2,marginBottom:".5rem"}}>
                It&rsquo;s in their album now
              </p>
              <p style={{fontFamily:BF,fontSize:".82rem",color:"rgba(26,13,10,.50)",lineHeight:1.65}}>
                {name
                  ? `Thank you, ${name.split(" ")[0]}. ${bf} & ${gf} will see this — and they'll be glad you were here.`
                  : `${bf} & ${gf} will see this in their wedding gallery. Thank you for being part of their day.`}
              </p>
            </div>

            <button type="button" onClick={() => setPhase({ id: "idle" })} style={{
              width:"100%",display:"flex",alignItems:"center",justifyContent:"center",
              gap:".625rem",padding:"15px",borderRadius:16,cursor:"pointer",
              background:"#fff",border:`1.5px solid ${CREAM}`,
              fontFamily:BF,fontSize:".65rem",fontWeight:700,
              letterSpacing:".18em",textTransform:"uppercase",color:INK,
              boxShadow:"0 2px 10px rgba(0,0,0,.05)",
              transition:"border-color .18s,box-shadow .18s",
            }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=ROSE;(e.currentTarget as HTMLElement).style.boxShadow=`0 4px 16px rgba(190,45,69,.14)`;}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=CREAM;(e.currentTarget as HTMLElement).style.boxShadow="0 2px 10px rgba(0,0,0,.05)";}}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke={ROSE} strokeWidth="2" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Capture another moment
            </button>
          </div>
        )}

        {/* ─────────────────── ERROR ─────────────────── */}
        {phase.id === "error" && (
          <div style={{animation:"snapFadeUp .4s ease both"}}>
            <div style={{
              padding:"1.75rem",borderRadius:20,
              background:"rgba(190,45,69,.04)",border:`1px solid rgba(190,45,69,.16)`,
              textAlign:"center",marginBottom:"1.25rem",
            }}>
              <div style={{fontSize:"2.2rem",marginBottom:".875rem"}}>📵</div>
              <p style={{fontFamily:DF,fontStyle:"italic",fontSize:"1.15rem",color:ROSE,marginBottom:".375rem"}}>
                Something went wrong
              </p>
              <p style={{fontFamily:BF,fontSize:".82rem",color:"rgba(26,13,10,.50)",lineHeight:1.6}}>
                {phase.message}
              </p>
            </div>
            <button type="button" onClick={() => setPhase({ id: "idle" })} style={{
              width:"100%",padding:"15px",borderRadius:16,cursor:"pointer",
              background:ROSE,color:"#fff",border:"none",
              fontFamily:BF,fontSize:".65rem",fontWeight:700,
              letterSpacing:".18em",textTransform:"uppercase",
              boxShadow:`0 6px 20px rgba(190,45,69,.30)`,
            }}>
              Try again
            </button>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{
          textAlign:"center",
          paddingTop:"1.25rem",
          borderTop:`1px solid ${CREAM}`,
          opacity: entered ? 1 : 0,
          transition:"opacity .7s .6s ease",
        }}>
          <p style={{
            fontFamily:DF,fontStyle:"italic",
            fontSize:"clamp(.9rem,2.5vw,1.05rem)",
            color:"rgba(26,13,10,.38)",lineHeight:1.65,
            marginBottom:".375rem",
          }}>
            {isToday
              ? "Today is the day they said yes to forever."
              : `${days} days until they say yes to forever.`}
          </p>
          <p style={{
            fontFamily:BF,fontSize:".46rem",letterSpacing:".30em",
            textTransform:"uppercase",color:"rgba(26,13,10,.25)",
          }}>
            Divine Mercy Church · Blue Bay Beach Resort
          </p>
        </div>
      </div>

      <style>{`
        @keyframes snapSpin   { to   { transform: rotate(360deg) } }
        @keyframes snapRipple { 0%   { transform: scale(.88); opacity: .7 }
                                100% { transform: scale(1.65); opacity: 0  } }
        @keyframes snapFadeUp { from { opacity: 0; transform: translateY(16px) }
                                to   { opacity: 1; transform: none           } }
        @keyframes snapLand   { from { opacity: 0; transform: translateY(14px) rotate(-1.5deg) }
                                to   { opacity: 1; transform: none                             } }
        @keyframes snapPopIn  { from { transform: scale(0); opacity: 0 }
                                to   { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  );
}
