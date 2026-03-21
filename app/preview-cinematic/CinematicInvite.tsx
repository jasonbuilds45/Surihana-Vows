"use client";
/**
 * CinematicInvite.tsx
 *
 * Full 3D wedding cinematic using Three.js (npm package, no CDN).
 * Dynamically imported from page.tsx with ssr:false.
 *
 * WHAT'S IN THE 3D SCENE:
 *   • Wax seal — lathe geometry, gold PBR material, glowing rim, pulse + shatter
 *   • Floating rings — torus geometry, rose + gold, orbiting the monogram
 *   • Rose petals — ShapeGeometry teardrops, instanced, physics drift
 *   • Gold dust — Points cloud, ambient sparkle
 *   • Diamond — OctahedronGeometry, refractive look, slow spin
 *   • Floating spheres — warm ambient orbs drifting the scene
 *   • Text planes — Canvas2D → CanvasTexture → PlaneGeometry (reliable, no font loading)
 *   • Camera cinematic moves per chapter via smooth lerp
 *
 * CHAPTERS (auto-play, warm parchment theme):
 *   0 monogram 5s  — ML + orbiting rings + diamond centre
 *   1 bride    4.5s — Marion. huge text + rose petals intensify
 *   2 groom    4.5s — Livingston. gold palette
 *   3 date     4.5s — 20 May 2026 in 3D planes
 *   4 venues   5.5s — Church → Resort stacked
 *   5 quote    7s   — intro quote, slow orbit
 *   6 seal     ∞   — gold wax seal, click to shatter
 */

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { weddingConfig } from "@/lib/config";

// ── Data ──────────────────────────────────────────────────────────────────────
const BF      = weddingConfig.brideName.split(" ")[0]!;
const GF      = weddingConfig.groomName.split(" ")[0]!;
const BFFULL  = weddingConfig.brideName;
const GFFULL  = weddingConfig.groomName;
const INIT    = `${BF[0]}${GF[0]}`.toUpperCase();
const CELEB   = weddingConfig.celebrationTitle;
const QUOTE   = weddingConfig.introQuote;
const V1      = weddingConfig.venueName;
const V2      = weddingConfig.receptionVenueName;
const WDATE   = weddingConfig.weddingDate;

function daysLeft() {
  return Math.max(0, Math.floor((new Date(WDATE).getTime() - Date.now()) / 86_400_000));
}

// ── Chapters ──────────────────────────────────────────────────────────────────
const CHAPTERS = ["monogram","bride","groom","date","venues","quote","seal"] as const;
type Ch = typeof CHAPTERS[number];
const DURATIONS: Record<Ch,number> = {
  monogram:5000, bride:4500, groom:4500,
  date:4500, venues:5500, quote:7000, seal:0,
};

