"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { weddingConfig } from "@/lib/config";

const bNameFull = weddingConfig.brideName || "Marion Jemima";
const gNameFull = weddingConfig.groomName || "Livingston";
const dateText  = weddingConfig.weddingDate || "2026-12-18";
const venueText = weddingConfig.venueName || "Blue Bay Beach Resort";
const titleText = weddingConfig.celebrationTitle || "Surihana Vows";

/* ─── Vivid gold palette ─────────────────────────────────────────────────── */
const G = {
  vivid:   "#FFD700",  // pure bright gold
  bright:  "#FFC107",  // amber-gold
  mid:     "#D4AF37",  // classic gold
  deep:    "#B8860B",  // dark gold
  pale:    "#FFF8DC",  // cornsilk — near-white gold
  glow:    "rgba(255,215,0,0.55)",
  glowSm:  "rgba(255,215,0,0.25)",
};

export default function CinematicInvite() {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const overlayRef     = useRef<HTMLDivElement>(null);
  const coreCardRef    = useRef<HTMLDivElement>(null);
  const scanningRef    = useRef<HTMLDivElement>(null);
  const btnRef         = useRef<HTMLButtonElement>(null);
  const titleRef       = useRef<HTMLDivElement>(null);
  const namesRef       = useRef<HTMLDivElement>(null);
  const ampRef         = useRef<HTMLSpanElement>(null);
  const detailOneRef   = useRef<HTMLDivElement>(null);
  const detailTwoRef   = useRef<HTMLDivElement>(null);

  /* ── Name card 3D tilt ── */
  const brideCardRef   = useRef<HTMLDivElement>(null);
  const groomCardRef   = useRef<HTMLDivElement>(null);

  const [hasInit, setHasInit] = useState(false);

  /* ── Mouse-driven 3D tilt on name cards ─────────────────────────────────── */
  const handleNameMouseMove = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    cardRef: React.RefObject<HTMLDivElement>
  ) => {
    const card = cardRef.current;
    if (!card) return;
    const rect   = card.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2); // –1 to +1
    const dy     = (e.clientY - cy) / (rect.height / 2);
    const rotX   = -dy * 18;   // tilt up/down  max 18°
    const rotY   =  dx * 22;   // tilt left/right max 22°
    card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`;
    card.style.boxShadow = `
      ${-dx * 12}px ${-dy * 12}px 40px ${G.glow},
       0 0 60px rgba(0,0,0,0.6)
    `;
    /* Specular shine moves with tilt */
    const shineX = 50 + dx * 35;
    const shineY = 50 + dy * 35;
    card.style.backgroundImage = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,215,0,0.12) 0%, transparent 55%)`;
  }, []);

  const handleNameMouseLeave = useCallback((cardRef: React.RefObject<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    card.style.boxShadow = `0 0 30px ${G.glowSm}, 0 20px 50px rgba(0,0,0,0.5)`;
    card.style.backgroundImage = "none";
  }, []);

  /* ── WebGL background ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x020203, 1);

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 14);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020203, 0.06);

    /* Torus knot — now with vivid gold */
    const group = new THREE.Group();
    scene.add(group);
    const geom = new THREE.TorusKnotGeometry(4.5, 0.8, 300, 32, 2, 5);
    const mat  = new THREE.ShaderMaterial({
      uniforms: {
        time:   { value: 0 },
        color1: { value: new THREE.Color(0x0a1628) },  // deep navy
        color2: { value: new THREE.Color(0xffd700) },  // vivid gold
      },
      vertexShader: `
        varying vec2 vUv; varying vec3 vPos; uniform float time;
        void main(){
          vUv=uv; vPos=position;
          vec3 p=position;
          p.x+=sin(p.y*2.0+time)*0.25;
          p.z+=cos(p.x*2.0+time)*0.25;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1,color2; uniform float time;
        varying vec2 vUv; varying vec3 vPos;
        void main(){
          float m=sin(vUv.x*10.0+time*1.5)*0.5+0.5;
          m*=cos(vUv.y*5.0-time)*0.5+0.5;
          float edge=smoothstep(0.75,1.0,sin(vPos.y*3.0+time*3.0));
          vec3 col=mix(color1,color2,m);
          col+=vec3(1.0,0.85,0.0)*edge*2.0;  /* vivid gold flare */
          gl_FragColor=vec4(col,0.40);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    group.add(new THREE.Mesh(geom, mat));

    /* Gold particle field */
    const pGeo = new THREE.BufferGeometry();
    const N    = 1400;
    const pa   = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) pa[i] = (Math.random() - 0.5) * 45;
    pGeo.setAttribute("position", new THREE.BufferAttribute(pa, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffd700, size: 0.035, transparent: true,
      opacity: 0.55, blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(pGeo, pMat);
    scene.add(stars);

    let mx = 0, my = 0;
    const onMM = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth)  * 2 - 1;
      my = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onR = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("mousemove", onMM);
    window.addEventListener("resize",    onR);

    const clk = new THREE.Clock();
    let fid = 0;
    const tick = () => {
      const t = clk.getElapsedTime();
      mat.uniforms.time.value = t;
      group.rotation.x = t * 0.05;
      group.rotation.y = t * 0.08;
      stars.rotation.y = t * 0.025;
      camera.position.x += (mx * 2.2 - camera.position.x) * 0.05;
      camera.position.y += (my * 2.2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      fid = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("resize",    onR);
      cancelAnimationFrame(fid);
      renderer.dispose();
    };
  }, []);

  /* ── GSAP cinematic reveal ────────────────────────────────────────────────── */
  const launch = () => {
    if (hasInit) return;
    setHasInit(true);
    const tl = gsap.timeline();
    tl.to(btnRef.current,    { opacity: 0, scale: 0.88, duration: 0.4, ease: "power2.in" })
      .set(btnRef.current,   { pointerEvents: "none" })
      .to(scanningRef.current, { height: "100%", duration: 1.2, ease: "expo.inOut" })
      .to(scanningRef.current, { opacity: 0, duration: 0.3 }, "+=0.1")
      .to(overlayRef.current,  { opacity: 0.15, backdropFilter: "blur(0px)", duration: 1.5, ease: "power2.out" }, "-=0.5")
      .set(overlayRef.current, { pointerEvents: "none" })
      .fromTo(coreCardRef.current,
        { opacity: 0, scale: 1.06, y: 32 },
        { opacity: 1, scale: 1,    y: 0,  duration: 2, ease: "expo.out" }, "-=0.8")
      .fromTo(titleRef.current,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0,  duration: 1.8, ease: "power3.out" }, "-=1.0")
      .fromTo(namesRef.current,
        { opacity: 0, y: 44, scale: 0.94 },
        { opacity: 1, y: 0,  scale: 1,    duration: 2,   ease: "expo.out" }, "-=1.2")
      .fromTo(ampRef.current,
        { opacity: 0, scale: 0, rotate: -15 },
        { opacity: 1, scale: 1, rotate: 0, duration: 1.6, ease: "elastic.out(1.1, 0.5)" }, "-=1.4")
      .fromTo([detailOneRef.current, detailTwoRef.current],
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0,  duration: 1.5, stagger: 0.2, ease: "power2.out" }, "-=0.9");
  };

  /* ────────────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#020203", color: "#E0E5EC" }}>

      {/* ── Fonts + keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Orbitron:wght@400;600;700&display=swap');

        @keyframes goldShimmer {
          0%   { background-position: -250% center; }
          100% { background-position: 250% center; }
        }
        @keyframes goldShimmerFast {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%,100% { opacity: 0.65; transform: scale(1); }
          50%     { opacity: 1;    transform: scale(1.08); }
        }
        @keyframes floatDot {
          0%,100% { transform: translateY(0);   opacity: 0.5; }
          50%     { transform: translateY(-5px); opacity: 1;   }
        }
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 0 8px  ${G.glow}, 0 0 20px ${G.glowSm}; }
          50%     { box-shadow: 0 0 20px ${G.glow}, 0 0 50px ${G.glowSm}; }
        }
        @keyframes scanline {
          0%   { top: -2px;   opacity: 1; }
          95%  { top: 100%;   opacity: 1; }
          100% { top: 100%;   opacity: 0; }
        }
        @keyframes nameGlow {
          0%,100% { filter: drop-shadow(0 0 12px rgba(255,215,0,0.4)); }
          50%     { filter: drop-shadow(0 0 28px rgba(255,215,0,0.75)); }
        }

        .name-card {
          transition: transform 0.12s ease, box-shadow 0.18s ease, background-image 0.15s ease;
          will-change: transform, box-shadow;
          transform-style: preserve-3d;
          cursor: default;
        }
        .name-card:hover .name-label {
          color: ${G.vivid} !important;
          opacity: 1 !important;
        }
        .name-text-bride {
          background: linear-gradient(160deg, ${G.pale} 0%, ${G.vivid} 30%, ${G.mid} 55%, ${G.bright} 80%, ${G.pale} 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldShimmer 4s linear infinite;
          filter: drop-shadow(0 0 18px rgba(255,215,0,0.5));
        }
        .name-text-groom {
          background: linear-gradient(160deg, ${G.pale} 0%, ${G.bright} 30%, ${G.vivid} 55%, ${G.mid} 80%, ${G.pale} 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldShimmer 4s linear infinite 2s;
          filter: drop-shadow(0 0 18px rgba(255,215,0,0.5));
        }
        .amp-text {
          background: linear-gradient(135deg, ${G.vivid} 0%, ${G.pale} 40%, ${G.vivid} 70%, ${G.mid} 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldShimmerFast 2.5s linear infinite;
          filter: drop-shadow(0 0 24px ${G.glow});
        }
        .header-title {
          background: linear-gradient(90deg, ${G.deep} 0%, ${G.mid} 20%, ${G.vivid} 40%, ${G.pale} 50%, ${G.vivid} 60%, ${G.mid} 80%, ${G.deep} 100%);
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldShimmer 5s linear infinite;
          filter: drop-shadow(0 0 10px ${G.glow});
        }
        .gold-line {
          background: linear-gradient(90deg, transparent 0%, ${G.deep} 15%, ${G.vivid} 40%, ${G.pale} 50%, ${G.vivid} 60%, ${G.deep} 85%, transparent 100%);
          animation: borderGlow 3s ease-in-out infinite;
        }
        .corner-accent {
          animation: borderGlow 3s ease-in-out infinite;
        }
      `}</style>

      {/* ── WebGL canvas ── */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

      {/* ── Entry overlay ── */}
      <div ref={overlayRef} style={{
        position: "absolute", inset: 0, zIndex: 50,
        background: "#020203", backdropFilter: "blur(20px)",
        display: "flex", justifyContent: "center", alignItems: "center",
      }}>
        {/* Scanning line */}
        <div ref={scanningRef} style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "0%",
          borderBottom: `2px solid ${G.vivid}`,
          boxShadow: `0 0 24px 4px ${G.glow}, 0 0 50px 8px rgba(255,215,0,0.2)`,
          zIndex: 51, pointerEvents: "none",
        }} />

        {/* INITIALIZE button */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          {/* Decorative rings around button */}
          <div style={{
            position: "absolute",
            width: 220, height: 220,
            borderRadius: "50%",
            border: `1px solid rgba(255,215,0,0.08)`,
          }} />
          <div style={{
            position: "absolute",
            width: 280, height: 280,
            borderRadius: "50%",
            border: `1px solid rgba(255,215,0,0.04)`,
          }} />

          <div style={{
            fontSize: "clamp(0.45rem,0.7vw,0.58rem)",
            letterSpacing: "0.55em",
            textTransform: "uppercase",
            fontFamily: "'Orbitron',sans-serif",
            color: `rgba(255,215,0,0.45)`,
            marginBottom: "-0.5rem",
          }}>
            ◆ INVITATION SYSTEM READY ◆
          </div>

          <button
            ref={btnRef}
            onClick={launch}
            style={{
              padding: "18px 52px",
              fontSize: "0.82rem",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              background: "transparent",
              color: G.vivid,
              border: `1px solid ${G.mid}`,
              borderRadius: "4px",
              outline: "none",
              cursor: "pointer",
              fontFamily: "'Orbitron',sans-serif",
              transition: "all 0.4s ease",
              boxShadow: `0 0 20px rgba(212,175,55,0.2), inset 0 0 20px rgba(255,215,0,0.03)`,
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,215,0,0.06)";
              e.currentTarget.style.borderColor = G.vivid;
              e.currentTarget.style.boxShadow   = `0 0 40px ${G.glow}, 0 0 80px rgba(255,215,0,0.2), inset 0 0 30px rgba(255,215,0,0.06)`;
              e.currentTarget.style.letterSpacing = "0.55em";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = G.mid;
              e.currentTarget.style.boxShadow   = `0 0 20px rgba(212,175,55,0.2), inset 0 0 20px rgba(255,215,0,0.03)`;
              e.currentTarget.style.letterSpacing = "0.45em";
            }}
          >
            INITIALIZE
          </button>

          <div style={{
            fontSize: "clamp(0.38rem,0.58vw,0.5rem)",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            fontFamily: "'Orbitron',sans-serif",
            color: "rgba(255,255,255,0.20)",
          }}>
            Tap to reveal your invitation
          </div>
        </div>
      </div>

      {/* ── Main glass card ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        display: "flex", justifyContent: "center", alignItems: "center",
        pointerEvents: "none",
      }}>
        <div
          ref={coreCardRef}
          style={{
            width: "100%", maxWidth: "80vw", maxHeight: "88vh",
            aspectRatio: "1/1.2",
            background: "linear-gradient(145deg, rgba(255,215,0,0.025) 0%, rgba(255,255,255,0.01) 50%, rgba(255,215,0,0.015) 100%)",
            backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
            border: `1px solid rgba(255,215,0,0.15)`,
            borderRadius: "18px",
            padding: "5vw",
            display: "flex", flexDirection: "column",
            justifyContent: "space-between", alignItems: "center",
            opacity: 0, position: "relative",
            boxShadow: `0 0 60px rgba(255,215,0,0.08), 0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,215,0,0.06)`,
          }}
        >
          {/* Gold corner brackets — animated glow */}
          {([
            { top: 16,    left: 16,    borderTop:    `2px solid ${G.vivid}`, borderLeft:   `2px solid ${G.vivid}` },
            { top: 16,    right: 16,   borderTop:    `2px solid ${G.vivid}`, borderRight:  `2px solid ${G.vivid}` },
            { bottom: 16, left: 16,    borderBottom: `2px solid ${G.vivid}`, borderLeft:   `2px solid ${G.vivid}` },
            { bottom: 16, right: 16,   borderBottom: `2px solid ${G.vivid}`, borderRight:  `2px solid ${G.vivid}` },
          ] as React.CSSProperties[]).map((s, i) => (
            <div key={i} className="corner-accent" style={{ position: "absolute", width: 22, height: 22, ...s }} />
          ))}

          {/* ════════════════════════════════
              HEADER
          ════════════════════════════════ */}
          <div
            ref={titleRef}
            style={{
              width: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", gap: "8px", opacity: 0,
            }}
          >
            {/* Top gold line */}
            <div className="gold-line" style={{ width: "65%", height: "1.5px", borderRadius: "1px", marginBottom: "4px" }} />

            {/* Celebration title — vivid gold shimmer */}
            <div
              className="header-title"
              style={{
                fontFamily: "'Cinzel', Georgia, serif",
                fontSize: "clamp(0.7rem, 1.3vw, 1.1rem)",
                fontWeight: 700,
                letterSpacing: "0.55em",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {titleText}
            </div>

            {/* Sub-row */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              fontSize: "clamp(0.38rem, 0.6vw, 0.52rem)",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              fontFamily: "'Orbitron', sans-serif",
            }}>
              <span style={{ color: G.vivid, animation: "pulse 2.5s ease-in-out infinite", display: "inline-block" }}>
                ✦ SYNC
              </span>
              <span style={{ color: "rgba(255,215,0,0.18)" }}>━</span>
              <span style={{ color: "rgba(255,255,255,0.30)", letterSpacing: "0.3em" }}>SECURE</span>
              <span style={{ color: "rgba(255,215,0,0.18)" }}>━</span>
              <span style={{ color: G.vivid, animation: "pulse 2.5s ease-in-out infinite 1.25s", display: "inline-block" }}>
                AUTH ✦
              </span>
            </div>

            {/* Thin bottom line */}
            <div style={{
              width: "38%", height: "1px", borderRadius: "1px",
              background: `linear-gradient(90deg, transparent, ${G.mid}, transparent)`,
              marginTop: "2px",
            }} />
          </div>

          {/* ════════════════════════════════
              NAMES — 3D tilt cards
          ════════════════════════════════ */}
          <div
            ref={namesRef}
            style={{
              width: "100%", opacity: 0,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
              pointerEvents: "all",
            }}
          >
            {/* Bride card */}
            <div
              ref={brideCardRef}
              className="name-card"
              onMouseMove={(e) => handleNameMouseMove(e, brideCardRef)}
              onMouseLeave={() => handleNameMouseLeave(brideCardRef)}
              style={{
                width: "100%",
                padding: "clamp(10px,2vw,22px) clamp(16px,3vw,40px)",
                borderRadius: "14px",
                border: `1px solid rgba(255,215,0,0.18)`,
                background: "rgba(255,215,0,0.03)",
                boxShadow: `0 0 30px ${G.glowSm}, 0 20px 50px rgba(0,0,0,0.5)`,
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "4px", position: "relative", overflow: "hidden",
              }}
            >
              {/* Inner gold top-line accent */}
              <div style={{
                position: "absolute", top: 0, left: "20%", right: "20%", height: "1px",
                background: `linear-gradient(90deg, transparent, ${G.vivid}, transparent)`,
                opacity: 0.6,
              }} />

              <div
                className="name-label"
                style={{
                  fontSize: "clamp(0.38rem, 0.58vw, 0.5rem)",
                  letterSpacing: "0.55em",
                  textTransform: "uppercase",
                  fontFamily: "'Orbitron', sans-serif",
                  color: `rgba(255,215,0,0.45)`,
                  transition: "color 0.3s, opacity 0.3s",
                }}
              >
                Bride
              </div>

              <div
                className="name-text-bride"
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontSize: "clamp(2rem, 5vw, 4.8rem)",
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "0.1em",
                  textAlign: "center",
                  /* 3D depth layer */
                  transform: "translateZ(20px)",
                }}
              >
                {bNameFull}
              </div>
            </div>

            {/* Ampersand */}
            <span
              ref={ampRef}
              className="amp-text"
              style={{
                display: "inline-block",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2rem, 3.8vw, 3.4rem)",
                fontWeight: 300,
                fontStyle: "italic",
                lineHeight: 1,
                margin: "clamp(4px, 0.8vw, 12px) 0",
                opacity: 0,
                transformOrigin: "center",
              }}
            >
              &amp;
            </span>

            {/* Groom card */}
            <div
              ref={groomCardRef}
              className="name-card"
              onMouseMove={(e) => handleNameMouseMove(e, groomCardRef)}
              onMouseLeave={() => handleNameMouseLeave(groomCardRef)}
              style={{
                width: "100%",
                padding: "clamp(10px,2vw,22px) clamp(16px,3vw,40px)",
                borderRadius: "14px",
                border: `1px solid rgba(255,215,0,0.18)`,
                background: "rgba(255,215,0,0.03)",
                boxShadow: `0 0 30px ${G.glowSm}, 0 20px 50px rgba(0,0,0,0.5)`,
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "4px", position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0, left: "20%", right: "20%", height: "1px",
                background: `linear-gradient(90deg, transparent, ${G.vivid}, transparent)`,
                opacity: 0.6,
              }} />

              <div
                className="name-text-groom"
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontSize: "clamp(2rem, 5vw, 4.8rem)",
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "0.1em",
                  textAlign: "center",
                  transform: "translateZ(20px)",
                }}
              >
                {gNameFull}
              </div>

              <div
                className="name-label"
                style={{
                  fontSize: "clamp(0.38rem, 0.58vw, 0.5rem)",
                  letterSpacing: "0.55em",
                  textTransform: "uppercase",
                  fontFamily: "'Orbitron', sans-serif",
                  color: `rgba(255,215,0,0.45)`,
                  transition: "color 0.3s, opacity 0.3s",
                }}
              >
                Groom
              </div>

              {/* Inner gold bottom-line accent */}
              <div style={{
                position: "absolute", bottom: 0, left: "20%", right: "20%", height: "1px",
                background: `linear-gradient(90deg, transparent, ${G.vivid}, transparent)`,
                opacity: 0.6,
              }} />
            </div>

            {/* Gold dot row */}
            <div style={{
              display: "flex", gap: "8px",
              marginTop: "clamp(6px, 1.2vw, 14px)",
              alignItems: "center",
            }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  width:  i === 2 ? 8 : (i === 1 || i === 3) ? 5 : 3,
                  height: i === 2 ? 8 : (i === 1 || i === 3) ? 5 : 3,
                  borderRadius: "50%",
                  background: G.vivid,
                  opacity: i === 2 ? 1 : i === 1 || i === 3 ? 0.55 : 0.25,
                  boxShadow: i === 2 ? `0 0 10px ${G.vivid}, 0 0 20px ${G.glow}` : "none",
                  animation: `floatDot ${1.6 + i * 0.25}s ease-in-out infinite`,
                }} />
              ))}
            </div>
          </div>

          {/* ════════════════════════════════
              BOTTOM DATA GRID
          ════════════════════════════════ */}
          <div style={{
            display: "flex", justifyContent: "space-between", width: "100%",
            borderTop: `1px solid rgba(255,215,0,0.12)`,
            paddingTop: "clamp(16px,3vw,30px)",
          }}>
            <div ref={detailOneRef} style={{ display: "flex", flexDirection: "column", gap: "5px", opacity: 0 }}>
              <span style={{
                fontSize: "clamp(0.42rem, 0.65vw, 0.55rem)",
                letterSpacing: "0.28em",
                fontFamily: "'Orbitron', sans-serif",
                color: G.vivid,
              }}>
                ◆ DATE_SYNC
              </span>
              <span style={{
                fontSize: "clamp(0.9rem, 1.4vw, 1.4rem)",
                fontWeight: 300,
                letterSpacing: "0.12em",
                fontFamily: "'Cinzel', Georgia, serif",
                color: G.pale,
              }}>
                {dateText}
              </span>
            </div>

            {/* Centre divider diamond */}
            <div style={{
              display: "flex", alignItems: "center",
              color: G.vivid,
              fontSize: "clamp(0.8rem, 1.2vw, 1.1rem)",
              opacity: 0.5,
              animation: "pulse 3s ease-in-out infinite",
            }}>
              ◆
            </div>

            <div ref={detailTwoRef} style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "flex-end", textAlign: "right", opacity: 0 }}>
              <span style={{
                fontSize: "clamp(0.42rem, 0.65vw, 0.55rem)",
                letterSpacing: "0.28em",
                fontFamily: "'Orbitron', sans-serif",
                color: G.vivid,
              }}>
                LOCATION_LOCK ◆
              </span>
              <span style={{
                fontSize: "clamp(0.9rem, 1.4vw, 1.4rem)",
                fontWeight: 300,
                letterSpacing: "0.12em",
                fontFamily: "'Cinzel', Georgia, serif",
                color: G.pale,
              }}>
                {venueText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
