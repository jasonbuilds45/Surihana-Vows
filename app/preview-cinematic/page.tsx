"use client";
/**
 * /preview-cinematic — Self-contained 3D Wedding Cinematic (Light Theme)
 *
 * Architecture: A full-screen <canvas> driven by plain Three.js loaded via
 * importmap + ES module. Zero React-Three-Fiber, zero SSR issues, zero
 * black-screen risk. The canvas renders directly in a <div> that fills the
 * viewport. React only manages the chapter state and HTML overlay.
 *
 * Three.js is loaded from jsDelivr CDN (esm build) via a dynamic import
 * inside a useEffect — completely client-side, no SSR.
 *
 * LIGHT THEME palette:
 *   Background:  #FAF6F0  warm parchment
 *   Primary text: #1A0D0A  near-black ink
 *   Rose accent:  #BE2D45
 *   Gold accent:  #B07D10
 *   Soft rose:    rgba(190,45,69,.08)
 *
 * CHAPTERS (auto-play, 5s each, seal is manual):
 *   0 · Monogram   — ML initials, orbiting rings, petal rain
 *   1 · Bride      — Marion. — enormous serif, left bleed
 *   2 · Groom      — Livingston. — right, warm gold
 *   3 · Date       — 20 / May / 2026 in floating numerals
 *   4 · Venues     — Church → Resort, vertical connector
 *   5 · Quote      — intro quote, slow orbit
 *   6 · Seal       — gold wax seal, click to shatter
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { weddingConfig } from "@/lib/config";

// ── Wedding data ──────────────────────────────────────────────────────────────
const BF     = weddingConfig.brideName.split(" ")[0]!;          // Marion
const GF     = weddingConfig.groomName.split(" ")[0]!;          // Livingston
const BFFULL = weddingConfig.brideName;
const GFFULL = weddingConfig.groomName;
const INIT   = `${BF[0]}${GF[0]}`.toUpperCase();               // ML
const CELEB  = weddingConfig.celebrationTitle;                  // The Union
const QUOTE  = weddingConfig.introQuote;
const V1     = weddingConfig.venueName;
const V2     = weddingConfig.receptionVenueName;
const WDATE  = weddingConfig.weddingDate;

// ── Chapters ──────────────────────────────────────────────────────────────────
const CHAPTERS = ["monogram","bride","groom","date","venues","quote","seal"] as const;
type Ch = typeof CHAPTERS[number];

const DURATIONS: Record<Ch, number> = {
  monogram: 5000, bride: 4500, groom: 4500,
  date: 4500, venues: 5500, quote: 7000, seal: 0,
};

// ── Palette (light) ───────────────────────────────────────────────────────────
const PAL = {
  bg:     "#FAF6F0",
  ink:    "#1A0D0A",
  inkMid: "rgba(26,13,10,.55)",
  inkFaint:"rgba(26,13,10,.22)",
  rose:   "#BE2D45",
  roseL:  "rgba(190,45,69,.12)",
  gold:   "#9E6D08",
  goldL:  "rgba(158,109,8,.15)",
  cream:  "#F2E8DC",
  border: "rgba(190,45,69,.18)",
};

// ═══════════════════════════════════════════════════════════════════════════════
// THREE.JS CANVAS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

type EngineHandle = { destroy: () => void; setChapter: (c: Ch) => void };

async function buildEngine(canvas: HTMLCanvasElement, onReady: () => void): Promise<EngineHandle> {
  // Load Three.js from CDN via indirect dynamic import (avoids Webpack static analysis)
  const THREE = await new Function('return import("https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js")')() as typeof import("three");

  const W = () => canvas.clientWidth;
  const H = () => canvas.clientHeight;

  // ── Renderer ────────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(0xFAF6F0, 1);
  renderer.shadowMap.enabled = true;

  // ── Camera ───────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(52, W() / H(), 0.1, 300);
  camera.position.set(0, 0, 11);

  // ── Scene ────────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xFAF6F0);
  scene.fog = new THREE.FogExp2(0xFAF6F0, 0.018);

  // ── Lights ───────────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xFFF8F0, 1.8));
  const sun = new THREE.DirectionalLight(0xFFEDD0, 3.5);
  sun.position.set(4, 8, 6);
  scene.add(sun);
  const fill = new THREE.PointLight(0xFFCCCC, 2.0, 40);
  fill.position.set(-5, 3, 4);
  scene.add(fill);
  const gold = new THREE.PointLight(0xFFD080, 1.8, 35);
  gold.position.set(5, -2, 3);
  scene.add(gold);
  const back = new THREE.PointLight(0xF0E8D8, 1.0, 50);
  back.position.set(0, -6, -5);
  scene.add(back);

  // ═══════════════════════════════════════════════════════════════════════════
  // PETAL SYSTEM  (instanced, rose colour)
  // ═══════════════════════════════════════════════════════════════════════════
  const PETAL_N = 140;
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0,0);
  petalShape.bezierCurveTo(-0.3,0.15,-0.4,0.7,0,1.1);
  petalShape.bezierCurveTo(0.4,0.7,0.3,0.15,0,0);
  const petalGeo = new THREE.ShapeGeometry(petalShape, 6);
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xE85070, emissive: 0xAA1830, emissiveIntensity: 0.08,
    side: THREE.DoubleSide, transparent: true, opacity: 0.60,
    roughness: 0.7, metalness: 0.0,
  });
  const petals = new THREE.InstancedMesh(petalGeo, petalMat, PETAL_N);
  scene.add(petals);

  const petalData = Array.from({length: PETAL_N}, () => ({
    x: (Math.random()-0.5)*30, y: (Math.random()-0.5)*22+3,
    z: (Math.random()-0.5)*14-2,
    vx: (Math.random()-0.5)*0.005, vy: -(Math.random()*0.004+0.0015),
    rx: Math.random()*Math.PI, ry: Math.random()*Math.PI, rz: Math.random()*Math.PI,
    sp: Math.random()*0.007+0.002, ph: Math.random()*Math.PI*2,
    sc: Math.random()*0.16+0.07,
  }));
  const _dummy = new THREE.Object3D();

  function updatePetals(t: number) {
    petalData.forEach((p,i)=>{
      p.x += p.vx; p.y += p.vy;
      p.x += Math.sin(t*0.25+p.ph)*0.0018;
      p.rx += p.sp*0.5; p.ry += p.sp*0.35; p.rz += p.sp*0.25;
      if(p.y < -13){ p.y=13; p.x=(Math.random()-0.5)*30; p.z=(Math.random()-0.5)*14; }
      _dummy.position.set(p.x,p.y,p.z);
      _dummy.rotation.set(p.rx,p.ry,p.rz);
      _dummy.scale.setScalar(p.sc);
      _dummy.updateMatrix();
      petals.setMatrixAt(i,_dummy.matrix);
    });
    petals.instanceMatrix.needsUpdate = true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GOLD DUST  (points)
  // ═══════════════════════════════════════════════════════════════════════════
  const DUST_N = 280;
  const dustPos = new Float32Array(DUST_N*3);
  for(let i=0;i<DUST_N;i++){
    dustPos[i*3]   = (Math.random()-0.5)*28;
    dustPos[i*3+1] = (Math.random()-0.5)*22;
    dustPos[i*3+2] = (Math.random()-0.5)*16;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos,3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xC8900A, size: 0.06, transparent: true, opacity: 0.55,
    sizeAttenuation: true,
  });
  const dust = new THREE.Points(dustGeo,dustMat);
  scene.add(dust);

  // ═══════════════════════════════════════════════════════════════════════════
  // WAX SEAL GEOMETRY
  // ═══════════════════════════════════════════════════════════════════════════
  const sealPts: THREE.Vector2[] = [];
  for(let i=0;i<=28;i++){
    const t=i/28, r=1.9*Math.sin(t*Math.PI);
    sealPts.push(new THREE.Vector2(r, t*0.32-0.16));
  }
  const sealGeo = new THREE.LatheGeometry(sealPts, 72);
  const sealMat = new THREE.MeshStandardMaterial({
    color: 0xC89010, emissive: 0x7A5000, emissiveIntensity: 0.45,
    roughness: 0.25, metalness: 0.9,
  });
  const sealMesh = new THREE.Mesh(sealGeo, sealMat);

  // Rim spikes
  const rimGroup = new THREE.Group();
  const spikeMat = new THREE.MeshStandardMaterial({
    color: 0xD4A020, emissive: 0x906000, emissiveIntensity: 0.35,
    roughness: 0.3, metalness: 0.85,
  });
  for(let i=0;i<24;i++){
    const a=(i/24)*Math.PI*2, r=i%2===0?1.95:1.72;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.055,0.2,4), spikeMat);
    spike.position.set(Math.cos(a)*r, Math.sin(a)*r, 0.18);
    spike.rotation.z = a;
    rimGroup.add(spike);
  }

  // Groove rings
  const groove1 = new THREE.Mesh(
    new THREE.TorusGeometry(1.25,0.032,10,90),
    new THREE.MeshStandardMaterial({color:0x5C3800,roughness:0.5,metalness:0.7})
  );
  const groove2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.72,0.022,10,90),
    new THREE.MeshStandardMaterial({color:0x5C3800,roughness:0.5,metalness:0.7})
  );

  const sealGroup = new THREE.Group();
  sealGroup.add(sealMesh, rimGroup, groove1, groove2);

  // ═══════════════════════════════════════════════════════════════════════════
  // CANVAS TEXT RENDERER  (2D canvas → texture → plane)
  // ═══════════════════════════════════════════════════════════════════════════
  function makeTextPlane(opts: {
    lines: Array<{text:string; size:number; color:string; font?:string; alpha?:number; spacing?:number}>;
    w: number; h: number;
    bg?: string; pad?: number;
  }): THREE.Mesh {
    const cv = document.createElement("canvas");
    cv.width  = opts.w * 2;
    cv.height = opts.h * 2;
    const ctx = cv.getContext("2d")!;
    ctx.scale(2, 2);
    if(opts.bg){ ctx.fillStyle = opts.bg; ctx.fillRect(0,0,opts.w,opts.h); }
    let y = (opts.pad ?? 20);
    for(const line of opts.lines){
      ctx.globalAlpha = line.alpha ?? 1;
      ctx.fillStyle   = line.color;
      ctx.font        = `${line.font ?? "300"} ${line.size}px 'Cormorant Garamond', Georgia, serif`;
      ctx.textAlign   = "center";
      ctx.letterSpacing = line.spacing ? `${line.spacing}px` : "0px";
      ctx.fillText(line.text, opts.w/2, y + line.size * 0.78);
      y += line.size * 1.35;
    }
    const tex = new THREE.CanvasTexture(cv);
    const geo = new THREE.PlaneGeometry(opts.w/100, opts.h/100);
    const mat = new THREE.MeshBasicMaterial({map:tex, transparent:true, depthWrite:false, side:THREE.DoubleSide});
    return new THREE.Mesh(geo, mat);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER SCENE GROUPS
  // ═══════════════════════════════════════════════════════════════════════════
  const groups: Partial<Record<Ch, THREE.Group>> = {};

  // ── MONOGRAM ─────────────────────────────────────────────────────────────
  function buildMonogram(): THREE.Group {
    const g = new THREE.Group();

    // Celebration label
    const labelPlane = makeTextPlane({
      lines:[{text:CELEB.toUpperCase(), size:28, color:"rgba(190,45,69,0.70)",
              font:"500", spacing:14}],
      w:600, h:60,
    });
    labelPlane.position.set(0,3.2,0);
    g.add(labelPlane);

    // Giant initials
    const initPlane = makeTextPlane({
      lines:[{text:INIT, size:260, color:"#1A0D0A", font:"300", alpha:0.88}],
      w:580, h:340,
    });
    initPlane.position.set(0,0.3,0);
    g.add(initPlane);

    // Orbiting torus rings
    const r1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.016, 10, 150),
      new THREE.MeshStandardMaterial({color:0xC09010, emissive:0x906000, emissiveIntensity:0.6, roughness:0.3, metalness:0.8})
    );
    r1.rotation.x = Math.PI/2.3;
    g.add(r1);
    const r2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.0, 0.009, 8, 150),
      new THREE.MeshStandardMaterial({color:0xBE2D45, emissive:0x8B1020, emissiveIntensity:0.5,
        roughness:0.4, metalness:0.5, transparent:true, opacity:0.55})
    );
    r2.rotation.x = Math.PI/2.3;
    r2.rotation.z = Math.PI/5;
    g.add(r2);

    // Names
    const namePlane = makeTextPlane({
      lines:[{text:`${BF}  &  ${GF}`, size:38, color:"rgba(26,13,10,0.62)", font:"italic 300"}],
      w:600, h:70,
    });
    namePlane.position.set(0,-2.5,0);
    g.add(namePlane);

    // Date
    const days = Math.max(0, Math.floor((new Date(WDATE).getTime()-Date.now())/86400000));
    const datePlane = makeTextPlane({
      lines:[{
        text:`Wednesday · 20 May 2026${days>0?`   ·   ${days} days away`:""}`,
        size:22, color:"rgba(158,109,8,0.70)", font:"500", spacing:5,
      }],
      w:700, h:50,
    });
    datePlane.position.set(0,-3.25,0);
    g.add(datePlane);

    return g;
  }

  // ── BRIDE ─────────────────────────────────────────────────────────────────
  function buildBride(): THREE.Group {
    const g = new THREE.Group();

    // Huge first name — left anchored
    const bigPlane = makeTextPlane({
      lines:[{text:`${BF}.`, size:240, color:"#1A0D0A", font:"300"}],
      w:700, h:310,
    });
    bigPlane.position.set(-0.8,0.2,0);
    g.add(bigPlane);

    // Full name
    const subPlane = makeTextPlane({
      lines:[{text:BFFULL.toUpperCase(), size:26, color:"rgba(26,13,10,0.38)", font:"500", spacing:12}],
      w:600,h:50,
    });
    subPlane.position.set(-0.8,-2.1,0);
    g.add(subPlane);

    // Rose rule
    const ruleMat = new THREE.MeshBasicMaterial({color:0xBE2D45, transparent:true, opacity:0.55});
    const rule = new THREE.Mesh(new THREE.PlaneGeometry(2.2,0.008), ruleMat);
    rule.position.set(-0.8,-2.75,0);
    g.add(rule);

    // Eyebrow
    const eyePlane = makeTextPlane({
      lines:[{text:CELEB.toUpperCase(), size:22, color:"rgba(190,45,69,0.65)", font:"600", spacing:14}],
      w:500,h:45,
    });
    eyePlane.position.set(-0.8,3.2,0);
    g.add(eyePlane);

    return g;
  }

  // ── GROOM ─────────────────────────────────────────────────────────────────
  function buildGroom(): THREE.Group {
    const g = new THREE.Group();

    const bigPlane = makeTextPlane({
      lines:[{text:`${GF}.`, size:190, color:"#7A5500", font:"300"}],
      w:780, h:280,
    });
    bigPlane.position.set(0.8,0.2,0);
    g.add(bigPlane);

    const subPlane = makeTextPlane({
      lines:[{text:GFFULL.toUpperCase(), size:26, color:"rgba(26,13,10,0.38)", font:"500", spacing:12}],
      w:600,h:50,
    });
    subPlane.position.set(0.8,-2.1,0);
    g.add(subPlane);

    const ruleMat = new THREE.MeshBasicMaterial({color:0xB07D10, transparent:true, opacity:0.55});
    const rule = new THREE.Mesh(new THREE.PlaneGeometry(2.2,0.008), ruleMat);
    rule.position.set(0.8,-2.75,0);
    g.add(rule);

    const eyePlane = makeTextPlane({
      lines:[{text:CELEB.toUpperCase(), size:22, color:"rgba(158,109,8,0.65)", font:"600", spacing:14}],
      w:500,h:45,
    });
    eyePlane.position.set(0.8,3.2,0);
    g.add(eyePlane);

    return g;
  }

  // ── DATE ──────────────────────────────────────────────────────────────────
  function buildDate(): THREE.Group {
    const g = new THREE.Group();

    // "THE DATE" label
    const lbl = makeTextPlane({
      lines:[{text:"THE DATE", size:24, color:"rgba(26,13,10,0.30)", font:"600", spacing:16}],
      w:400,h:50,
    });
    lbl.position.set(0,2.8,0);
    g.add(lbl);

    // 20
    const p20 = makeTextPlane({
      lines:[{text:"20", size:240, color:"rgba(26,13,10,0.22)", font:"300"}],
      w:340,h:310,
    });
    p20.position.set(-3.5,0,0);
    g.add(p20);

    // May — full opacity, dominant
    const pMay = makeTextPlane({
      lines:[{text:"May", size:240, color:"#1A0D0A", font:"300"}],
      w:440,h:310,
    });
    pMay.position.set(0,0,0);
    g.add(pMay);

    // 2026
    const p26 = makeTextPlane({
      lines:[{text:"2026", size:200, color:"rgba(26,13,10,0.22)", font:"300"}],
      w:500,h:310,
    });
    p26.position.set(4.0,0,0);
    g.add(p26);

    // Gold hairline
    const hairMat = new THREE.MeshBasicMaterial({color:0xC09010, transparent:true, opacity:0.55});
    g.add(Object.assign(new THREE.Mesh(new THREE.PlaneGeometry(7,0.008),hairMat),{position:new THREE.Vector3(0,-1.9,0)}));

    // Day string
    const days = Math.max(0,Math.floor((new Date(WDATE).getTime()-Date.now())/86400000));
    const dayPl = makeTextPlane({
      lines:[{text:`Wednesday${days>0?`   ·   ${days} days away`:""}`,
              size:28, color:"rgba(190,45,69,0.72)", font:"600", spacing:8}],
      w:700,h:55,
    });
    dayPl.position.set(0,-2.6,0);
    g.add(dayPl);

    return g;
  }

  // ── VENUES ────────────────────────────────────────────────────────────────
  function buildVenues(): THREE.Group {
    const g = new THREE.Group();

    const head = makeTextPlane({
      lines:[{text:"THE VENUES  ·  CHENNAI, TAMIL NADU", size:20,
              color:"rgba(26,13,10,0.32)", font:"600", spacing:10}],
      w:700,h:44,
    });
    head.position.set(0,3.2,0);
    g.add(head);

    // Church
    const ch = makeTextPlane({
      lines:[
        {text:"3 PM", size:26, color:"rgba(190,45,69,0.90)", font:"700", spacing:10},
        {text:V1, size:68, color:"#1A0D0A", font:"italic 300"},
        {text:"Kelambakkam, Chennai", size:22, color:"rgba(26,13,10,0.42)", font:"500", spacing:4},
      ],
      w:700, h:190,
    });
    ch.position.set(0,1.0,0);
    g.add(ch);

    // Connector
    const connMat = new THREE.MeshBasicMaterial({color:0xBE2D45, transparent:true, opacity:0.30});
    const conn = new THREE.Mesh(new THREE.PlaneGeometry(0.006,1.1),connMat);
    conn.position.set(0,-0.5,0);
    g.add(conn);

    const thenPl = makeTextPlane({
      lines:[{text:"THEN", size:18, color:"rgba(26,13,10,0.28)", font:"600", spacing:14}],
      w:120,h:36,
    });
    thenPl.position.set(0.5,-0.5,0);
    g.add(thenPl);

    // Resort
    const rs = makeTextPlane({
      lines:[
        {text:"6 PM", size:26, color:"rgba(158,109,8,0.90)", font:"700", spacing:10},
        {text:V2, size:52, color:"#7A5500", font:"italic 300"},
        {text:"Mahabalipuram · Bay of Bengal", size:22, color:"rgba(26,13,10,0.42)", font:"500", spacing:4},
      ],
      w:700, h:170,
    });
    rs.position.set(0,-2.0,0);
    g.add(rs);

    return g;
  }

  // ── QUOTE ─────────────────────────────────────────────────────────────────
  function buildQuote(): THREE.Group {
    const g = new THREE.Group();

    // Decorative " mark
    const qm = makeTextPlane({
      lines:[{text:"\u201C", size:200, color:"rgba(190,45,69,0.14)", font:"300"}],
      w:200,h:220,
    });
    qm.position.set(-4.0,2.2,0);
    g.add(qm);

    // Wrap quote into max ~42 char lines manually
    const words = QUOTE.split(" ");
    const maxW = 42;
    const qLines: string[] = [];
    let cur = "";
    for(const w of words){
      if((cur+" "+w).trim().length <= maxW){ cur = (cur+" "+w).trim(); }
      else { if(cur) qLines.push(cur); cur=w; }
    }
    if(cur) qLines.push(cur);

    // Each line is a separate plane stacked vertically
    const lineH = 0.65;
    const totalH = qLines.length * lineH;
    qLines.forEach((line,i)=>{
      const pl = makeTextPlane({
        lines:[{text:line, size:44, color:"rgba(26,13,10,0.78)", font:"italic 300"}],
        w:800,h:80,
      });
      pl.position.set(0, totalH/2 - i*lineH - lineH/2, 0);
      g.add(pl);
    });

    // Gold rule
    const rMat = new THREE.MeshBasicMaterial({color:0xC09010, transparent:true, opacity:0.55});
    g.add(Object.assign(new THREE.Mesh(new THREE.PlaneGeometry(2.2,0.007),rMat),
      {position: new THREE.Vector3(0, -totalH/2-0.5, 0)}));

    // Attribution
    const attr = makeTextPlane({
      lines:[{text:`${BF.toUpperCase()}  &  ${GF.toUpperCase()}`, size:22,
              color:"rgba(26,13,10,0.32)", font:"600", spacing:12}],
      w:500,h:44,
    });
    attr.position.set(0,-totalH/2-1.1,0);
    g.add(attr);

    return g;
  }

  // ── SEAL ──────────────────────────────────────────────────────────────────
  function buildSeal(): THREE.Group {
    const g = new THREE.Group();

    const inv = makeTextPlane({
      lines:[{text:"YOUR INVITATION", size:22, color:"rgba(26,13,10,0.40)", font:"600", spacing:16}],
      w:500,h:44,
    });
    inv.position.set(0,3.6,0);
    g.add(inv);

    const names = makeTextPlane({
      lines:[{text:`${BF} & ${GF}`, size:80, color:"#1A0D0A", font:"italic 300"}],
      w:600,h:120,
    });
    names.position.set(0,2.2,0);
    g.add(names);

    // Seal mesh at centre
    sealGroup.position.set(0,0,0);
    sealGroup.scale.setScalar(1);
    g.add(sealGroup);

    const hint = makeTextPlane({
      lines:[{text:"TAP THE SEAL TO ENTER", size:22, color:"rgba(26,13,10,0.40)", font:"600", spacing:14}],
      w:500,h:44,
    });
    hint.position.set(0,-2.8,0);
    hint.name = "sealHint";
    g.add(hint);

    return g;
  }

  // Build all groups (hidden initially)
  const allGroups: Record<Ch, THREE.Group> = {
    monogram: buildMonogram(),
    bride:    buildBride(),
    groom:    buildGroom(),
    date:     buildDate(),
    venues:   buildVenues(),
    quote:    buildQuote(),
    seal:     buildSeal(),
  };
  Object.values(allGroups).forEach(g => { g.visible = false; scene.add(g); });

  // ── Camera targets per chapter ────────────────────────────────────────────
  const camPos: Record<Ch,[number,number,number]> = {
    monogram: [0,  0, 11], bride:  [-0.5, 0.2, 10],
    groom:    [ 0.5, 0.2, 10], date: [0, 0.3, 9],
    venues:   [0, -0.2, 11], quote: [0, 0, 12],
    seal:     [0, -0.1, 9],
  };
  const camLook: Record<Ch,[number,number,number]> = {
    monogram:[0,0,0], bride:[-0.5,0,0], groom:[0.5,0,0],
    date:[0,0,0], venues:[0,-0.3,0], quote:[0,0,0], seal:[0,-0.2,0],
  };

  // ── State ─────────────────────────────────────────────────────────────────
  let currentCh: Ch = "monogram";
  let prevCh: Ch | null = null;
  let chAlpha = 1; // 0=hidden, 1=visible
  let sealBursting = false;
  let sealBurstT = 0;
  let sealOpened = false;
  const shards: Array<{m:THREE.Mesh; vel:THREE.Vector3; rot:THREE.Vector3; born:number}> = [];

  function showChapter(ch: Ch) {
    if(prevCh && allGroups[prevCh]) allGroups[prevCh]!.visible = false;
    prevCh = currentCh;
    currentCh = ch;
    allGroups[ch]!.visible = true;
    chAlpha = 0;
  }

  showChapter("monogram");
  chAlpha = 1;

  // ── Seal burst ────────────────────────────────────────────────────────────
  function burstSeal() {
    if(sealBursting || sealOpened) return;
    sealBursting = true; sealBurstT = 0;
    // Create shards
    for(let i=0;i<16;i++){
      const a=(i/16)*Math.PI*2;
      const shard = new THREE.Mesh(
        new THREE.PlaneGeometry(0.35+Math.random()*0.2, 0.4+Math.random()*0.2),
        new THREE.MeshStandardMaterial({
          color:0xD4A020, emissive:0xA06000, emissiveIntensity:1.5,
          transparent:true, opacity:1, side:THREE.DoubleSide,
        })
      );
      shard.position.copy(sealGroup.position);
      const vel = new THREE.Vector3(Math.cos(a)*4, Math.sin(a)*4, 2+Math.random()*3);
      shards.push({m:shard, vel, rot:new THREE.Vector3(Math.random()*8,Math.random()*8,Math.random()*5), born:0});
      scene.add(shard);
    }
  }

  // ── Raycaster for seal click ───────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  function onCanvasClick(ev: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    mouse.x =  ((ev.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((ev.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    if(currentCh === "seal" && !sealOpened) {
      const hits = raycaster.intersectObject(sealMesh, false);
      if(hits.length > 0) burstSeal();
    }
  }
  canvas.addEventListener("click", onCanvasClick);

  // ── Resize ────────────────────────────────────────────────────────────────
  const ro = new ResizeObserver(() => {
    renderer.setSize(W(), H(), false);
    camera.aspect = W()/H();
    camera.updateProjectionMatrix();
  });
  ro.observe(canvas);

  // ── Animate ───────────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  const camTargetPos = new THREE.Vector3(0,0,11);
  const camTargetLook = new THREE.Vector3(0,0,0);
  const camLookCurrent = new THREE.Vector3(0,0,0);
  let animId = 0;

  function tick() {
    animId = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    const dt = clock.getDelta();

    // Camera lerp
    const cp = camPos[currentCh];
    const cl = camLook[currentCh];
    camTargetPos.set(cp[0],cp[1],cp[2]);
    camTargetLook.set(cl[0],cl[1],cl[2]);
    camera.position.lerp(camTargetPos, 1-Math.pow(0.01, dt));
    camLookCurrent.lerp(camTargetLook, 1-Math.pow(0.01, dt));
    camera.lookAt(camLookCurrent);

    // Chapter fade-in
    if(chAlpha < 1) {
      chAlpha = Math.min(1, chAlpha + dt*2.4);
      const g = allGroups[currentCh];
      if(g) g.traverse(o => {
        if(o instanceof THREE.Mesh && (o.material as THREE.MeshBasicMaterial).transparent)
          (o.material as THREE.MeshBasicMaterial).opacity = chAlpha;
      });
    }

    // Petals
    updatePetals(t);

    // Dust rotation
    dust.rotation.y = t*0.04;
    dust.rotation.x = t*0.018;

    // Group subtle float
    const cg = allGroups[currentCh];
    if(cg) {
      cg.position.y = Math.sin(t*0.4)*0.08;
      cg.rotation.y = Math.sin(t*0.18)*0.045;
    }

    // Seal pulse
    if(currentCh === "seal" && !sealBursting && !sealOpened) {
      sealGroup.rotation.z = Math.sin(t*0.5)*0.04;
      sealGroup.scale.setScalar(1 + Math.sin(t*1.4)*0.018);
    }

    // Seal burst
    if(sealBursting) {
      sealBurstT += dt*2.2;
      const pct = Math.min(sealBurstT, 1);
      const ease = 1-Math.pow(1-pct,3);
      sealGroup.scale.setScalar(1-ease*0.85);
      sealGroup.rotation.z += dt*8;
      (sealMat as THREE.MeshStandardMaterial).opacity = 1-ease;
      sealMat.transparent = true;

      shards.forEach((s,i) => {
        s.born += dt;
        const se = Math.min(s.born*2.5, 1);
        const ep = 1-Math.pow(1-se,3);
        s.m.position.copy(sealGroup.position).addScaledVector(s.vel, ep);
        s.m.rotation.x = s.rot.x*ep;
        s.m.rotation.y = s.rot.y*ep;
        (s.m.material as THREE.MeshStandardMaterial).opacity = 1-ep*0.9;
      });

      if(pct >= 1) {
        sealBursting = false;
        sealOpened = true;
        sealGroup.visible = false;
        shards.forEach(s => scene.remove(s.m));
        shards.length = 0;
        // Signal React
        canvas.dispatchEvent(new CustomEvent("sealopened"));
      }
    }

    renderer.render(scene, camera);
  }

  tick();
  onReady();

  return {
    destroy() {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener("click", onCanvasClick);
      renderer.dispose();
    },
    setChapter(ch: Ch) { showChapter(ch); },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REACT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function PreviewCinematic() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const engineRef  = useRef<EngineHandle | null>(null);
  const [ready,    setReady]    = useState(false);
  const [chapter,  setChapter]  = useState<Ch>("monogram");
  const [unlocked, setUnlocked] = useState(false);
  const [fading,   setFading]   = useState(false);

  const chRef     = useRef<Ch>("monogram");
  const fadingRef = useRef(false);
  const unlockedRef = useRef(false);
  useEffect(()=>{ chRef.current=chapter; },      [chapter]);
  useEffect(()=>{ fadingRef.current=fading; },   [fading]);
  useEffect(()=>{ unlockedRef.current=unlocked; },[unlocked]);

  const transTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const autoTimer  = useRef<ReturnType<typeof setTimeout>|null>(null);

  const navigate = useCallback((dir: 1|-1) => {
    if(unlockedRef.current || fadingRef.current) return;
    const idx  = CHAPTERS.indexOf(chRef.current);
    const next = CHAPTERS[idx+dir];
    if(!next) return;
    if(autoTimer.current)  clearTimeout(autoTimer.current);
    if(transTimer.current) clearTimeout(transTimer.current);
    fadingRef.current = true;
    setFading(true);
    transTimer.current = setTimeout(()=>{
      engineRef.current?.setChapter(next);
      chRef.current = next;
      setChapter(next);
      fadingRef.current = false;
      setFading(false);
    }, 380);
  }, []);

  // Auto-advance
  useEffect(()=>{
    if(!ready || unlocked) return;
    const dur = DURATIONS[chapter];
    if(!dur) return;
    autoTimer.current = setTimeout(()=>navigate(1), dur);
    return ()=>{ if(autoTimer.current) clearTimeout(autoTimer.current); };
  }, [chapter, ready, unlocked, navigate]);

  // Build engine once
  useEffect(()=>{
    const cv = canvasRef.current;
    if(!cv) return;
    let destroyed = false;
    buildEngine(cv, ()=>{ if(!destroyed) setReady(true); }).then(h=>{
      if(destroyed){ h.destroy(); return; }
      engineRef.current = h;
    });
    const onOpened = ()=>{ setUnlocked(true); };
    cv.addEventListener("sealopened", onOpened);
    return ()=>{
      destroyed = true;
      cv.removeEventListener("sealopened", onOpened);
      engineRef.current?.destroy();
    };
  }, []);

  // Keyboard + scroll — registered once
  useEffect(()=>{
    let lastW = 0;
    function onKey(e: KeyboardEvent){
      if(["ArrowRight","ArrowDown"," "].includes(e.key)){ e.preventDefault(); navigate(1); }
      if(["ArrowLeft","ArrowUp"].includes(e.key)){ e.preventDefault(); navigate(-1); }
    }
    function onWheel(e: WheelEvent){
      const now=Date.now(); if(now-lastW<750) return; lastW=now;
      if(e.deltaY>30) navigate(1);
      if(e.deltaY<-30) navigate(-1);
    }
    window.addEventListener("keydown",onKey);
    window.addEventListener("wheel",onWheel,{passive:true});
    return ()=>{ window.removeEventListener("keydown",onKey); window.removeEventListener("wheel",onWheel); };
  }, [navigate]);

  // Touch
  const touchY = useRef<number|null>(null);
  function onTouchStart(e: React.TouchEvent){ touchY.current=e.touches[0]!.clientY; }
  function onTouchEnd(e: React.TouchEvent){
    if(touchY.current===null) return;
    const dy=touchY.current-e.changedTouches[0]!.clientY; touchY.current=null;
    if(dy>55) navigate(1); if(dy<-55) navigate(-1);
  }

  // Scroll lock
  useEffect(()=>{
    document.body.style.overflow    = unlocked ? "" : "hidden";
    document.body.style.touchAction = unlocked ? "" : "none";
    return ()=>{ document.body.style.overflow=""; document.body.style.touchAction=""; };
  },[unlocked]);

  const chIdx = CHAPTERS.indexOf(chapter);
  const isFirst = chIdx === 0;
  const isLast  = chapter === "seal";

  return (
    <div style={{position:"fixed",inset:0,background:PAL.bg,overflow:"hidden"}}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* 3D canvas */}
      <canvas ref={canvasRef} style={{
        width:"100%", height:"100%", display:"block",
        opacity: fading ? 0 : 1,
        transition: "opacity .38s ease",
      }} />

      {/* Loading veil */}
      {!ready && (
        <div style={{
          position:"absolute",inset:0,background:PAL.bg,
          display:"flex",alignItems:"center",justifyContent:"center",
          flexDirection:"column", gap:"1.5rem",
        }}>
          <div style={{
            width:52,height:52,borderRadius:"50%",
            border:`1.5px solid ${PAL.gold}`,
            borderTopColor:"transparent",
            animation:"spin 1s linear infinite",
          }}/>
          <p style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontStyle:"italic",fontSize:"1.1rem",
            color:PAL.inkMid,letterSpacing:".06em",
          }}>Preparing your invitation…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Sandbox badge */}
      <div style={{
        position:"fixed",top:"1.25rem",left:"1.25rem",zIndex:100,
        display:"inline-flex",alignItems:"center",gap:6,
        padding:"4px 12px",borderRadius:999,
        background:"rgba(158,109,8,.08)",border:`1px solid rgba(158,109,8,.25)`,
        pointerEvents:"none",
      }}>
        <div style={{width:5,height:5,borderRadius:"50%",background:PAL.gold}}/>
        <span style={{
          fontFamily:"'Manrope',sans-serif",fontSize:".44rem",
          letterSpacing:".24em",textTransform:"uppercase",
          color:PAL.gold,fontWeight:600,
        }}>Sandbox · 3D Preview</span>
      </div>

      {/* Chapter counter */}
      <div style={{
        position:"fixed",top:"1.25rem",right:"1.25rem",zIndex:100,
        fontFamily:"'Manrope',sans-serif",fontSize:".44rem",
        letterSpacing:".28em",textTransform:"uppercase",
        color:PAL.inkFaint,pointerEvents:"none",
      }}>
        {String(chIdx+1).padStart(2,"0")} / {String(CHAPTERS.length).padStart(2,"0")}
      </div>

      {/* Progress bar */}
      {!unlocked && ready && (
        <div style={{
          position:"fixed",bottom:0,left:0,right:0,height:3,zIndex:100,
          background:"rgba(190,45,69,.10)",
        }}>
          <div style={{
            height:"100%",
            background:PAL.rose,
            width:`${((chIdx+1)/CHAPTERS.length)*100}%`,
            transition:"width .5s cubic-bezier(.4,0,.2,1)",
          }}/>
        </div>
      )}

      {/* Progress dots */}
      {!unlocked && ready && (
        <div style={{
          position:"fixed",bottom:"1.5rem",left:"50%",
          transform:"translateX(-50%)",
          display:"flex",alignItems:"center",gap:".5rem",zIndex:100,
        }}>
          {CHAPTERS.map((c,i)=>(
            <div key={c} onClick={()=>{ if(!fading && !unlocked){ navigate(i>chIdx?1:-1); }}}
              style={{
                width:i===chIdx?22:6,height:6,borderRadius:999,cursor:"pointer",
                background:i===chIdx ? PAL.rose
                  : i<chIdx ? "rgba(190,45,69,.35)"
                  : "rgba(190,45,69,.15)",
                transition:"all .4s cubic-bezier(.34,1.56,.64,1)",
              }}/>
          ))}
        </div>
      )}

      {/* Auto-play hint */}
      {chapter==="monogram" && !unlocked && ready && (
        <div style={{
          position:"fixed",bottom:"3.5rem",left:"50%",
          transform:"translateX(-50%)",zIndex:100,
          fontFamily:"'Manrope',sans-serif",fontSize:".42rem",
          letterSpacing:".24em",textTransform:"uppercase",
          color:PAL.inkFaint,whiteSpace:"nowrap",pointerEvents:"none",
          animation:"fadeUp .9s 2s ease both",
        }}>
          Auto-playing · Scroll · Swipe · Space to skip
        </div>
      )}

      {/* Back arrow */}
      {!isFirst && !unlocked && ready && (
        <div onClick={()=>navigate(-1)} style={{
          position:"fixed",bottom:"3.6rem",left:"2rem",zIndex:100,
          cursor:"pointer",opacity:0.4,transition:"opacity .2s",
        }}
          onMouseEnter={e=>(e.currentTarget.style.opacity="0.85")}
          onMouseLeave={e=>(e.currentTarget.style.opacity="0.4")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={PAL.rose} strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </div>
      )}

      {/* Forward arrow */}
      {!isLast && !unlocked && ready && (
        <div onClick={()=>navigate(1)} style={{
          position:"fixed",bottom:"3.6rem",right:"2rem",zIndex:100,
          cursor:"pointer",opacity:0.45,
          animation:"bounceDown 2.2s ease-in-out infinite",
        }}
          onMouseEnter={e=>(e.currentTarget.style.opacity="0.85")}
          onMouseLeave={e=>(e.currentTarget.style.opacity="0.45")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={PAL.rose} strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      )}

      {/* Unlocked overlay */}
      {unlocked && (
        <div style={{
          position:"fixed",inset:0,zIndex:200,
          display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",
          background:"rgba(250,246,240,.88)",
          backdropFilter:"blur(16px)",
          animation:"fadeIn .7s ease both",
        }}>
          <p style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontStyle:"italic",fontSize:"clamp(1.2rem,3vw,2rem)",
            color:PAL.ink,marginBottom:"2rem",letterSpacing:".06em",
          }}>
            Welcome. Your invitation awaits.
          </p>
          <a href="/invite/general" style={{
            display:"inline-flex",alignItems:"center",gap:".625rem",
            padding:"13px 32px",borderRadius:999,
            background:`linear-gradient(135deg,#D44860 0%,#BE2D45 100%)`,
            color:"#fff",textDecoration:"none",
            fontFamily:"'Manrope',sans-serif",
            fontSize:".70rem",fontWeight:700,
            letterSpacing:".18em",textTransform:"uppercase",
            boxShadow:"0 6px 28px rgba(190,45,69,.30)",
            marginBottom:"1rem",
          }}>
            View Invitation →
          </a>
          <p style={{
            fontFamily:"'Manrope',sans-serif",fontSize:".52rem",
            color:PAL.inkFaint,letterSpacing:".18em",textTransform:"uppercase",
          }}>
            Sandbox · opens /invite/general
          </p>
        </div>
      )}

      <style>{`
        @keyframes bounceDown{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
    </div>
  );
}
