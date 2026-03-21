"use client";

/**
 * Scene3D — The full WebGL cinematic experience.
 * Dynamically imported from page.tsx (no SSR).
 *
 * Stack:
 *   @react-three/fiber   — React renderer for Three.js
 *   @react-three/drei    — helpers: Text, Float, Stars, Environment, etc.
 *   @react-three/postprocessing — Bloom, DepthOfField, ChromaticAberration
 *   three                — core 3D engine
 */

import {
  useCallback, useEffect, useMemo,
  useRef, useState,
} from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import {
  Float, Stars, Environment,
  MeshDistortMaterial, Trail, Sparkles,
  Text, Text3D, Center, OrbitControls,
  shaderMaterial,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  DepthOfField,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SceneProps {
  bf: string; gf: string; initials: string;
  dateParts: readonly string[]; dayStr: string;
  quote: string; venue1: string; venue1Sub: string;
  venue2: string; venue2Sub: string;
  celebration: string; weddingDate: string;
}

// ── Chapters ──────────────────────────────────────────────────────────────────
const CHAPTERS = [
  "monogram", "bride", "groom", "date",
  "venues",   "quote",  "seal",
] as const;
type Chapter = typeof CHAPTERS[number];

// ── Camera positions per chapter ──────────────────────────────────────────────
const CAM_POSITIONS: Record<Chapter, [number, number, number]> = {
  monogram: [0,   0,   9],
  bride:    [-3,  0.5, 8],
  groom:    [ 3,  0.5, 8],
  date:     [0,   0.5, 7],
  venues:   [0,  -0.5, 9],
  quote:    [0,   0,  10],
  seal:     [0,   0,   7],
};

const CAM_TARGETS: Record<Chapter, [number, number, number]> = {
  monogram: [0,  0,   0],
  bride:    [-2, 0.3, 0],
  groom:    [ 2, 0.3, 0],
  date:     [0,  0.5, 0],
  venues:   [0, -0.5, 0],
  quote:    [0,  0,   0],
  seal:     [0, -0.3, 0],
};

// ── Colours ───────────────────────────────────────────────────────────────────
const ROSE_COL  = new THREE.Color("#BE2D45");
const GOLD_COL  = new THREE.Color("#C9960A");
const WHITE_COL = new THREE.Color("#FFFAF5");
const DEEP_COL  = new THREE.Color("#200A10");

// ── Lerp helper ───────────────────────────────────────────────────────────────
function lerpV3(
  current: THREE.Vector3,
  target: [number, number, number],
  alpha: number,
) {
  current.lerp(new THREE.Vector3(...target), alpha);
}

// ══════════════════════════════════════════════════════════════════════════════
// GOLD SHADER MATERIAL
// ══════════════════════════════════════════════════════════════════════════════
const GoldShaderMaterial = shaderMaterial(
  { time: 0, envMap: null },
  /* vertex */
  `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
      vNormal   = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position,1.0)).xyz;
      vUv       = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  /* fragment */
  `
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    vec3 gold1 = vec3(0.988, 0.831, 0.478);  // #FCD47A
    vec3 gold2 = vec3(0.788, 0.588, 0.039);  // #C9960A
    vec3 gold3 = vec3(0.369, 0.220, 0.004);  // #5E3801

    void main() {
      // Fresnel rim
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);

      // Swirling noise via trig
      float n  = sin(vUv.x * 18.0 + time * 0.4) * cos(vUv.y * 12.0 - time * 0.3) * 0.5 + 0.5;
      float n2 = sin(vUv.x * 8.0  - time * 0.2) * sin(vUv.y * 22.0 + time * 0.5) * 0.5 + 0.5;

      vec3 base = mix(gold3, gold2, n);
      base      = mix(base,  gold1, n2 * 0.6);

      // Specular highlight
      vec3 halfDir = normalize(viewDir + vec3(0.5,1.0,0.5));
      float spec   = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
      base += vec3(1.0, 0.95, 0.7) * spec * 1.8;

      // Fresnel glow
      base += vec3(0.98, 0.78, 0.3) * fresnel * 1.2;

      gl_FragColor = vec4(base, 1.0);
    }
  `,
);
extend({ GoldShaderMaterial });

// Extend the type system for JSX
declare module "@react-three/fiber" {
  interface ThreeElements {
    goldShaderMaterial: any;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PETAL PARTICLE SYSTEM
// Instanced mesh of curved petal shapes, physics-like drift
// ══════════════════════════════════════════════════════════════════════════════
function RosePetals({ count = 180, chapter }: { count?: number; chapter: Chapter }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Per-petal random data: position, velocity, rotation axis, phase
  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      pos:   new THREE.Vector3(
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 20 + 2,
        (Math.random() - 0.5) * 18 - 2,
      ),
      vel:   new THREE.Vector3(
        (Math.random() - 0.5) * 0.006,
        -(Math.random() * 0.004 + 0.001),
        (Math.random() - 0.5) * 0.003,
      ),
      rot:   new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ),
      axis: new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize(),
      speed: Math.random() * 0.008 + 0.002,
      phase: Math.random() * Math.PI * 2,
      scale: Math.random() * 0.18 + 0.06,
    }));
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!meshRef.current) return;

    petals.forEach((p, i) => {
      // Drift
      p.pos.add(p.vel);
      // Sway
      p.pos.x += Math.sin(t * 0.3 + p.phase) * 0.002;
      // Tumble
      p.rot.x += p.speed * 0.6;
      p.rot.y += p.speed * 0.4;
      p.rot.z += p.speed * 0.3;
      // Reset when fallen too far
      if (p.pos.y < -12) {
        p.pos.y = 12;
        p.pos.x = (Math.random() - 0.5) * 28;
        p.pos.z = (Math.random() - 0.5) * 18;
      }

      dummy.position.copy(p.pos);
      dummy.rotation.copy(p.rot);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Petal shape — a curved flat teardrop
  const petalGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(-0.4, 0.2,  -0.5, 0.9,  0,   1.4);
    shape.bezierCurveTo( 0.5, 0.9,   0.4, 0.2,  0,   0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[petalGeo, undefined, count]}>
      <meshStandardMaterial
        color={chapter === "groom" ? "#C9960A" : "#D44860"}
        emissive={chapter === "groom" ? "#7A5500" : "#7A1828"}
        emissiveIntensity={0.3}
        side={THREE.DoubleSide}
        transparent
        opacity={0.55}
        roughness={0.65}
        metalness={0.1}
      />
    </instancedMesh>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VOLUMETRIC LIGHT SHAFTS  (additive planes with fog material)
// ══════════════════════════════════════════════════════════════════════════════
function LightShafts({ chapter }: { chapter: Chapter }) {
  const groupRef = useRef<THREE.Group>(null!);

  const shafts = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => ({
      x:     (i - 3) * 1.8 + (Math.random() - 0.5) * 1.2,
      rot:   (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.07 + 0.02,
      h:     Math.random() * 14 + 10,
      phase: Math.random() * Math.PI * 2,
    })), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const s = shafts[i];
      if (!s) return;
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = s.alpha * (0.7 + 0.3 * Math.sin(t * 0.4 + s.phase));
    });
  });

  const col = chapter === "groom" ? "#C9960A" : "#BE2D45";

  return (
    <group ref={groupRef} position={[0, 8, -6]}>
      {shafts.map((s, i) => (
        <mesh key={i} position={[s.x, -s.h / 2, 0]} rotation={[0, 0, s.rot]}>
          <planeGeometry args={[0.35, s.h]} />
          <meshBasicMaterial
            color={col}
            transparent
            opacity={s.alpha}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GOLD DUST MOTES
// ══════════════════════════════════════════════════════════════════════════════
function GoldDust() {
  return (
    <Sparkles
      count={320}
      scale={[24, 18, 12]}
      size={1.2}
      speed={0.22}
      opacity={0.55}
      color="#D4A810"
      noise={1.4}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FLOATING ORB  — ambient soft light source
// ══════════════════════════════════════════════════════════════════════════════
function AmbientOrb({ color, position }: { color: string; position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 0.5) * 0.4;
      ref.current.position.x = position[0] + Math.cos(t * 0.3) * 0.2;
    }
  });
  return (
    <Float speed={1.2} rotationIntensity={0} floatIntensity={0.8}>
      <mesh ref={ref} position={position}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3.5}
          roughness={1}
          transparent
          opacity={0.18}
        />
      </mesh>
    </Float>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WAX SEAL  — lathe geometry + gold shader + click burst
// ══════════════════════════════════════════════════════════════════════════════
function WaxSeal({
  onOpen,
  initials,
  opened,
}: {
  onOpen: () => void;
  initials: string;
  opened: boolean;
}) {
  const groupRef  = useRef<THREE.Group>(null!);
  const matRef    = useRef<any>(null!);
  const shardRefs = useRef<THREE.Mesh[]>([]);
  const [hovered, setHovered]   = useState(false);
  const [bursting, setBursting] = useState(false);
  const burstT = useRef(0);

  // Lathe geometry — disk with bevelled edge
  const sealGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    // Base disc profile (r, y)
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const r = 1.8 * Math.sin(t * Math.PI);
      pts.push(new THREE.Vector2(r, t * 0.28 - 0.14));
    }
    return new THREE.LatheGeometry(pts, 64);
  }, []);

  // Edge serrations (star-burst rim)
  const rimPts = useMemo(() => {
    const out: [number, number, number][] = [];
    const N = 24;
    for (let i = 0; i < N; i++) {
      const a   = (i / N) * Math.PI * 2;
      const r   = i % 2 === 0 ? 1.88 : 1.68;
      out.push([Math.cos(a) * r, Math.sin(a) * r, 0.15]);
    }
    return out;
  }, []);

  // Burst shards
  const shards = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return {
        vel:    new THREE.Vector3(Math.cos(a) * 3.5, Math.sin(a) * 3.5, 2.5 + Math.random() * 2),
        rot:    new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 4),
        initP:  new THREE.Vector3(Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0),
        scaleI: Math.random() * 0.5 + 0.3,
      };
    });
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // Animate gold shader time
    if (matRef.current) matRef.current.time = t;

    // Pulse scale when hovered, idle gentle breathing otherwise
    if (groupRef.current && !bursting && !opened) {
      const s = hovered
        ? 1 + Math.sin(t * 6) * 0.025
        : 1 + Math.sin(t * 1.2) * 0.012;
      groupRef.current.scale.setScalar(s);
      groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.04;
    }

    // Burst animation
    if (bursting) {
      burstT.current += delta * 1.8;
      const pct = Math.min(burstT.current, 1);
      shardRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        const sh = shards[i]!;
        const ease = 1 - Math.pow(1 - pct, 3);
        mesh.position.copy(sh.initP).addScaledVector(sh.vel, ease);
        mesh.rotation.x = sh.rot.x * ease;
        mesh.rotation.y = sh.rot.y * ease;
        mesh.rotation.z = sh.rot.z * ease;
        mesh.scale.setScalar(sh.scaleI * (1 - ease * 0.7));
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = 1 - ease;
      });
      if (pct >= 1) {
        setBursting(false);
        onOpen();
      }
    }
  });

  function handleClick() {
    if (opened || bursting) return;
    setBursting(true);
    burstT.current = 0;
  }

  if (opened) return null;

  return (
    <group ref={groupRef}>
      {/* Main disc */}
      <mesh
        geometry={sealGeo}
        onClick={handleClick}
        onPointerEnter={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        castShadow
      >
        <goldShaderMaterial ref={matRef} />
      </mesh>

      {/* Rim spikes */}
      {rimPts.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, (i / 24) * Math.PI * 2]}>
          <coneGeometry args={[0.06, 0.22, 4]} />
          <goldShaderMaterial />
        </mesh>
      ))}

      {/* Central groove ring */}
      <mesh>
        <torusGeometry args={[1.2, 0.035, 12, 80]} />
        <meshStandardMaterial color="#5C3D01" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.7, 0.025, 12, 80]} />
        <meshStandardMaterial color="#5C3D01" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Initials text on seal */}
      <Text
        position={[0, 0, 0.18]}
        fontSize={0.72}
        color="#3D1E00"
        font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.woff2"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        {initials}
      </Text>

      {/* Burst shards */}
      {bursting && shards.map((sh, i) => (
        <mesh
          key={i}
          ref={el => { if (el) shardRefs.current[i] = el; }}
          position={sh.initP.toArray()}
        >
          <planeGeometry args={[0.45 * sh.scaleI, 0.55 * sh.scaleI]} />
          <meshStandardMaterial
            color="#C9960A"
            emissive="#C9960A"
            emissiveIntensity={1.5}
            transparent
            opacity={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CHAPTER TEXT COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/** Monogram chapter — large M & L in 3D + orbiting ring */
function MonogramChapter({ initials, celebration, bf, gf, dayStr }: {
  initials: string; celebration: string; bf: string; gf: string; dayStr: string;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.18) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Celebration label */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.18}
        color="rgba(255,252,248,0.45)"
        font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
        anchorX="center" anchorY="middle"
        letterSpacing={0.55}
      >
        {celebration.toUpperCase()}
      </Text>

      {/* Giant initials */}
      <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.25}>
        <Text
          position={[0, 0.2, 0]}
          fontSize={3.2}
          color="#FFFFFF"
          font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.woff2"
          anchorX="center" anchorY="middle"
          letterSpacing={0.18}
          fillOpacity={0.92}
        >
          {initials}
        </Text>
      </Float>

      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.6, 0.018, 12, 140]} />
        <meshStandardMaterial
          color="#C9960A"
          emissive="#C9960A"
          emissiveIntensity={1.2}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, Math.PI / 4]}>
        <torusGeometry args={[2.8, 0.009, 8, 140]} />
        <meshStandardMaterial
          color="#BE2D45"
          emissive="#BE2D45"
          emissiveIntensity={0.8}
          roughness={0.4}
          transparent opacity={0.6}
        />
      </mesh>

      {/* Names */}
      <Text
        position={[0, -2.2, 0]}
        fontSize={0.28}
        color="rgba(255,252,248,0.62)"
        font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYtFLsS6V7w.woff2"
        anchorX="center" anchorY="middle"
        letterSpacing={0.08}
      >
        {bf}  &  {gf}
      </Text>

      {/* Day string */}
      <Text
        position={[0, -2.75, 0]}
        fontSize={0.13}
        color="rgba(201,150,10,0.55)"
        font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
        anchorX="center" anchorY="middle"
        letterSpacing={0.38}
      >
        {dayStr.toUpperCase()}  ·  20 MAY 2026
      </Text>
    </group>
  );
}

/** Bride / Groom name chapters */
function NameChapter({ name, fullName, side, color }: {
  name: string; fullName: string; side: "left" | "right"; color: string;
}) {
  const anchor = side === "left" ? "left" : "right";
  const xOff   = side === "left" ? -5 : 5;
  const xLine  = side === "left" ? -2.5 : 2.5;

  return (
    <Float speed={0.5} rotationIntensity={0.04} floatIntensity={0.15}>
      <group>
        {/* Giant first name */}
        <Text
          position={[xOff, 0.2, 0]}
          fontSize={2.6}
          color={color}
          font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.woff2"
          anchorX={anchor}
          anchorY="middle"
          letterSpacing={-0.04}
        >
          {name}.
        </Text>

        {/* Full name */}
        <Text
          position={[xOff, -1.55, 0]}
          fontSize={0.18}
          color="rgba(255,255,255,0.30)"
          font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
          anchorX={anchor}
          anchorY="middle"
          letterSpacing={0.30}
        >
          {fullName.toUpperCase()}
        </Text>

        {/* Accent rule */}
        <mesh position={[xLine, -2.1, 0]}>
          <planeGeometry args={[1.4, 0.008]} />
          <meshBasicMaterial color={color} transparent opacity={0.65} />
        </mesh>
      </group>
    </Float>
  );
}

/** Date chapter */
function DateChapter({ parts, dayStr, daysAway }: {
  parts: readonly string[]; dayStr: string; daysAway: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (groupRef.current)
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.06;
  });

  return (
    <group ref={groupRef}>
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.16}
        color="rgba(255,255,255,0.25)"
        font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
        anchorX="center" anchorY="middle"
        letterSpacing={0.48}
      >
        THE DATE
      </Text>

      {/* 20  May  2026 — three separate words, different weights */}
      <Text
        position={[-2.8, 0, 0]}
        fontSize={2.4}
        color="rgba(255,255,255,0.22)"
        font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.woff2"
        anchorX="right" anchorY="middle"
        letterSpacing={-0.03}
      >
        {parts[0]}
      </Text>
      <Text
        position={[0, 0, 0]}
        fontSize={2.4}
        color="#FFFFFF"
        font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.woff2"
        anchorX="center" anchorY="middle"
        letterSpacing={-0.03}
      >
        {parts[1]}
      </Text>
      <Text
        position={[3.8, 0, 0]}
        fontSize={2.4}
        color="rgba(255,255,255,0.22)"
        font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.woff2"
        anchorX="left" anchorY="middle"
        letterSpacing={-0.03}
      >
        {parts[2]}
      </Text>

      {/* Gold hairline */}
      <mesh position={[0, -1.7, 0]}>
        <planeGeometry args={[5.5, 0.008]} />
        <meshBasicMaterial color="#C9960A" transparent opacity={0.55}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Day name */}
      <Text
        position={[0, -2.3, 0]}
        fontSize={0.18}
        color="rgba(190,45,69,0.72)"
        font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
        anchorX="center" anchorY="middle"
        letterSpacing={0.44}
      >
        {dayStr.toUpperCase()}{daysAway > 0 ? `  ·  ${daysAway} DAYS AWAY` : ""}
      </Text>
    </group>
  );
}

/** Venues chapter */
function VenuesChapter({ v1, v1s, v2, v2s }: {
  v1: string; v1s: string; v2: string; v2s: string;
}) {
  return (
    <group>
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.14}
        color="rgba(255,255,255,0.22)"
        font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
        anchorX="center" anchorY="middle"
        letterSpacing={0.46}
      >
        THE VENUES  ·  CHENNAI, TAMIL NADU
      </Text>

      {/* Church — rose */}
      <Float speed={0.6} rotationIntensity={0.03} floatIntensity={0.2}>
        <group position={[-0.3, 0.85, 0]}>
          <Text
            position={[-3.5, 0, 0]}
            fontSize={0.22}
            color="rgba(212,72,96,0.90)"
            font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
            anchorX="left" anchorY="middle"
            letterSpacing={0.12}
          >
            3 PM
          </Text>
          <mesh position={[-2.7, 0, 0]}>
            <planeGeometry args={[0.4, 0.007]} />
            <meshBasicMaterial color="#BE2D45" transparent opacity={0.5} />
          </mesh>
          <Text
            position={[-2.3, 0, 0]}
            fontSize={0.88}
            color="rgba(255,255,255,0.90)"
            font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYtFLsS6V7w.woff2"
            anchorX="left" anchorY="middle"
            maxWidth={6.5}
          >
            {v1}
          </Text>
          <Text
            position={[-2.3, -0.75, 0]}
            fontSize={0.18}
            color="rgba(255,255,255,0.30)"
            font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
            anchorX="left" anchorY="middle"
            letterSpacing={0.08}
          >
            {v1s}
          </Text>
        </group>
      </Float>

      {/* Connector line */}
      <mesh position={[-2.0, 0, 0]}>
        <planeGeometry args={[0.006, 0.9]} />
        <meshBasicMaterial
          color="#8B1A2C"
          transparent opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <Text
        position={[-1.65, 0, 0]}
        fontSize={0.12}
        color="rgba(255,255,255,0.18)"
        font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
        anchorX="left" anchorY="middle"
        letterSpacing={0.28}
      >
        THEN
      </Text>

      {/* Resort — gold */}
      <Float speed={0.7} rotationIntensity={0.03} floatIntensity={0.22}>
        <group position={[-0.3, -0.85, 0]}>
          <Text
            position={[-3.5, 0, 0]}
            fontSize={0.22}
            color="rgba(201,150,10,0.90)"
            font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
            anchorX="left" anchorY="middle"
            letterSpacing={0.12}
          >
            6 PM
          </Text>
          <mesh position={[-2.7, 0, 0]}>
            <planeGeometry args={[0.4, 0.007]} />
            <meshBasicMaterial color="#C9960A" transparent opacity={0.5} />
          </mesh>
          <Text
            position={[-2.3, 0, 0]}
            fontSize={0.88}
            color="rgba(232,188,20,0.88)"
            font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYtFLsS6V7w.woff2"
            anchorX="left" anchorY="middle"
            maxWidth={6.5}
          >
            {v2}
          </Text>
          <Text
            position={[-2.3, -0.75, 0]}
            fontSize={0.18}
            color="rgba(255,255,255,0.30)"
            font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
            anchorX="left" anchorY="middle"
            letterSpacing={0.08}
          >
            {v2s}
          </Text>
        </group>
      </Float>
    </group>
  );
}

/** Quote chapter */
function QuoteChapter({ quote, bf, gf }: { quote: string; bf: string; gf: string }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.07;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.07) * 0.025;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Decorative quote mark */}
      <Text
        position={[-3.8, 1.8, 0]}
        fontSize={3.5}
        color="rgba(190,45,69,0.14)"
        font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.woff2"
        anchorX="left" anchorY="top"
      >
        {"\u201C"}
      </Text>

      {/* The quote */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.34}
        color="rgba(255,252,248,0.78)"
        font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYtFLsS6V7w.woff2"
        anchorX="center" anchorY="middle"
        maxWidth={9.5}
        textAlign="center"
        lineHeight={1.75}
      >
        {quote}
      </Text>

      {/* Gold rule */}
      <mesh position={[0, -2.2, 0]}>
        <planeGeometry args={[1.8, 0.007]} />
        <meshBasicMaterial
          color="#C9960A"
          transparent opacity={0.55}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Attribution */}
      <Text
        position={[0, -2.65, 0]}
        fontSize={0.16}
        color="rgba(255,255,255,0.24)"
        font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
        anchorX="center" anchorY="middle"
        letterSpacing={0.36}
      >
        {bf.toUpperCase()}  &  {gf.toUpperCase()}
      </Text>
    </group>
  );
}

/** Seal chapter wrapper */
function SealChapter({
  onOpen, initials, opened, bf, gf,
}: {
  onOpen: () => void; initials: string; opened: boolean; bf: string; gf: string;
}) {
  return (
    <group>
      {/* Names above */}
      <Text
        position={[0, 3.2, 0]}
        fontSize={0.16}
        color="rgba(255,255,255,0.38)"
        font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
        anchorX="center" anchorY="middle"
        letterSpacing={0.50}
      >
        YOUR INVITATION
      </Text>

      <Float speed={0.6} rotationIntensity={0.04} floatIntensity={0.18}>
        <Text
          position={[0, 2.2, 0]}
          fontSize={1.0}
          color="#FFFFFF"
          font="https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.woff2"
          anchorX="center" anchorY="middle"
          letterSpacing={0.04}
        >
          {bf} & {gf}
        </Text>
      </Float>

      {/* The seal */}
      <Float speed={0.4} rotationIntensity={0.02} floatIntensity={0.12}>
        <WaxSeal onOpen={onOpen} initials={initials} opened={opened} />
      </Float>

      {!opened && (
        <Text
          position={[0, -2.6, 0]}
          fontSize={0.16}
          color="rgba(255,255,255,0.30)"
          font="https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggqxSuXd.woff2"
          anchorX="center" anchorY="middle"
          letterSpacing={0.34}
        >
          TAP THE SEAL TO ENTER
        </Text>
      )}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CAMERA RIG — smooth lerp between chapter positions
// ══════════════════════════════════════════════════════════════════════════════
function CameraRig({ chapter }: { chapter: Chapter }) {
  const { camera } = useThree();
  const posTarget  = CAM_POSITIONS[chapter];
  const lookTarget = CAM_TARGETS[chapter];
  const lookVec    = useRef(new THREE.Vector3(...lookTarget));

  useFrame((_, delta) => {
    const alpha = 1 - Math.pow(0.008, delta);
    camera.position.lerp(new THREE.Vector3(...posTarget), alpha);
    lookVec.current.lerp(new THREE.Vector3(...lookTarget), alpha);
    camera.lookAt(lookVec.current);
  });

  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SCENE
// ══════════════════════════════════════════════════════════════════════════════
function SceneContent(props: SceneProps & {
  chapter: Chapter;
  onSealOpen: () => void;
  sealOpened: boolean;
  daysAway: number;
}) {
  const { chapter, onSealOpen, sealOpened, daysAway } = props;

  return (
    <>
      <CameraRig chapter={chapter} />

      {/* ── Lighting ── */}
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 8, 4]}   color="#FFE8C0" intensity={2.2} distance={30} />
      <pointLight position={[-6, 2, 2]}  color="#BE2D45" intensity={1.8} distance={20} />
      <pointLight position={[6, -2, 2]}  color="#C9960A" intensity={1.6} distance={20} />
      <pointLight position={[0, -8, -2]} color="#1A0510" intensity={0.8} distance={25} />

      {/* ── Background stars ── */}
      <Stars radius={80} depth={60} count={2200} factor={3} saturation={0.3} fade speed={0.4} />

      {/* ── Particles & atmosphere ── */}
      <RosePetals chapter={chapter} />
      <LightShafts chapter={chapter} />
      <GoldDust />

      {/* ── Ambient orbs ── */}
      <AmbientOrb color="#BE2D45" position={[-6,  3, -4]} />
      <AmbientOrb color="#C9960A" position={[ 7, -2, -5]} />
      <AmbientOrb color="#8B1A2C" position={[ 0,  6, -8]} />

      {/* ── Chapter content ── */}
      {chapter === "monogram" && (
        <MonogramChapter
          initials={props.initials}
          celebration={props.celebration}
          bf={props.bf}
          gf={props.gf}
          dayStr={props.dayStr}
        />
      )}

      {chapter === "bride" && (
        <NameChapter
          name={props.bf}
          fullName={weddingConfig.brideName}
          side="left"
          color="#FFFFFF"
        />
      )}

      {chapter === "groom" && (
        <NameChapter
          name={props.gf}
          fullName={weddingConfig.groomName}
          side="right"
          color="rgba(232,188,20,0.90)"
        />
      )}

      {chapter === "date" && (
        <DateChapter
          parts={props.dateParts}
          dayStr={props.dayStr}
          daysAway={daysAway}
        />
      )}

      {chapter === "venues" && (
        <VenuesChapter
          v1={props.venue1}   v1s={props.venue1Sub}
          v2={props.venue2}   v2s={props.venue2Sub}
        />
      )}

      {chapter === "quote" && (
        <QuoteChapter
          quote={props.quote}
          bf={props.bf}
          gf={props.gf}
        />
      )}

      {chapter === "seal" && (
        <SealChapter
          onOpen={onSealOpen}
          initials={props.initials}
          opened={sealOpened}
          bf={props.bf}
          gf={props.gf}
        />
      )}

      {/* ── Post-processing ── */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.28}
          luminanceSmoothing={0.85}
          intensity={1.6}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0006, 0.0006] as any}
          radialModulation={false}
          modulationOffset={0}
        />
        <DepthOfField
          focusDistance={0.012}
          focalLength={0.055}
          bokehScale={2.2}
        />
        <Vignette eskil={false} offset={0.18} darkness={0.88} />
        <Noise opacity={0.032} />
      </EffectComposer>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// OVERLAY UI (HTML on top of canvas)
// ══════════════════════════════════════════════════════════════════════════════
function Overlay({
  chapter, chapterIdx, total, onAdvance, onBack, unlocked,
}: {
  chapter: Chapter;
  chapterIdx: number;
  total: number;
  onAdvance: () => void;
  onBack: () => void;
  unlocked: boolean;
}) {
  const isFirst = chapterIdx === 0;
  const isLast  = chapter === "seal";

  return (
    <>
      {/* Sandbox badge */}
      <div style={{
        position: "fixed", top: "1.25rem", left: "1.25rem", zIndex: 100,
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 12px", borderRadius: 999,
        background: "rgba(255,215,0,.08)",
        border: "1px solid rgba(255,215,0,.22)",
        pointerEvents: "none",
      }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#FFD700" }} />
        <span style={{
          fontFamily: "'Manrope',sans-serif", fontSize: ".44rem",
          letterSpacing: ".24em", textTransform: "uppercase",
          color: "rgba(255,215,0,.65)", fontWeight: 600,
        }}>Sandbox · 3D Preview</span>
      </div>

      {/* Chapter counter */}
      <div style={{
        position: "fixed", top: "1.25rem", right: "1.25rem", zIndex: 100,
        fontFamily: "'Manrope',sans-serif", fontSize: ".44rem",
        letterSpacing: ".28em", textTransform: "uppercase",
        color: "rgba(255,255,255,.18)",
        pointerEvents: "none",
      }}>
        {String(chapterIdx + 1).padStart(2,"0")} / {String(total).padStart(2,"0")}
      </div>

      {/* Progress dots */}
      {!unlocked && (
        <div style={{
          position: "fixed", bottom: "2rem", left: "50%",
          transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: ".5rem",
          zIndex: 100,
        }}>
          {CHAPTERS.map((c, i) => (
            <div key={c} style={{
              width: i === chapterIdx ? 20 : 5, height: 5,
              borderRadius: 999,
              background: i === chapterIdx
                ? "#BE2D45"
                : i < chapterIdx
                ? "rgba(255,255,255,.35)"
                : "rgba(255,255,255,.12)",
              transition: "all .4s cubic-bezier(.34,1.56,.64,1)",
            }} />
          ))}
        </div>
      )}

      {/* Scroll hint on first chapter */}
      {chapter === "monogram" && !unlocked && (
        <div style={{
          position: "fixed", bottom: "3.5rem", left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'Manrope',sans-serif", fontSize: ".42rem",
          letterSpacing: ".24em", textTransform: "uppercase",
          color: "rgba(255,255,255,.20)",
          whiteSpace: "nowrap", zIndex: 100,
          pointerEvents: "none",
          animation: "fadeUpHint .9s 1.8s ease both",
        }}>
          Scroll · Swipe · Space to advance
        </div>
      )}

      {/* Back arrow */}
      {!isFirst && !unlocked && (
        <div
          onClick={onBack}
          style={{
            position: "fixed", bottom: "3.8rem", left: "2rem",
            zIndex: 100, cursor: "pointer", opacity: 0.35,
            transition: "opacity .2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.35")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,.7)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </div>
      )}

      {/* Forward arrow */}
      {!isLast && !unlocked && (
        <div
          onClick={onAdvance}
          style={{
            position: "fixed", bottom: "3.8rem", right: "2rem",
            zIndex: 100, cursor: "pointer",
            animation: "bounceDown 2.2s ease-in-out infinite",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.75"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.35"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,.4)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      )}

      {/* Unlocked CTA */}
      {unlocked && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "rgba(6,3,10,.72)",
          backdropFilter: "blur(12px)",
          animation: "fadeIn .7s ease both",
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontStyle: "italic", fontSize: "clamp(1.2rem,3vw,2rem)",
            color: "rgba(255,255,255,.72)",
            marginBottom: "2rem", letterSpacing: ".06em",
          }}>
            Welcome. Your invitation awaits.
          </p>
          <a href="/invite/general" style={{
            display: "inline-flex", alignItems: "center", gap: ".625rem",
            padding: "13px 32px", borderRadius: 999,
            background: "linear-gradient(135deg,#D44860 0%,#BE2D45 100%)",
            color: "#fff", textDecoration: "none",
            fontFamily: "'Manrope',sans-serif",
            fontSize: ".70rem", fontWeight: 700,
            letterSpacing: ".18em", textTransform: "uppercase",
            boxShadow: "0 6px 28px rgba(190,45,69,.45)",
            marginBottom: "1rem",
          }}>
            View Invitation →
          </a>
          <p style={{
            fontFamily: "'Manrope',sans-serif", fontSize: ".52rem",
            color: "rgba(255,255,255,.20)",
            letterSpacing: ".18em", textTransform: "uppercase",
          }}>
            Sandbox · Opens /invite/general
          </p>
        </div>
      )}

      <style>{`
        @keyframes bounceDown {
          0%,100% { transform:translateY(0) }
          50%      { transform:translateY(7px) }
        }
        @keyframes fadeUpHint {
          from { opacity:0; transform:translateY(12px) }
          to   { opacity:1; transform:none }
        }
        @keyframes fadeIn {
          from { opacity:0 }
          to   { opacity:1 }
        }
      `}</style>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export default function Scene3D(props: SceneProps) {
  const [chapter,    setChapter]    = useState<Chapter>("monogram");
  const [fading,     setFading]     = useState(false);
  const [sealOpened, setSealOpened] = useState(false);
  const [unlocked,   setUnlocked]   = useState(false);
  const [daysAway,   setDaysAway]   = useState(0);
  const transTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Countdown
  useEffect(() => {
    const ms = new Date(props.weddingDate).getTime() - Date.now();
    setDaysAway(Math.max(0, Math.floor(ms / 86400000)));
  }, [props.weddingDate]);

  const chapterIdx = CHAPTERS.indexOf(chapter);

  const advance = useCallback(() => {
    if (unlocked || fading) return;
    const next = CHAPTERS[chapterIdx + 1];
    if (!next) return;
    setFading(true);
    transTimer.current = setTimeout(() => {
      setChapter(next);
      setFading(false);
    }, 420);
  }, [chapterIdx, unlocked, fading]);

  const back = useCallback(() => {
    if (unlocked || fading) return;
    const prev = CHAPTERS[chapterIdx - 1];
    if (!prev) return;
    setFading(true);
    transTimer.current = setTimeout(() => {
      setChapter(prev);
      setFading(false);
    }, 420);
  }, [chapterIdx, unlocked, fading]);

  // Keyboard
  useEffect(() => {
    let lastWheel = 0;
    function onKey(e: KeyboardEvent) {
      if (["ArrowRight","ArrowDown"," "].includes(e.key)) { e.preventDefault(); advance(); }
      if (["ArrowLeft","ArrowUp"].includes(e.key))        { e.preventDefault(); back();    }
    }
    function onWheel(e: WheelEvent) {
      const now = Date.now();
      if (now - lastWheel < 750) return;
      lastWheel = now;
      if (e.deltaY > 30)  advance();
      if (e.deltaY < -30) back();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      if (transTimer.current) clearTimeout(transTimer.current);
    };
  }, [advance, back]);

  // Touch
  const touchY = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { touchY.current = e.touches[0]!.clientY; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchY.current === null) return;
    const dy = touchY.current - e.changedTouches[0]!.clientY;
    touchY.current = null;
    if (dy > 55) advance();
    if (dy < -55) back();
  }

  function handleSealOpen() {
    setSealOpened(true);
    setTimeout(() => setUnlocked(true), 600);
  }

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow    = unlocked ? "" : "hidden";
    document.body.style.touchAction = unlocked ? "" : "none";
    return () => { document.body.style.overflow = ""; document.body.style.touchAction = ""; };
  }, [unlocked]);

  return (
    <div
      style={{ position: "fixed", inset: 0 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* WebGL Canvas */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: fading ? 0 : 1,
        transition: "opacity .42s cubic-bezier(.4,0,.2,1)",
      }}>
        <Canvas
          camera={{ position: [0, 0, 9], fov: 52, near: 0.1, far: 200 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          style={{ background: "#06030A" }}
        >
          <color attach="background" args={["#06030A"]} />
          <fog attach="fog" args={["#06030A", 22, 80]} />

          <Suspense fallback={null}>
            <SceneContent
              {...props}
              chapter={chapter}
              onSealOpen={handleSealOpen}
              sealOpened={sealOpened}
              daysAway={daysAway}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* HTML Overlay */}
      <Overlay
        chapter={chapter}
        chapterIdx={chapterIdx}
        total={CHAPTERS.length}
        onAdvance={advance}
        onBack={back}
        unlocked={unlocked}
      />
    </div>
  );
}
