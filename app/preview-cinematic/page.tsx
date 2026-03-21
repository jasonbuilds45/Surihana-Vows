/**
 * /preview-cinematic — 3D Cinematic Wedding Invitation
 *
 * Built with React Three Fiber + Drei + Post-processing.
 * A full WebGL experience — no DOM cinema, real 3D.
 *
 * Run: npm install @react-three/fiber @react-three/drei three @react-three/postprocessing postprocessing
 *
 * SCENE DESIGN:
 *   Deep void — near-black space, richly lit
 *   Chapter 0 · The Monogram    — gold ML initials rise from void, petal storm
 *   Chapter 1 · Her Name        — Marion drifts in from left, particles trail
 *   Chapter 2 · His Name        — Livingston from right, gold dust
 *   Chapter 3 · The Date        — numerals hang in 3D space, volumetric light
 *   Chapter 4 · The Venues      — two address cards materialize in 3D
 *   Chapter 5 · The Quote       — pull-quote floats, slow camera orbit
 *   Chapter 6 · The Seal        — 3D wax seal, click to shatter → enter
 */

"use client";

import {
  Suspense, useCallback, useEffect, useMemo,
  useRef, useState,
} from "react";
import dynamic from "next/dynamic";

/* ── wedding data ── */
import { weddingConfig } from "@/lib/config";

const BF_FIRST = weddingConfig.brideName.split(" ")[0]!;
const GF_FIRST = weddingConfig.groomName.split(" ")[0]!;
const INITIALS = `${weddingConfig.brideName.charAt(0)}${weddingConfig.groomName.charAt(0)}`.toUpperCase();
const DATE_PARTS = ["20", "May", "2026"] as const;
const DAY_STR   = new Date(weddingConfig.weddingDate)
  .toLocaleDateString("en-GB", { weekday: "long" });

/* ── lazy-load the heavy 3D scene (avoids SSR issues) ── */
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false, loading: () => <LoadingVeil /> });

function LoadingVeil() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#06030A",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          border: "1.5px solid rgba(201,150,10,.35)",
          borderTopColor: "rgba(201,150,10,.85)",
          animation: "spin 1.1s linear infinite",
          margin: "0 auto 1.5rem",
        }} />
        <p style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontStyle: "italic", fontSize: "1.1rem",
          color: "rgba(255,255,255,.35)", letterSpacing: ".08em",
        }}>
          Preparing your invitation…
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function PreviewCinematic() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#06030A" }}>
      <Suspense fallback={<LoadingVeil />}>
        <Scene3D
          bf={BF_FIRST}
          gf={GF_FIRST}
          initials={INITIALS}
          dateParts={DATE_PARTS}
          dayStr={DAY_STR}
          quote={weddingConfig.introQuote}
          venue1={weddingConfig.venueName}
          venue1Sub="Kelambakkam, Chennai · 3:00 PM"
          venue2={weddingConfig.receptionVenueName}
          venue2Sub="Mahabalipuram · 6:00 PM"
          celebration={weddingConfig.celebrationTitle}
          weddingDate={weddingConfig.weddingDate}
        />
      </Suspense>
    </div>
  );
}
