"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { weddingConfig } from "@/lib/config";

const bName = weddingConfig.brideName.split(" ")[0]?.toUpperCase() || "BRIDE";
const gName = weddingConfig.groomName.split(" ")[0]?.toUpperCase() || "GROOM";
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
  const namesRef = useRef<HTMLHeadingElement>(null);
  const ampersandRef = useRef<HTMLSpanElement>(null);
  const detailOneRef = useRef<HTMLDivElement>(null);
  const detailTwoRef = useRef<HTMLDivElement>(null);

  const [hasInit, setHasInit] = useState(false);

  // ── WebGL Luxury Background ───────────────────────────────────────────────
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

    // ── Futuristic DNA / Ribbon Geometry ──
    const group = new THREE.Group();
    scene.add(group);

    const geom = new THREE.TorusKnotGeometry(4.5, 0.8, 300, 32, 2, 5);
    
    // Custom Shader Material for a flowing metallic / liquid neon effect
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Color(0x1a2a3a) }, // Deep cyber blue
            color2: { value: new THREE.Color(0xd4af37) }, // Gold accent
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            uniform float time;
            
            void main() {
                vUv = uv;
                vPosition = position;
                
                // Add soft wave distortion
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
                // Moving gradient pattern
                float mixFactor = sin(vUv.x * 10.0 + time * 1.5) * 0.5 + 0.5;
                mixFactor *= cos(vUv.y * 5.0 - time) * 0.5 + 0.5;
                
                // Add a glowing bright edge based on position height
                float edgeGlow = smoothstep(0.8, 1.0, sin(vPosition.y * 3.0 + time * 3.0));
                
                vec3 finalColor = mix(color1, color2, mixFactor);
                finalColor += vec3(0.5, 0.4, 0.1) * edgeGlow * 1.5; // Golden glowing peaks
                
                gl_FragColor = vec4(finalColor, 0.35); // Semi-transparent glass look
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        wireframe: true, // Gives it that expensive futuristic 3D mesh look
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geom, material);
    group.add(mesh);

    // ── Floating Stars / Data Points ──
    const ptsGeo = new THREE.BufferGeometry();
    const count = 1000;
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) {
        pos[i] = (Math.random() - 0.5) * 40;
    }
    ptsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const ptsMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(ptsGeo, ptsMat);
    scene.add(stars);

    // ── Interaction ──
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;

    const tick = () => {
        const t = clock.getElapsedTime();
        material.uniforms.time.value = t;
        
        // Very slow, majestic rotation
        group.rotation.x = t * 0.05;
        group.rotation.y = t * 0.08;
        
        stars.rotation.y = t * 0.02;

        // Smooth camera parallax reacting to mouse
        camera.position.x += (mouseX * 2.0 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 2.0 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(frameId);
        renderer.dispose();
    };
  }, []);

  // ── Cinematic GSAP Reveal Sequence ────────────────────────────────────────
  const launchSequence = () => {
    if (hasInit) return;
    setHasInit(true);

    const tl = gsap.timeline();

    // Fade out button
    tl.to(btnRef.current, { opacity: 0, scale: 0.9, duration: 0.4, ease: "power2.in" })
      .set(btnRef.current, { pointerEvents: "none" })
      
      // Scanning line dramatic effect
      .to(scanningLineRef.current, { height: "100%", duration: 1.2, ease: "expo.inOut" })
      .to(scanningLineRef.current, { opacity: 0, duration: 0.3 }, "+=0.1")

      // Dark Overlay Fade Out (Revealing the 3D background behind glass)
      .to(overlayRef.current, { opacity: 0.2, backdropFilter: "blur(0px)", duration: 1.5, ease: "power2.out" }, "-=0.5")
      .set(overlayRef.current, { pointerEvents: "none" })

      // Scale & fade in the core luxury card
      .fromTo(coreCardRef.current,
        { opacity: 0, scale: 1.05, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 2, ease: "expo.out" },
        "-=0.8"
      )

      // Text stagger reveal (using a "decode" futuristic slide-up)
      .fromTo(titleRef.current, { opacity: 0, letterSpacing: "1em", y: -10 }, { opacity: 1, letterSpacing: "0.4em", y: 0, duration: 1.8, ease: "power3.out" }, "-=1.0")
      .fromTo(namesRef.current, { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 2, ease: "expo.out" }, "-=1.2")
      .fromTo(ampersandRef.current, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 1.5, ease: "elastic.out(1.2)" }, "-=1.5")
      
      .fromTo([detailOneRef.current, detailTwoRef.current], 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 1.5, stagger: 0.2, ease: "power2.out" }, 
        "-=1.0"
      );
  };

  return (
    <div ref={containerRef} style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#020203", color: "#E0E5EC", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* ── Three.js WebGL Layer ── */}
      <canvas ref={canvasRef} style={{ display: "block", position: "absolute", inset: 0, zIndex: 1 }} />

      {/* ── Cinematic Entry Overlay ── */}
      <div ref={overlayRef} style={{
          position: "absolute", inset: 0, zIndex: 50, background: "#020203",
          backdropFilter: "blur(20px)", display: "flex", justifyContent: "center", alignItems: "center"
      }}>
          <div ref={scanningLineRef} style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "0%", 
              borderBottom: "2px solid #D4AF37", boxShadow: "0px 2px 20px 2px rgba(212,175,55,0.4)",
              zIndex: 51, pointerEvents: "none"
          }} />
          
          <button ref={btnRef} onClick={launchSequence} style={{
              padding: "16px 40px", fontSize: "0.85rem", letterSpacing: "0.4em", textTransform: "uppercase",
              background: "transparent", color: "#E0E5EC", border: "1px solid rgba(224,229,236,0.2)",
              borderRadius: "4px", outline: "none", cursor: "pointer",
              transition: "all 0.5s ease", position: "relative", overflow: "hidden",
              boxShadow: "0 0 15px rgba(255,255,255,0.0)"
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
          }}>
              INITIALIZE
          </button>
      </div>

      {/* ── 10k Lux Futuristic Glass Interface ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
          
          <div ref={coreCardRef} style={{
              width: "100%", maxWidth: "80vw", maxHeight: "85vh", aspectRatio: "1/1.2",
              background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px", padding: "6vw", display: "flex", flexDirection: "column",
              justifyContent: "space-between", alignItems: "center", opacity: 0,
              boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)"
          }}>
              
              {/* Corner Sci-Fi Accents */}
              <div style={{ position: "absolute", top: 20, left: 20, width: 20, height: 20, borderTop: "2px solid #D4AF37", borderLeft: "2px solid #D4AF37" }} />
              <div style={{ position: "absolute", top: 20, right: 20, width: 20, height: 20, borderTop: "2px solid #D4AF37", borderRight: "2px solid #D4AF37" }} />
              <div style={{ position: "absolute", bottom: 20, left: 20, width: 20, height: 20, borderBottom: "2px solid #D4AF37", borderLeft: "2px solid #D4AF37" }} />
              <div style={{ position: "absolute", bottom: 20, right: 20, width: 20, height: 20, borderBottom: "2px solid #D4AF37", borderRight: "2px solid #D4AF37" }} />

              {/* Title Header */}
              <div ref={titleRef} style={{
                  fontSize: "clamp(0.7rem, 1.2vw, 1rem)", letterSpacing: "0.4em", color: "rgba(224,229,236,0.6)",
                  textTransform: "uppercase", textAlign: "center", position: "relative", opacity: 0
              }}>
                  System Sync &nbsp;·&nbsp; {weddingConfig.celebrationTitle.toUpperCase()} &nbsp;·&nbsp; Authorized
              </div>

              {/* Center Names */}
              <div style={{ textAlign: "center", width: "100%", position: "relative" }}>
                  {/* Background Huge Blur for contrast */}
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "150%", height: "150%", background: "radial-gradient(circle, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)", zIndex: -1, pointerEvents: "none" }} />
                  
                  <h1 ref={namesRef} style={{
                      fontFamily: "'Orbitron', 'Inter', 'Oswald', sans-serif", fontSize: "clamp(3rem, 7vw, 6rem)", 
                      fontWeight: 800, margin: 0, lineHeight: 1.1, color: "#FFFFFF",
                      textShadow: "0 0 20px rgba(255,255,255,0.3)", opacity: 0,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"
                  }}>
                      <span style={{ display: "block" }}>{bName}</span>
                      <span ref={ampersandRef} style={{
                          display: "inline-block", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", color: "#D4AF37", 
                          fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
                          opacity: 0, transformOrigin: "center", textShadow: "0 0 15px rgba(212,175,55,0.6)"
                      }}>
                          &
                      </span>
                      <span style={{ display: "block" }}>{gName}</span>
                  </h1>
              </div>

              {/* Bottom Data Grid */}
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "30px" }}>
                  <div ref={detailOneRef} style={{ display: "flex", flexDirection: "column", gap: "4px", opacity: 0 }}>
                      <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#D4AF37" }}>STATUS: DATE_SYNC</span>
                      <span style={{ fontSize: "clamp(1rem, 1.5vw, 1.5rem)", fontWeight: 300, letterSpacing: "0.1em" }}>{dateText}</span>
                  </div>
                  
                  <div ref={detailTwoRef} style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end", textAlign: "right", opacity: 0 }}>
                      <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#D4AF37" }}>STATUS: LOCATION_LOCK</span>
                      <span style={{ fontSize: "clamp(1rem, 1.5vw, 1.5rem)", fontWeight: 300, letterSpacing: "0.1em" }}>{venueText}</span>
                  </div>
              </div>

          </div>
      </div>

    </div>
  );
}
