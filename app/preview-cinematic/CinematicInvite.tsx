"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { weddingConfig } from "@/lib/config";

const bName = weddingConfig.brideName.split(" ")[0]?.toUpperCase() || "BRIDE";
const gName = weddingConfig.groomName.split(" ")[0]?.toUpperCase() || "GROOM";
const bNameFull = weddingConfig.brideName || "Bride Name";
const gNameFull = weddingConfig.groomName || "Groom Name";
const dateText = weddingConfig.weddingDate.toUpperCase() || "20 MAY 2026";
const venueText = weddingConfig.venueName.toUpperCase() || "THE GRAND SUMMIT";

export default function CinematicInvite() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP Refs
  const overlayRef = useRef<HTMLDivElement>(null);
  const coreCardRef = useRef<HTMLDivElement>(null);
  const scanningLineRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Text Refs
  const titleRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<HTMLDivElement>(null);
  const ampersandRef = useRef<HTMLSpanElement>(null);
  const detailOneRef = useRef<HTMLDivElement>(null);
  const detailTwoRef = useRef<HTMLDivElement>(null);

  const [hasInit, setHasInit] = useState(false);

  // ── WebGL Luxury Background ─────────────────────────────────────────────
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

    const group = new THREE.Group();
    scene.add(group);

    const geom = new THREE.TorusKnotGeometry(4.5, 0.8, 300, 32, 2, 5);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time:   { value: 0 },
        color1: { value: new THREE.Color(0x1a2a3a) },
        color2: { value: new THREE.Color(0xd4af37) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        void main() {
          vUv = uv;
          vPosition = position;
          vec3 pos = position;
          pos.x += sin(pos.y * 2.0 + time) * 0.2;
          pos.z += cos(pos.x * 2.0 + time) * 0.2;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          float mixFactor = sin(vUv.x * 10.0 + time * 1.5) * 0.5 + 0.5;
          mixFactor *= cos(vUv.y * 5.0 - time) * 0.5 + 0.5;
          float edgeGlow = smoothstep(0.8, 1.0, sin(vPosition.y * 3.0 + time * 3.0));
          vec3 finalColor = mix(color1, color2, mixFactor);
          finalColor += vec3(0.5, 0.4, 0.1) * edgeGlow * 1.5;
          gl_FragColor = vec4(finalColor, 0.35);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      wireframe: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geom, material);
    group.add(mesh);

    const ptsGeo = new THREE.BufferGeometry();
    const count = 1000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 40;
    ptsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const ptsMat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.02, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(ptsGeo, ptsMat);
    scene.add(stars);

    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    const tick = () => {
      const t = clock.getElapsedTime();
      material.uniforms.time.value = t;
      group.rotation.x = t * 0.05;
      group.rotation.y = t * 0.08;
      stars.rotation.y = t * 0.02;
      camera.position.x += (mouseX * 2.0 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 2.0 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, []);

  // ── Cinematic GSAP Reveal Sequence ───────────────────────────────────────
  const launchSequence = () => {
    if (hasInit) return;
    setHasInit(true);

    const tl = gsap.timeline();

    tl.to(btnRef.current, { opacity: 0, scale: 0.9, duration: 0.4, ease: "power2.in" })
      .set(btnRef.current, { pointerEvents: "none" })
      .to(scanningLineRef.current, { height: "100%", duration: 1.2, ease: "expo.inOut" })
      .to(scanningLineRef.current, { opacity: 0, duration: 0.3 }, "+=0.1")
      .to(overlayRef.current, { opacity: 0.2, backdropFilter: "blur(0px)", duration: 1.5, ease: "power2.out" }, "-=0.5")
      .set(overlayRef.current, { pointerEvents: "none" })
      .fromTo(coreCardRef.current,
        { opacity: 0, scale: 1.05, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 2, ease: "expo.out" },
        "-=0.8"
      )
      .fromTo(titleRef.current,
        { opacity: 0, letterSpacing: "1em", y: -10 },
        { opacity: 1, letterSpacing: "0.35em", y: 0, duration: 1.8, ease: "power3.out" },
        "-=1.0"
      )
      .fromTo(namesRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 2, ease: "expo.out" },
        "-=1.2"
      )
      .fromTo(ampersandRef.current,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "elastic.out(1.2)" },
        "-=1.5"
      )
      .fromTo([detailOneRef.current, detailTwoRef.current],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.5, stagger: 0.2, ease: "power2.out" },
        "-=1.0"
      );
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed", inset: 0, overflow: "hidden",
        background: "#020203", color: "#E0E5EC",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── Google Fonts for display typography ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600;700&family=Orbitron:wght@400;700;800&display=swap');

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseGold {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50%       { transform: translateY(-4px); opacity: 1; }
        }
        .gold-shimmer {
          background: linear-gradient(
            90deg,
            #b8860b 0%, #d4af37 25%, #f5e27a 50%, #d4af37 75%, #b8860b 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .title-glow {
          text-shadow:
            0 0 20px rgba(212,175,55,0.8),
            0 0 40px rgba(212,175,55,0.4),
            0 0 60px rgba(212,175,55,0.2);
        }
      `}</style>

      {/* ── Three.js WebGL Layer ── */}
      <canvas ref={canvasRef} style={{ display: "block", position: "absolute", inset: 0, zIndex: 1 }} />

      {/* ── Cinematic Entry Overlay ── */}
      <div
        ref={overlayRef}
        style={{
          position: "absolute", inset: 0, zIndex: 50,
          background: "#020203", backdropFilter: "blur(20px)",
          display: "flex", justifyContent: "center", alignItems: "center",
        }}
      >
        <div ref={scanningLineRef} style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "0%",
          borderBottom: "2px solid #D4AF37",
          boxShadow: "0px 2px 20px 2px rgba(212,175,55,0.4)",
          zIndex: 51, pointerEvents: "none",
        }} />

        <button
          ref={btnRef}
          onClick={launchSequence}
          style={{
            padding: "16px 40px", fontSize: "0.85rem", letterSpacing: "0.4em",
            textTransform: "uppercase", background: "transparent",
            color: "#E0E5EC", border: "1px solid rgba(224,229,236,0.2)",
            borderRadius: "4px", outline: "none", cursor: "pointer",
            transition: "all 0.5s ease", position: "relative", overflow: "hidden",
            boxShadow: "0 0 15px rgba(255,255,255,0.0)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#D4AF37";
            e.currentTarget.style.color = "#D4AF37";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(212,175,55,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(224,229,236,0.2)";
            e.currentTarget.style.color = "#E0E5EC";
            e.currentTarget.style.boxShadow = "0 0 15px rgba(255,255,255,0)";
          }}
        >
          INITIALIZE
        </button>
      </div>

      {/* ── Futuristic Glass Interface ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        display: "flex", justifyContent: "center", alignItems: "center",
        pointerEvents: "none",
      }}>
        <div
          ref={coreCardRef}
          style={{
            width: "100%", maxWidth: "80vw", maxHeight: "85vh", aspectRatio: "1/1.2",
            background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", padding: "6vw",
            display: "flex", flexDirection: "column",
            justifyContent: "space-between", alignItems: "center",
            opacity: 0, position: "relative",
            boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {/* Corner Sci-Fi Accents */}
          {[
            { top: 20, left: 20,  borderTop: "2px solid #D4AF37", borderLeft:   "2px solid #D4AF37" },
            { top: 20, right: 20, borderTop: "2px solid #D4AF37", borderRight:  "2px solid #D4AF37" },
            { bottom: 20, left: 20,  borderBottom: "2px solid #D4AF37", borderLeft:  "2px solid #D4AF37" },
            { bottom: 20, right: 20, borderBottom: "2px solid #D4AF37", borderRight: "2px solid #D4AF37" },
          ].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: 20, height: 20, ...s }} />
          ))}

          {/* ══════════════════════════════════════════════════
              HEADER — redesigned with rich layered color
          ══════════════════════════════════════════════════ */}
          <div
            ref={titleRef}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              opacity: 0,
              position: "relative",
            }}
          >
            {/* Top decorative line with glow */}
            <div style={{
              width: "60%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, #D4AF37, #F5E27A, #D4AF37, transparent)",
              boxShadow: "0 0 8px rgba(212,175,55,0.6)",
              marginBottom: "6px",
            }} />

            {/* Main header text — gold shimmer */}
            <div style={{
              fontSize: "clamp(0.55rem, 0.9vw, 0.8rem)",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              textAlign: "center",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 400,
              /* Gold shimmer gradient text */
              background: "linear-gradient(90deg, #b8860b 0%, #d4af37 30%, #f5e27a 50%, #d4af37 70%, #b8860b 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 4s linear infinite",
              filter: "drop-shadow(0 0 8px rgba(212,175,55,0.5))",
            }}>
              {weddingConfig.celebrationTitle.toUpperCase()}
            </div>

            {/* Sub-label row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontSize: "clamp(0.45rem, 0.7vw, 0.6rem)",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              fontFamily: "'Orbitron', sans-serif",
            }}>
              <span style={{
                color: "rgba(212,175,55,0.55)",
                animation: "pulseGold 2.5s ease-in-out infinite",
              }}>
                ◆ SYSTEM SYNC
              </span>
              <span style={{ color: "rgba(255,255,255,0.12)" }}>|</span>
              <span style={{ color: "rgba(255,255,255,0.35)" }}>SECURE CHANNEL</span>
              <span style={{ color: "rgba(255,255,255,0.12)" }}>|</span>
              <span style={{
                color: "rgba(212,175,55,0.55)",
                animation: "pulseGold 2.5s ease-in-out infinite 1.25s",
              }}>
                AUTHORIZED ◆
              </span>
            </div>

            {/* Bottom decorative line */}
            <div style={{
              width: "40%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
              marginTop: "4px",
            }} />
          </div>

          {/* ══════════════════════════════════════════════════
              NAMES — redesigned: elegant serif + sci-fi hybrid
          ══════════════════════════════════════════════════ */}
          <div
            ref={namesRef}
            style={{
              textAlign: "center",
              width: "100%",
              position: "relative",
              opacity: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}
          >
            {/* Radial contrast backing */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "160%", height: "160%",
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)",
              pointerEvents: "none",
              zIndex: -1,
            }} />

            {/* BRIDE name — full name, elegant Cinzel serif */}
            <div style={{ position: "relative" }}>
              {/* Small label above */}
              <div style={{
                fontSize: "clamp(0.42rem, 0.65vw, 0.55rem)",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: "rgba(212,175,55,0.50)",
                fontFamily: "'Orbitron', sans-serif",
                marginBottom: "6px",
                textAlign: "center",
              }}>
                Bride
              </div>
              <div style={{
                fontFamily: "'Cinzel', 'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.2rem, 5.5vw, 5rem)",
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: "0.12em",
                /* White-to-silver shimmer */
                background: "linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 40%, #C8C8C8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 24px rgba(255,255,255,0.25))",
              }}>
                {bNameFull}
              </div>
            </div>

            {/* Ampersand — central gold accent */}
            <span
              ref={ampersandRef}
              style={{
                display: "inline-block",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
                fontWeight: 300,
                fontStyle: "italic",
                lineHeight: 1,
                margin: "clamp(6px, 1.2vw, 16px) 0",
                /* Gold shimmer */
                background: "linear-gradient(135deg, #b8860b 0%, #d4af37 40%, #f5e27a 60%, #d4af37 80%, #b8860b 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 3s linear infinite",
                filter: "drop-shadow(0 0 20px rgba(212,175,55,0.7))",
                opacity: 0,
                transformOrigin: "center",
              }}
            >
              &amp;
            </span>

            {/* GROOM name */}
            <div style={{ position: "relative" }}>
              <div style={{
                fontFamily: "'Cinzel', 'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.2rem, 5.5vw, 5rem)",
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: "0.12em",
                background: "linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 40%, #C8C8C8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 24px rgba(255,255,255,0.25))",
              }}>
                {gNameFull}
              </div>
              {/* Small label below */}
              <div style={{
                fontSize: "clamp(0.42rem, 0.65vw, 0.55rem)",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: "rgba(212,175,55,0.50)",
                fontFamily: "'Orbitron', sans-serif",
                marginTop: "6px",
                textAlign: "center",
              }}>
                Groom
              </div>
            </div>

            {/* Decorative dot row under names */}
            <div style={{
              display: "flex",
              gap: "8px",
              marginTop: "clamp(8px, 1.5vw, 18px)",
              alignItems: "center",
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: i === 1 ? 6 : 4,
                  height: i === 1 ? 6 : 4,
                  borderRadius: "50%",
                  background: "#D4AF37",
                  opacity: i === 1 ? 0.9 : 0.4,
                  animation: `floatDot ${1.8 + i * 0.3}s ease-in-out infinite`,
                }} />
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              BOTTOM DATA GRID — unchanged
          ══════════════════════════════════════════════════ */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "30px",
          }}>
            <div ref={detailOneRef} style={{ display: "flex", flexDirection: "column", gap: "4px", opacity: 0 }}>
              <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#D4AF37" }}>
                STATUS: DATE_SYNC
              </span>
              <span style={{ fontSize: "clamp(1rem, 1.5vw, 1.5rem)", fontWeight: 300, letterSpacing: "0.1em" }}>
                {dateText}
              </span>
            </div>

            <div ref={detailTwoRef} style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end", textAlign: "right", opacity: 0 }}>
              <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#D4AF37" }}>
                STATUS: LOCATION_LOCK
              </span>
              <span style={{ fontSize: "clamp(1rem, 1.5vw, 1.5rem)", fontWeight: 300, letterSpacing: "0.1em" }}>
                {venueText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