// ── Camera layout per chapter ─────────────────────────────────────────────────
const CAM: Record<Ch,{pos:[number,number,number]; look:[number,number,number]}> = {
  monogram: { pos:[0,  0, 10],  look:[0,   0,  0] },
  bride:    { pos:[-1, 0.5, 9], look:[-0.5,0.2,0] },
  groom:    { pos:[ 1, 0.5, 9], look:[ 0.5,0.2,0] },
  date:     { pos:[0,  0.5, 8], look:[0,   0.3,0] },
  venues:   { pos:[0, -0.5,10], look:[0,  -0.5,0] },
  quote:    { pos:[0,  0,  11], look:[0,   0,  0] },
  seal:     { pos:[0, -0.2, 8], look:[0,  -0.4,0] },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Build a PlaneGeometry mesh with text rendered on an offscreen canvas */
function textPlane(opts: {
  lines: Array<{text:string; size:number; color:string; font?:string; alpha?:number; ls?:number}>;
  w: number; h: number; bg?: string;
}): THREE.Mesh {
  const cv = document.createElement("canvas");
  const S  = 2;                         // retina scale
  cv.width  = opts.w * S;
  cv.height = opts.h * S;
  const ctx = cv.getContext("2d")!;
  ctx.scale(S, S);
  if (opts.bg) { ctx.fillStyle = opts.bg; ctx.fillRect(0,0,opts.w,opts.h); }
  let y = 16;
  for (const ln of opts.lines) {
    ctx.save();
    ctx.globalAlpha   = ln.alpha ?? 1;
    ctx.fillStyle     = ln.color;
    ctx.textAlign     = "center";
    ctx.font          = `${ln.font ?? "300"} ${ln.size}px 'Cormorant Garamond',Georgia,serif`;
    if (ln.ls) ctx.letterSpacing = `${ln.ls}px`;
    ctx.fillText(ln.text, opts.w / 2, y + ln.size * 0.82);
    ctx.restore();
    y += ln.size * 1.40;
  }
  const tex = new THREE.CanvasTexture(cv);
  const geo = new THREE.PlaneGeometry(opts.w / 100, opts.h / 100);
  const mat = new THREE.MeshBasicMaterial({ map:tex, transparent:true, depthWrite:false, side:THREE.DoubleSide });
  return new THREE.Mesh(geo, mat);
}

/** Lerp a Vector3 toward target */
function lerpVec(v: THREE.Vector3, target: [number,number,number], a: number) {
  v.lerp(new THREE.Vector3(...target), a);
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE BUILDER
// ══════════════════════════════════════════════════════════════════════════════
function buildScene(canvas: HTMLCanvasElement) {
  // ── Renderer ────────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setClearColor(0xFAF6F0, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ── Camera ───────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
  camera.position.set(0, 0, 10);

  // ── Scene ────────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xFAF6F0);
  scene.fog = new THREE.Fog(0xFAF6F0, 25, 80);

  // ── Lights ───────────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xFFF8F0, 2.0));

  const sun = new THREE.DirectionalLight(0xFFEDD0, 4.0);
  sun.position.set(5, 10, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const fill = new THREE.PointLight(0xFFCCCC, 2.5, 50);
  fill.position.set(-6, 4, 5);
  scene.add(fill);

  const gold = new THREE.PointLight(0xFFD060, 2.2, 50);
  gold.position.set(6, -3, 4);
  scene.add(gold);

  const rim = new THREE.PointLight(0xF8E8D0, 1.4, 60);
  rim.position.set(0, -8, -4);
  scene.add(rim);

  // ══════════════════════════════════════════════════════════════════════════
  // PERSISTENT 3D OBJECTS  (always in scene, repositioned per chapter)
  // ══════════════════════════════════════════════════════════════════════════

  // ── Rose petals (instanced) ────────────────────────────────────────────────
  const PETAL_N  = 120;
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0);
  petalShape.bezierCurveTo(-0.28, 0.12, -0.38, 0.65, 0, 1.05);
  petalShape.bezierCurveTo( 0.38, 0.65,  0.28, 0.12, 0, 0);
  const petalGeo = new THREE.ShapeGeometry(petalShape, 7);
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xE85070, emissive: 0x9A1828, emissiveIntensity: 0.12,
    side: THREE.DoubleSide, transparent: true, opacity: 0.65,
    roughness: 0.7, metalness: 0.0,
  });
  const petals = new THREE.InstancedMesh(petalGeo, petalMat, PETAL_N);
  petals.castShadow = false;
  scene.add(petals);

  const petalData = Array.from({ length: PETAL_N }, () => ({
    x:  (Math.random()-0.5)*32,
    y:  Math.random()*28 - 4,
    z:  (Math.random()-0.5)*16 - 3,
    vx: (Math.random()-0.5)*0.005,
    vy: -(Math.random()*0.004 + 0.0012),
    rx: Math.random()*Math.PI, ry: Math.random()*Math.PI, rz: Math.random()*Math.PI,
    sp: Math.random()*0.007 + 0.002,
    ph: Math.random()*Math.PI*2,
    sc: Math.random()*0.15 + 0.06,
  }));
  const _dummy = new THREE.Object3D();

  // ── Gold dust (points) ─────────────────────────────────────────────────────
  const DUST_N    = 300;
  const dustPos   = new Float32Array(DUST_N * 3);
  for (let i = 0; i < DUST_N; i++) {
    dustPos[i*3]   = (Math.random()-0.5)*30;
    dustPos[i*3+1] = (Math.random()-0.5)*24;
    dustPos[i*3+2] = (Math.random()-0.5)*18;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustPts = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xC89010, size: 0.07, transparent: true, opacity: 0.50, sizeAttenuation: true,
  }));
  scene.add(dustPts);

  // ── Floating ambient orbs ──────────────────────────────────────────────────
  const orbData = [
    { color: 0xFF8899, pos: [-7,  3, -5] as [number,number,number], sp: 0.5, ph: 0 },
    { color: 0xFFCC44, pos: [ 7, -2, -6] as [number,number,number], sp: 0.4, ph: 2 },
    { color: 0xFFCCAA, pos: [ 0,  7, -8] as [number,number,number], sp: 0.3, ph: 4 },
  ];
  const orbs = orbData.map(d => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 20, 20),
      new THREE.MeshStandardMaterial({
        color: d.color, emissive: d.color, emissiveIntensity: 1.8,
        transparent: true, opacity: 0.22, roughness: 1,
      })
    );
    m.position.set(...d.pos);
    scene.add(m);
    return { mesh: m, ...d };
  });

  // ── Monogram chapter: orbiting torus rings ─────────────────────────────────
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(3.0, 0.020, 12, 160),
    new THREE.MeshStandardMaterial({ color:0xC89010, emissive:0x906000, emissiveIntensity:0.55, roughness:0.3, metalness:0.85 })
  );
  ring1.rotation.x = 1.28;
  scene.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(3.25, 0.011, 8, 160),
    new THREE.MeshStandardMaterial({ color:0xBE2D45, emissive:0x8B1020, emissiveIntensity:0.45, roughness:0.4, transparent:true, opacity:0.55 })
  );
  ring2.rotation.x = 1.28;
  ring2.rotation.z = 0.65;
  scene.add(ring2);

  // ── Diamond (OctahedronGeometry) at monogram centre ────────────────────────
  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 1),
    new THREE.MeshStandardMaterial({
      color: 0xFFEECC, emissive: 0xCC8800, emissiveIntensity: 0.35,
      roughness: 0.08, metalness: 0.95,
      transparent: true, opacity: 0.88,
    })
  );
  diamond.position.set(0, 0, 0.5);
  scene.add(diamond);

  // ── Wax Seal (lathe + rim spikes) ─────────────────────────────────────────
  const sealPts: THREE.Vector2[] = [];
  for (let i = 0; i <= 28; i++) {
    const t = i / 28, r = 1.85 * Math.sin(t * Math.PI);
    sealPts.push(new THREE.Vector2(r, t * 0.30 - 0.15));
  }
  const sealMat = new THREE.MeshStandardMaterial({
    color: 0xC89010, emissive: 0x7A5000, emissiveIntensity: 0.50,
    roughness: 0.22, metalness: 0.92,
  });
  const sealMesh = new THREE.Mesh(new THREE.LatheGeometry(sealPts, 72), sealMat);
  sealMesh.castShadow = true;

  const spikeGroup = new THREE.Group();
  const spikeMat = new THREE.MeshStandardMaterial({ color:0xD4A020, emissive:0x906000, emissiveIntensity:0.38, roughness:0.28, metalness:0.88 });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2, r = i % 2 === 0 ? 1.92 : 1.70;
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.19, 4), spikeMat);
    sp.position.set(Math.cos(a)*r, Math.sin(a)*r, 0.17);
    sp.rotation.z = a;
    spikeGroup.add(sp);
  }

  const groove1 = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.030, 10, 100),
    new THREE.MeshStandardMaterial({ color:0x5C3800, roughness:0.5, metalness:0.72 }));
  const groove2 = new THREE.Mesh(new THREE.TorusGeometry(0.70, 0.022, 10, 100),
    new THREE.MeshStandardMaterial({ color:0x5C3800, roughness:0.5, metalness:0.72 }));

  const sealGroup = new THREE.Group();
  sealGroup.add(sealMesh, spikeGroup, groove1, groove2);

  // Initials text on seal face
  const initPlane = textPlane({
    lines:[{ text:INIT, size:58, color:"rgba(28,14,0,.82)", font:"600", ls:6 }],
    w:120, h:90,
  });
  initPlane.position.set(0, 0, 0.20);
  sealGroup.add(initPlane);
  scene.add(sealGroup);

  // ── Small decorative spheres ────────────────────────────────────────────────
  const deco = [-4,-2,2,4].map((x,i)=>{
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.12+i*0.04, 14, 14),
      new THREE.MeshStandardMaterial({
        color: i%2===0 ? 0xBE2D45 : 0xC89010,
        emissive: i%2===0 ? 0x8B1020 : 0x7A5000,
        emissiveIntensity: 0.6, roughness:0.3, metalness:0.7,
      })
    );
    m.position.set(x, 3.2, 0);
    scene.add(m);
    return m;
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEXT PLANES PER CHAPTER
  // Each chapter group contains the text planes for that chapter.
  // They are visible/invisible, positioned per chapter.
  // ══════════════════════════════════════════════════════════════════════════
  const days = daysLeft();

  function makeChapterGroup(ch: Ch): THREE.Group {
    const g = new THREE.Group();

    if (ch === "monogram") {
      g.add(Object.assign(textPlane({ lines:[{text:CELEB.toUpperCase(),size:22,color:"rgba(190,45,69,.70)",font:"600",ls:14}], w:600,h:50 }), { position: new THREE.Vector3(0, 3.2, 0) }));
      g.add(Object.assign(textPlane({ lines:[{text:INIT,size:260,color:"rgba(26,13,10,.85)",font:"300"}], w:560,h:330 }), { position: new THREE.Vector3(0, 0.2, 0) }));
      g.add(Object.assign(textPlane({ lines:[{text:`${BF}  &  ${GF}`,size:36,color:"rgba(26,13,10,.58)",font:"italic 300"}], w:560,h:70 }), { position: new THREE.Vector3(0, -2.4, 0) }));
      const dateText = `Wednesday · 20 May 2026${days>0?`   ·   ${days} days away`:""}`;
      g.add(Object.assign(textPlane({ lines:[{text:dateText,size:20,color:"rgba(154,108,6,.70)",font:"500",ls:5}], w:680,h:44 }), { position: new THREE.Vector3(0, -3.2, 0) }));
    }

    if (ch === "bride") {
      g.add(Object.assign(textPlane({ lines:[{text:CELEB.toUpperCase(),size:21,color:"rgba(190,45,69,.65)",font:"600",ls:14}], w:500,h:46 }), { position: new THREE.Vector3(-0.5,3.2,0) }));
      g.add(Object.assign(textPlane({ lines:[{text:`${BF}.`,size:240,color:"rgba(26,13,10,.88)",font:"300"}], w:680,h:300 }), { position: new THREE.Vector3(-0.5,0.2,0) }));
      g.add(Object.assign(textPlane({ lines:[{text:BFFULL.toUpperCase(),size:24,color:"rgba(26,13,10,.35)",font:"500",ls:12}], w:560,h:46 }), { position: new THREE.Vector3(-0.5,-2.2,0) }));
      // Rose horizontal line (thin plane)
      const line = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.008), new THREE.MeshBasicMaterial({ color:0xBE2D45, transparent:true, opacity:0.55 }));
      line.position.set(-0.5, -2.85, 0);
      g.add(line);
    }

    if (ch === "groom") {
      g.add(Object.assign(textPlane({ lines:[{text:CELEB.toUpperCase(),size:21,color:"rgba(154,108,6,.65)",font:"600",ls:14}], w:500,h:46 }), { position: new THREE.Vector3(0.5,3.2,0) }));
      g.add(Object.assign(textPlane({ lines:[{text:`${GF}.`,size:200,color:"rgba(122,85,0,.88)",font:"300"}], w:780,h:280 }), { position: new THREE.Vector3(0.5,0.2,0) }));
      g.add(Object.assign(textPlane({ lines:[{text:GFFULL.toUpperCase(),size:24,color:"rgba(26,13,10,.35)",font:"500",ls:12}], w:560,h:46 }), { position: new THREE.Vector3(0.5,-2.2,0) }));
      const line = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.008), new THREE.MeshBasicMaterial({ color:0xC89010, transparent:true, opacity:0.55 }));
      line.position.set(0.5, -2.85, 0);
      g.add(line);
    }

    if (ch === "date") {
      g.add(Object.assign(textPlane({ lines:[{text:"THE DATE",size:22,color:"rgba(26,13,10,.28)",font:"600",ls:16}], w:380,h:46 }), { position: new THREE.Vector3(0,2.8,0) }));
      g.add(Object.assign(textPlane({ lines:[{text:"20",size:240,color:"rgba(26,13,10,.20)",font:"300"}], w:320,h:310 }), { position: new THREE.Vector3(-3.5,0,0) }));
      g.add(Object.assign(textPlane({ lines:[{text:"May",size:240,color:"rgba(26,13,10,.88)",font:"300"}], w:420,h:310 }), { position: new THREE.Vector3(0,0,0) }));
      g.add(Object.assign(textPlane({ lines:[{text:"2026",size:200,color:"rgba(26,13,10,.20)",font:"300"}], w:500,h:300 }), { position: new THREE.Vector3(4.0,0,0) }));
      const hair = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 0.008), new THREE.MeshBasicMaterial({ color:0xC09010, transparent:true, opacity:0.55, blending:THREE.AdditiveBlending }));
      hair.position.set(0, -1.9, 0);
      g.add(hair);
      g.add(Object.assign(textPlane({ lines:[{text:`Wednesday${days>0?`   ·   ${days} days away`:""}`,size:26,color:"rgba(190,45,69,.72)",font:"600",ls:8}], w:680,h:52 }), { position: new THREE.Vector3(0,-2.65,0) }));
    }

    if (ch === "venues") {
      g.add(Object.assign(textPlane({ lines:[{text:"THE VENUES  ·  CHENNAI, TAMIL NADU",size:20,color:"rgba(26,13,10,.28)",font:"600",ls:10}], w:680,h:44 }), { position: new THREE.Vector3(0,3.2,0) }));
      g.add(Object.assign(textPlane({ lines:[{text:"3 PM",size:25,color:"rgba(190,45,69,.90)",font:"700",ls:10},{text:V1,size:70,color:"rgba(26,13,10,.88)",font:"italic 300"},{text:"Kelambakkam, Chennai",size:21,color:"rgba(26,13,10,.40)",font:"500"}], w:700,h:190 }), { position: new THREE.Vector3(0,0.9,0) }));
      // connector
      const conn = new THREE.Mesh(new THREE.PlaneGeometry(0.006, 1.0), new THREE.MeshBasicMaterial({ color:0xBE2D45, transparent:true, opacity:0.30 }));
      conn.position.set(-1.8, -0.55, 0);
      g.add(conn);
      g.add(Object.assign(textPlane({ lines:[{text:"then",size:18,color:"rgba(26,13,10,.25)",font:"italic 400",ls:10}], w:120,h:36 }), { position: new THREE.Vector3(-1.3,-0.55,0) }));
      g.add(Object.assign(textPlane({ lines:[{text:"6 PM",size:25,color:"rgba(154,108,6,.90)",font:"700",ls:10},{text:V2,size:55,color:"rgba(122,85,0,.88)",font:"italic 300"},{text:"Mahabalipuram · Bay of Bengal",size:21,color:"rgba(26,13,10,.40)",font:"500"}], w:700,h:175 }), { position: new THREE.Vector3(0,-2.1,0) }));
    }

    if (ch === "quote") {
      // Decorative quote mark
      g.add(Object.assign(textPlane({ lines:[{text:"\u201C",size:200,color:"rgba(190,45,69,.13)",font:"300"}], w:200,h:220 }), { position: new THREE.Vector3(-3.8,2.2,0) }));
      // Break quote into ~42-char lines
      const words = QUOTE.split(" ");
      const lines: string[] = [];
      let cur = "";
      for (const w of words) {
        if ((cur+" "+w).trim().length <= 44) { cur = (cur+" "+w).trim(); }
        else { if (cur) lines.push(cur); cur = w; }
      }
      if (cur) lines.push(cur);
      const lh = 0.62, tot = lines.length * lh;
      lines.forEach((line,i) => {
        const pl = textPlane({ lines:[{text:line,size:42,color:"rgba(26,13,10,.75)",font:"italic 300"}], w:800,h:78 });
        pl.position.set(0, tot/2 - i*lh - lh/2, 0);
        g.add(pl);
      });
      const rule = new THREE.Mesh(new THREE.PlaneGeometry(2.0,0.007), new THREE.MeshBasicMaterial({ color:0xC09010, transparent:true, opacity:0.55, blending:THREE.AdditiveBlending }));
      rule.position.set(0, -tot/2-0.55, 0);
      g.add(rule);
      g.add(Object.assign(textPlane({ lines:[{text:`${BF.toUpperCase()}  &  ${GF.toUpperCase()}`,size:21,color:"rgba(26,13,10,.30)",font:"600",ls:12}], w:480,h:42 }), { position: new THREE.Vector3(0,-tot/2-1.15,0) }));
    }

    if (ch === "seal") {
      g.add(Object.assign(textPlane({ lines:[{text:"YOUR INVITATION",size:21,color:"rgba(26,13,10,.38)",font:"600",ls:16}], w:480,h:44 }), { position: new THREE.Vector3(0,3.5,0) }));
      g.add(Object.assign(textPlane({ lines:[{text:`${BF} & ${GF}`,size:78,color:"rgba(26,13,10,.82)",font:"italic 300"}], w:580,h:118 }), { position: new THREE.Vector3(0,2.2,0) }));
      g.add(Object.assign(textPlane({ lines:[{text:"TAP THE SEAL TO ENTER",size:20,color:"rgba(26,13,10,.38)",font:"600",ls:14}], w:480,h:42 }), { position: new THREE.Vector3(0,-2.8,0) }));
    }

    return g;
  }

  // Build all chapter groups
  const chGroups: Record<Ch, THREE.Group> = {} as any;
  for (const ch of CHAPTERS) {
    chGroups[ch] = makeChapterGroup(ch);
    chGroups[ch].visible = false;
    scene.add(chGroups[ch]);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STATE
  // ══════════════════════════════════════════════════════════════════════════
  let currentCh: Ch  = "monogram";
  let chGroupOpacity = 0;
  let sealBursting   = false;
  let sealBurstT     = 0;
  let sealOpened     = false;
  const shards: Array<{m:THREE.Mesh; vel:THREE.Vector3; rot:THREE.Vector3}> = [];
  const camPos  = new THREE.Vector3(0,0,10);
  const camLook = new THREE.Vector3(0,0,0);

  // Show first chapter
  chGroups[currentCh].visible = true;

  // ── Positioning 3D objects per chapter ────────────────────────────────────
  function positionObjectsForChapter(ch: Ch) {
    // rings / diamond visible only on monogram
    ring1.visible   = ch === "monogram";
    ring2.visible   = ch === "monogram";
    diamond.visible = ch === "monogram";

    // seal only on seal chapter
    sealGroup.visible = ch === "seal" && !sealOpened;

    // deco spheres — visible on monogram + quote
    deco.forEach(d => { d.visible = (ch === "monogram" || ch === "quote"); });

    // petals colour changes
    petalMat.color.set(ch === "groom" ? 0xDDAA20 : 0xE85070);
    petalMat.emissive.set(ch === "groom" ? 0x8A6000 : 0x9A1828);
  }

  // ── Chapter switch ─────────────────────────────────────────────────────────
  function showChapter(ch: Ch) {
    chGroups[currentCh].visible = false;
    currentCh = ch;
    chGroups[ch].visible = true;
    chGroupOpacity = 0;
    positionObjectsForChapter(ch);
    // Fade group in
    gsap.fromTo(chGroups[ch].children.map(c=>c),
      { /* gsap can't tween Three.js material opacity via group, handled in tick */ }, {});
  }

  positionObjectsForChapter("monogram");
  chGroupOpacity = 1;

  // ── Seal burst ─────────────────────────────────────────────────────────────
  function triggerSeal() {
    if (sealBursting || sealOpened) return;
    sealBursting = true;
    sealBurstT   = 0;
    for (let i = 0; i < 18; i++) {
      const a = (i/18)*Math.PI*2;
      const sh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.32+Math.random()*0.22, 0.38+Math.random()*0.22),
        new THREE.MeshStandardMaterial({ color:0xD4A020, emissive:0xA06000, emissiveIntensity:1.5, transparent:true, opacity:1, side:THREE.DoubleSide })
      );
      sh.position.copy(sealGroup.position);
      shards.push({ m:sh, vel:new THREE.Vector3(Math.cos(a)*4.5,Math.sin(a)*4.5,2.5+Math.random()*3.5), rot:new THREE.Vector3(Math.random()*9,Math.random()*9,Math.random()*5) });
      scene.add(sh);
    }
  }

  // ── Raycaster ──────────────────────────────────────────────────────────────
  const ray   = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  function onCanvasClick(e: MouseEvent) {
    if (currentCh !== "seal" || sealOpened) return;
    const r = canvas.getBoundingClientRect();
    mouse.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
    mouse.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
    ray.setFromCamera(mouse, camera);
    if (ray.intersectObject(sealMesh, false).length > 0) triggerSeal();
  }
  canvas.addEventListener("click", onCanvasClick);

  // ── Resize ─────────────────────────────────────────────────────────────────
  const ro = new ResizeObserver(() => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  });
  ro.observe(canvas.parentElement ?? canvas);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER LOOP
  // ══════════════════════════════════════════════════════════════════════════
  const clock = new THREE.Clock();
  let raf = 0;

  function tick() {
    raf = requestAnimationFrame(tick);
    const t  = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05);

    // ── Camera smooth lerp ─────────────────────────────────────────────────
    const a = 1 - Math.pow(0.012, dt);
    lerpVec(camPos,  CAM[currentCh].pos,  a);
    lerpVec(camLook, CAM[currentCh].look, a);
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    // ── Chapter fade-in ────────────────────────────────────────────────────
    if (chGroupOpacity < 1) {
      chGroupOpacity = Math.min(1, chGroupOpacity + dt * 2.2);
      chGroups[currentCh].traverse(o => {
        if (o instanceof THREE.Mesh) {
          const m = o.material as THREE.Material;
          if ((m as any).transparent) (m as any).opacity = Math.min((m as any).opacity, chGroupOpacity);
        }
      });
    }

    // ── Petals ─────────────────────────────────────────────────────────────
    petalData.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      p.x += Math.sin(t*0.28+p.ph)*0.0018;
      p.rx += p.sp*0.55; p.ry += p.sp*0.38; p.rz += p.sp*0.22;
      if (p.y < -14) { p.y = 14; p.x = (Math.random()-0.5)*32; p.z = (Math.random()-0.5)*16; }
      _dummy.position.set(p.x, p.y, p.z);
      _dummy.rotation.set(p.rx, p.ry, p.rz);
      _dummy.scale.setScalar(p.sc);
      _dummy.updateMatrix();
      petals.setMatrixAt(i, _dummy.matrix);
    });
    petals.instanceMatrix.needsUpdate = true;

    // ── Gold dust drift ────────────────────────────────────────────────────
    dustPts.rotation.y = t * 0.035;
    dustPts.rotation.x = t * 0.016;

    // ── Orbs float ─────────────────────────────────────────────────────────
    orbs.forEach(o => {
      o.mesh.position.y = o.pos[1] + Math.sin(t*o.sp + o.ph)*0.5;
      o.mesh.position.x = o.pos[0] + Math.cos(t*o.sp*0.7 + o.ph)*0.3;
    });

    // ── Rings spin ─────────────────────────────────────────────────────────
    if (ring1.visible) {
      ring1.rotation.z = t * 0.22;
      ring2.rotation.z = -t * 0.16;
    }

    // ── Diamond spin ──────────────────────────────────────────────────────
    if (diamond.visible) {
      diamond.rotation.y = t * 0.8;
      diamond.rotation.x = t * 0.4;
      diamond.position.y = Math.sin(t*1.2)*0.18;
    }

    // ── Deco spheres orbit ─────────────────────────────────────────────────
    deco.forEach((d, i) => {
      d.position.y = 3.2 + Math.sin(t*0.6 + i*1.4)*0.22;
      d.position.x = [-4,-2,2,4][i]! + Math.sin(t*0.4 + i)*0.12;
    });

    // ── Chapter group gentle float ─────────────────────────────────────────
    const cg = chGroups[currentCh];
    cg.position.y = Math.sin(t * 0.35) * 0.07;
    if (currentCh === "monogram") cg.rotation.y = Math.sin(t*0.18)*0.05;

    // ── Seal pulse ────────────────────────────────────────────────────────
    if (currentCh === "seal" && !sealBursting && !sealOpened) {
      sealGroup.rotation.z = Math.sin(t*0.45)*0.045;
      sealGroup.scale.setScalar(1 + Math.sin(t*1.3)*0.020);
      sealGroup.position.y = Math.sin(t*0.8)*0.12;
    }

    // ── Seal burst animation ──────────────────────────────────────────────
    if (sealBursting) {
      sealBurstT += dt * 2.0;
      const pct  = Math.min(sealBurstT, 1);
      const ease = 1 - Math.pow(1-pct, 3);
      sealGroup.scale.setScalar(1 - ease*0.9);
      sealGroup.rotation.z += dt*9;
      sealMat.opacity = 1-ease;
      sealMat.transparent = true;
      shards.forEach((s, _i) => {
        const se = Math.min(sealBurstT*2.2, 1);
        const ep = 1 - Math.pow(1-se, 3);
        s.m.position.copy(sealGroup.position).addScaledVector(s.vel, ep);
        s.m.rotation.x = s.rot.x * ep;
        s.m.rotation.y = s.rot.y * ep;
        (s.m.material as THREE.MeshStandardMaterial).opacity = 1 - ep*0.92;
      });
      if (pct >= 1) {
        sealBursting = false; sealOpened = true;
        sealGroup.visible = false;
        shards.forEach(s => scene.remove(s.m));
        shards.length = 0;
        canvas.dispatchEvent(new CustomEvent("sealopened"));
      }
    }

    renderer.render(scene, camera);
  }

  tick();

  return {
    setChapter: showChapter,
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("click", onCanvasClick);
      renderer.dispose();
    },
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// REACT SHELL
// ══════════════════════════════════════════════════════════════════════════════
export default function CinematicInvite() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const engineRef  = useRef<ReturnType<typeof buildScene> | null>(null);
  const [chapter,  setChapter]  = useState<Ch>("monogram");
  const [unlocked, setUnlocked] = useState(false);
  const [fading,   setFading]   = useState(false);

  const chRef       = useRef<Ch>("monogram");
  const fadingRef   = useRef(false);
  const unlockedRef = useRef(false);
  const transTimer  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const autoTimer   = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(()=>{ chRef.current=chapter; },       [chapter]);
  useEffect(()=>{ fadingRef.current=fading; },    [fading]);
  useEffect(()=>{ unlockedRef.current=unlocked; },[unlocked]);

  // Build scene on mount
  useEffect(()=>{
    const cv = canvasRef.current;
    if (!cv) return;
    const engine = buildScene(cv);
    engineRef.current = engine;
    const onOpened = () => setUnlocked(true);
    cv.addEventListener("sealopened", onOpened);
    return () => { cv.removeEventListener("sealopened", onOpened); engine.destroy(); };
  }, []);

  const navigate = useCallback((dir: 1|-1)=>{
    if (unlockedRef.current || fadingRef.current) return;
    const idx  = CHAPTERS.indexOf(chRef.current);
    const next = CHAPTERS[idx+dir];
    if (!next) return;
    if (autoTimer.current)  clearTimeout(autoTimer.current);
    if (transTimer.current) clearTimeout(transTimer.current);
    fadingRef.current = true;
    setFading(true);
    transTimer.current = setTimeout(()=>{
      engineRef.current?.setChapter(next);
      chRef.current = next;
      setChapter(next);
      fadingRef.current = false;
      setFading(false);
    }, 360);
  }, []);

  // Auto-advance
  useEffect(()=>{
    if (unlocked) return;
    const dur = DURATIONS[chapter];
    if (!dur) return;
    autoTimer.current = setTimeout(()=>navigate(1), dur);
    return ()=>{ if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [chapter, unlocked, navigate]);

  // Keyboard + scroll — stable, registered once
  useEffect(()=>{
    let lastW = 0;
    function onKey(e:KeyboardEvent){
      if(["ArrowRight","ArrowDown"," "].includes(e.key)){e.preventDefault();navigate(1);}
      if(["ArrowLeft","ArrowUp"].includes(e.key)){e.preventDefault();navigate(-1);}
    }
    function onWheel(e:WheelEvent){
      const now=Date.now(); if(now-lastW<750) return; lastW=now;
      if(e.deltaY>30) navigate(1); if(e.deltaY<-30) navigate(-1);
    }
    window.addEventListener("keydown",onKey);
    window.addEventListener("wheel",onWheel,{passive:true});
    return ()=>{window.removeEventListener("keydown",onKey);window.removeEventListener("wheel",onWheel);};
  },[navigate]);

  // Touch
  const touchY = useRef<number|null>(null);
  function onTouchStart(e:React.TouchEvent){touchY.current=e.touches[0]!.clientY;}
  function onTouchEnd(e:React.TouchEvent){
    if(touchY.current===null) return;
    const dy=touchY.current-e.changedTouches[0]!.clientY; touchY.current=null;
    if(dy>55) navigate(1); if(dy<-55) navigate(-1);
  }

  useEffect(()=>{
    document.body.style.overflow    = unlocked ? "" : "hidden";
    document.body.style.touchAction = unlocked ? "" : "none";
    return ()=>{ document.body.style.overflow=""; document.body.style.touchAction=""; };
  },[unlocked]);

  const chIdx  = CHAPTERS.indexOf(chapter);
  const isFirst = chIdx===0;
  const isLast  = chapter==="seal";
  const C = { rose:"#BE2D45", gold:"#9A6C06", ink:"rgba(26,13,10,.85)", faint:"rgba(26,13,10,.22)" };

  return (
    <div style={{position:"fixed",inset:0,background:"#FAF6F0",overflow:"hidden"}}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* WebGL canvas */}
      <canvas ref={canvasRef} style={{
        position:"absolute",inset:0,width:"100%",height:"100%",display:"block",
        opacity: fading ? 0.35 : 1,
        transition:"opacity .36s ease",
      }}/>

      {/* ── OVERLAY ── */}
      {/* Sandbox badge */}
      <div style={{position:"fixed",top:"1.25rem",left:"1.25rem",zIndex:100,
        display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:999,
        background:"rgba(154,108,6,.08)",border:"1px solid rgba(154,108,6,.28)",pointerEvents:"none"}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:C.gold}}/>
        <span style={{fontFamily:"'Manrope',sans-serif",fontSize:".44rem",
          letterSpacing:".24em",textTransform:"uppercase",color:C.gold,fontWeight:600}}>
          Sandbox · 3D Preview
        </span>
      </div>

      {/* Chapter counter */}
      <div style={{position:"fixed",top:"1.25rem",right:"1.25rem",zIndex:100,
        fontFamily:"'Manrope',sans-serif",fontSize:".44rem",
        letterSpacing:".28em",textTransform:"uppercase",color:C.faint,pointerEvents:"none"}}>
        {String(chIdx+1).padStart(2,"0")} / {String(CHAPTERS.length).padStart(2,"0")}
      </div>

      {/* Progress bar */}
      {!unlocked && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,height:2,zIndex:100,background:"rgba(190,45,69,.08)"}}>
          <div style={{height:"100%",background:C.rose,
            width:`${((chIdx+1)/CHAPTERS.length)*100}%`,
            transition:"width .5s cubic-bezier(.4,0,.2,1)"}}/>
        </div>
      )}

      {/* Dots */}
      {!unlocked && (
        <div style={{position:"fixed",bottom:"1.75rem",left:"50%",
          transform:"translateX(-50%)",display:"flex",gap:".5rem",zIndex:100}}>
          {CHAPTERS.map((c,i)=>(
            <div key={c} onClick={()=>!fading&&!unlocked&&navigate(i>chIdx?1:-1)}
              style={{width:i===chIdx?22:6,height:6,borderRadius:999,cursor:"pointer",
                background:i===chIdx?C.rose:i<chIdx?"rgba(190,45,69,.35)":"rgba(190,45,69,.14)",
                transition:"all .4s cubic-bezier(.34,1.56,.64,1)"}}/>
          ))}
        </div>
      )}

      {/* Hint */}
      {chapter==="monogram" && !unlocked && (
        <div style={{position:"fixed",bottom:"3.75rem",left:"50%",
          transform:"translateX(-50%)",zIndex:100,pointerEvents:"none",
          fontFamily:"'Manrope',sans-serif",fontSize:".42rem",
          letterSpacing:".24em",textTransform:"uppercase",color:C.faint,
          whiteSpace:"nowrap",animation:"fadeUp .9s 2s ease both",opacity:0}}>
          Auto-playing · Scroll · Swipe · Space to skip
        </div>
      )}

      {/* Back */}
      {!isFirst && !unlocked && (
        <button onClick={()=>navigate(-1)} style={{position:"fixed",bottom:"3.5rem",left:"1.75rem",
          zIndex:100,background:"none",border:"none",cursor:"pointer",opacity:.35,
          transition:"opacity .2s",padding:4}}
          onMouseEnter={e=>(e.currentTarget.style.opacity="0.85")}
          onMouseLeave={e=>(e.currentTarget.style.opacity="0.35")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={C.rose} strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      )}

      {/* Forward */}
      {!isLast && !unlocked && (
        <button onClick={()=>navigate(1)} style={{position:"fixed",bottom:"3.5rem",right:"1.75rem",
          zIndex:100,background:"none",border:"none",cursor:"pointer",opacity:.45,
          animation:"bounceDown 2.2s ease-in-out infinite",padding:4}}
          onMouseEnter={e=>(e.currentTarget.style.opacity="0.85")}
          onMouseLeave={e=>(e.currentTarget.style.opacity="0.45")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={C.rose} strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </button>
      )}

      {/* Unlocked */}
      {unlocked && (
        <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",
          flexDirection:"column",alignItems:"center",justifyContent:"center",
          background:"rgba(250,246,240,.90)",backdropFilter:"blur(18px)",
          animation:"fadeIn .6s ease both"}}>
          <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontStyle:"italic",fontSize:"clamp(1.2rem,3vw,2rem)",
            color:C.ink,marginBottom:"2rem",letterSpacing:".06em"}}>
            Welcome. Your invitation awaits.
          </p>
          <a href="/invite/general" style={{display:"inline-flex",alignItems:"center",
            gap:".625rem",padding:"13px 32px",borderRadius:999,
            background:"linear-gradient(135deg,#D44860 0%,#BE2D45 100%)",
            color:"#fff",textDecoration:"none",fontFamily:"'Manrope',sans-serif",
            fontSize:".70rem",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",
            boxShadow:"0 6px 28px rgba(190,45,69,.28)",marginBottom:"1rem"}}>
            View Invitation →
          </a>
          <p style={{fontFamily:"'Manrope',sans-serif",fontSize:".52rem",
            color:C.faint,letterSpacing:".18em",textTransform:"uppercase"}}>
            Sandbox · opens /invite/general
          </p>
        </div>
      )}

      <style>{`
        @keyframes bounceDown{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
    </div>
  );
}
