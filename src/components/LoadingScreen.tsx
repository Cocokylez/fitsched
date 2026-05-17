"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const activeTimers = [
      setTimeout(() => setExiting(true), 850),
      setTimeout(() => onDone(), 1120),
    ];

    return () => activeTimers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[var(--bg)] p-6 ${
        exiting ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(107,191,184,0.13),transparent_34%)]" />
      <div className="relative">
        <FitSchedLoader compact={false} />
      </div>
    </motion.div>
  );
}

export function FitSchedLoader({ compact = true }: { compact?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={`flex max-w-[calc(100vw-42px)] flex-col items-stretch gap-3.5 ${compact ? "w-[232px]" : "w-[315px]"}`}
    >
      <div
        className={`shine-surface overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-lg)] backdrop-blur-[24px] ${
          compact ? "p-3.5" : "p-5"
        }`}
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-[17px] border border-[var(--border-strong)] bg-[var(--accent-soft)] font-[var(--font-display)] text-[13px] font-black tracking-normal text-[var(--accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            FS
          </div>
          <div className="min-w-0">
            <div className="brand-wordmark text-[20px] font-black leading-none text-[var(--text)]">
              FitSched
            </div>
            <div className="mt-1.5 text-[11px] font-bold text-[var(--text-muted)]">
              Preparing your workout
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          {[
            { barClass: "w-[74%]", delayClass: "[animation-delay:0s]" },
            { barClass: "w-[92%]", delayClass: "[animation-delay:0.18s]" },
            { barClass: "w-[58%]", delayClass: "[animation-delay:0.36s]" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex h-9 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3"
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full [animation:loaderPulse_1.4s_ease-in-out_infinite] ${item.delayClass} ${
                  index === 1 ? "bg-[#6bbfb8]" : "bg-[rgba(107,191,184,0.44)]"
                }`}
              />
              <span
                className={`h-2 rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(107,191,184,0.32),rgba(255,255,255,0.08))] bg-[length:220%_100%] [animation:loaderSweep_1.35s_ease-in-out_infinite] ${item.barClass} ${item.delayClass}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="h-[5px] overflow-hidden rounded-full border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.07)]">
        <div className="h-full w-[46%] rounded-full bg-[linear-gradient(90deg,rgba(107,191,184,0.15),#6bbfb8,rgba(107,191,184,0.25))] [animation:loaderTrack_1.18s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
      </div>
    </motion.div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-[linear-gradient(90deg,var(--bg3)_25%,var(--bg2)_50%,var(--bg3)_75%)] bg-[length:200%_100%] [animation:shimmer_1.5s_ease-in-out_infinite] ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="shine-surface rounded-[22px] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow)]">
      <div className="mb-3 flex items-center gap-3">
        <SkeletonBlock className="h-9 w-9 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="mb-2 h-3.5 w-[58%]" />
          <SkeletonBlock className="h-2.5 w-[38%]" />
        </div>
      </div>
      <div className="grid gap-2">
        <SkeletonBlock className="h-8 w-full rounded-2xl" />
        <SkeletonBlock className="h-8 w-[82%] rounded-2xl" />
      </div>
    </div>
  );
}
