"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const activeTimers = [
      setTimeout(() => setExiting(true), 1250),
      setTimeout(() => onDone(), 1650),
    ];

    return () => activeTimers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[linear-gradient(180deg,rgba(107,191,184,0.045),var(--bg)_46%)] p-6 ${
        exiting ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      <FitSchedLoader compact={false} />
    </motion.div>
  );
}

export function FitSchedLoader({ compact = true }: { compact?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={`flex max-w-full flex-col items-stretch gap-3.5 ${compact ? "w-[220px]" : "w-[244px]"}`}
    >
      <div
        className={`shine-surface overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-lg)] backdrop-blur-[24px] ${
          compact ? "p-3.5" : "p-4"
        }`}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-[var(--border-strong)] bg-[var(--accent-soft)] font-[var(--font-display)] text-[13px] font-black tracking-[0.02em] text-[var(--accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            FS
          </div>
          <div className="min-w-0">
            <div className="brand-wordmark text-[19px] font-black leading-none text-[var(--text)]">
              FitSched
            </div>
            <div className="mt-[5px] text-[11px] font-semibold text-[var(--text-muted)]">
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
              className="flex h-[30px] items-center gap-[9px] rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] px-2.5"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full [animation:loaderPulse_1.4s_ease-in-out_infinite] ${item.delayClass} ${
                  index === 1 ? "bg-[#6bbfb8]" : "bg-[rgba(107,191,184,0.44)]"
                }`}
              />
              <span
                className={`h-[7px] rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(107,191,184,0.32),rgba(255,255,255,0.08))] bg-[length:220%_100%] [animation:loaderSweep_1.35s_ease-in-out_infinite] ${item.barClass} ${item.delayClass}`}
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
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg1)] p-4">
      <SkeletonBlock className="mb-2 h-4 w-[60%]" />
      <SkeletonBlock className="mb-3 h-3 w-[40%]" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-[22px] w-[60px] rounded-[20px]" />
        <SkeletonBlock className="h-[22px] w-20 rounded-[20px]" />
      </div>
    </div>
  );
}
