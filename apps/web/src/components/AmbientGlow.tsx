'use client';

import React from 'react';

/**
 * AmbientGlow — subtle background gradient orbs for the home page.
 *
 * Pure CSS, no canvas, no external libraries. 4 semi-transparent gradient
 * circles floating slowly with GPU-accelerated transform + opacity animations.
 * Position: fixed, pointer-events: none, low z-index — does not interfere
 * with page content or interactivity.
 */
export default function AmbientGlow() {
  return (
    <div className="ambient-glow" aria-hidden="true">
      <div className="ambient-glow__orb ambient-glow__orb--1" />
      <div className="ambient-glow__orb ambient-glow__orb--2" />
      <div className="ambient-glow__orb ambient-glow__orb--3" />
      <div className="ambient-glow__orb ambient-glow__orb--4" />
      <style jsx>{`
        .ambient-glow {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .ambient-glow__orb {
          position: absolute;
          border-radius: 50%;
          will-change: transform, opacity;
        }

        /* Orb 1 — Purple, top-right */
        .ambient-glow__orb--1 {
          width: 500px;
          height: 500px;
          top: -120px;
          right: -80px;
          background: radial-gradient(
            circle at center,
            rgba(124, 58, 237, 0.08) 0%,
            rgba(124, 58, 237, 0.04) 40%,
            transparent 70%
          );
          animation: floatOrb1 25s ease-in-out infinite;
        }

        /* Orb 2 — Pink, bottom-left */
        .ambient-glow__orb--2 {
          width: 400px;
          height: 400px;
          bottom: -80px;
          left: -60px;
          background: radial-gradient(
            circle at center,
            rgba(236, 72, 153, 0.08) 0%,
            rgba(236, 72, 153, 0.04) 40%,
            transparent 70%
          );
          animation: floatOrb2 28s ease-in-out infinite;
        }

        /* Orb 3 — Blue, center-left */
        .ambient-glow__orb--3 {
          width: 350px;
          height: 350px;
          top: 40%;
          left: -100px;
          background: radial-gradient(
            circle at center,
            rgba(59, 130, 246, 0.06) 0%,
            rgba(59, 130, 246, 0.03) 40%,
            transparent 70%
          );
          animation: floatOrb3 30s ease-in-out infinite;
        }

        /* Orb 4 — Purple-Pink mix, center-right */
        .ambient-glow__orb--4 {
          width: 300px;
          height: 300px;
          top: 60%;
          right: -60px;
          background: radial-gradient(
            circle at center,
            rgba(124, 58, 237, 0.07) 0%,
            rgba(236, 72, 153, 0.04) 35%,
            transparent 70%
          );
          animation: floatOrb4 22s ease-in-out infinite;
        }

        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          25%      { transform: translate(-60px, 40px) scale(1.1); opacity: 1; }
          50%      { transform: translate(-120px, 80px) scale(0.95); opacity: 0.7; }
          75%      { transform: translate(-40px, 20px) scale(1.05); opacity: 0.9; }
        }

        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          25%      { transform: translate(50px, -30px) scale(1.15); opacity: 0.9; }
          50%      { transform: translate(100px, -60px) scale(0.9); opacity: 0.6; }
          75%      { transform: translate(30px, -20px) scale(1.08); opacity: 0.8; }
        }

        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          33%      { transform: translate(80px, -40px) scale(1.1); opacity: 0.9; }
          66%      { transform: translate(40px, 50px) scale(0.92); opacity: 0.6; }
        }

        @keyframes floatOrb4 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          33%      { transform: translate(-70px, -30px) scale(1.12); opacity: 0.8; }
          66%      { transform: translate(-30px, 40px) scale(0.88); opacity: 0.5; }
        }

        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .ambient-glow__orb {
            animation: none;
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
