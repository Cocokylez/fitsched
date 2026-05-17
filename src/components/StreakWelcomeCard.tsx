"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Dumbbell, Snowflake, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import FlameIcon from "@/components/FlameIcon"

type StreakWelcomeCardProps = {
  streak: number
  previousStreak: number
  streakBroken: boolean
  onGoWorkout: () => void
}

const emberColors = ["#fff4b0", "#e8842a", "#c9a84c", "#ffffff"]

function FreezeHalo({ active }: { active: boolean }) {
  const shouldReduceMotion = useReducedMotion()
  const shards = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => ({
      id: index,
      rotate: index * 30,
      distance: 66 + (index % 3) * 7,
      size: 8 + (index % 4) * 2,
      delay: 0.04 * index,
    }))
  }, [])

  if (shouldReduceMotion) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.72, rotate: -10 }}
      animate={{
        opacity: active ? [0, 1, 0.9] : [0, 0.75, 0.55],
        scale: active ? [0.72, 1.08, 1] : [0.72, 0.98, 0.94],
        rotate: active ? [12, -4, 0] : [-10, 2, -2],
      }}
      transition={{ duration: active ? 1.05 : 0.78, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
      }}
    >
      {shards.map((shard) => (
        <motion.span
          key={shard.id}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: active ? [0, 1, 0.72] : [0, 0.76, 0],
            scale: active ? [0, 1.15, 0.92] : [0, 0.9, 0.4],
            x: Math.cos((shard.rotate * Math.PI) / 180) * shard.distance,
            y: Math.sin((shard.rotate * Math.PI) / 180) * shard.distance,
            rotate: shard.rotate + 45,
          }}
          transition={{ duration: active ? 1.05 : 0.7, delay: shard.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: shard.size,
            height: shard.size * 2.2,
            borderRadius: "999px 999px 2px 2px",
            background: "linear-gradient(180deg, rgba(225,252,255,0.95), rgba(95,206,236,0.28))",
            boxShadow: "0 0 16px rgba(139,226,255,0.34)",
          }}
        />
      ))}
    </motion.div>
  )
}

function RisingEmbers({ active }: { active: boolean }) {
  const shouldReduceMotion = useReducedMotion()
  const embers = useMemo(() => {
    return Array.from({ length: 18 }, (_, index) => ({
      id: index,
      x: ((index * 37) % 88) - 44,
      y: -68 - ((index * 29) % 58),
      size: 2 + (index % 3) * 0.7,
      delay: (index % 9) * 0.16,
      duration: 1.45 + (index % 4) * 0.18,
      color: emberColors[index % emberColors.length],
    }))
  }, [])

  if (shouldReduceMotion || !active) return null

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
      {embers.map((ember) => (
        <motion.span
          key={ember.id}
          initial={{ opacity: 0, x: 0, y: 14, scale: 0.55 }}
          animate={{
            opacity: [0, 0.95, 0.5, 0],
            x: ember.x,
            y: ember.y,
            scale: [0.55, 1, 0.78],
          }}
          transition={{
            duration: ember.duration,
            delay: ember.delay,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            left: "50%",
            top: "54%",
            width: ember.size,
            height: ember.size,
            borderRadius: "50%",
            background: ember.color,
            boxShadow: `0 0 12px ${ember.color}`,
          }}
        />
      ))}
    </div>
  )
}

function FireBurst({ broken, frozen }: { broken: boolean; frozen?: boolean }) {
  const shouldReduceMotion = useReducedMotion()
  const active = !broken && !frozen
  const flameFilter = broken
    ? "grayscale(0.85) saturate(0.45) brightness(0.72)"
    : frozen
      ? "saturate(0.72) hue-rotate(118deg) brightness(1.12)"
      : "saturate(1.08) brightness(1.04)"

  return (
    <div style={{ position: "relative", width: 184, height: 190, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div
        key={broken ? "broken" : frozen ? "frozen" : "active"}
        initial={{ opacity: 0, y: 28, scale: 0.5, rotate: -7 }}
        animate={broken
          ? {
              opacity: [0, 1, 0.36],
              y: [28, 0, 10],
              x: [0, 8, 18],
              scale: [0.5, 1.04, 0.68],
              rotate: [-7, 4, 12],
            }
          : {
              opacity: 1,
              y: shouldReduceMotion ? 0 : [0, -4, 0, -2, 0],
              scale: shouldReduceMotion ? 1 : [0.58, 1.12, 0.98, 1],
              rotate: shouldReduceMotion ? 0 : [-4, 2, -1, 0],
            }}
        transition={broken
          ? { duration: 1.15, ease: [0.16, 1, 0.3, 1] }
          : { duration: shouldReduceMotion ? 0.22 : 1.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 2,
          filter: flameFilter,
          willChange: "transform, opacity, filter",
        }}
      >
        <motion.div
          animate={active && !shouldReduceMotion ? { rotate: [-0.8, 0.9, -0.4], scale: [1, 1.025, 0.99, 1] } : {}}
          transition={{ duration: 0.94, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 82%" }}
        >
          <FlameIcon size={146} />
        </motion.div>
      </motion.div>

      <RisingEmbers active={active} />

      {frozen && <FreezeHalo active={frozen} />}

      {broken && !shouldReduceMotion && (
        <>
          {[0, 1, 2, 3].map((line) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, x: -34, scaleX: 0.25 }}
              animate={{ opacity: [0, 0.78, 0], x: 102, scaleX: [0.25, 1.18, 0.52] }}
              transition={{ duration: 1.05, delay: 0.2 + line * 0.11, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: 32 + line * 16,
                left: -18,
                width: 42,
                height: 3,
                borderRadius: 999,
                background: "rgba(220, 235, 240, 0.62)",
                transformOrigin: "left center",
              }}
            />
          ))}
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={`smoke-${dot}`}
              initial={{ opacity: 0, y: 8, scale: 0.7 }}
              animate={{ opacity: [0, 0.48, 0], y: -44 - dot * 7, scale: [0.7, 1.35, 1.7] }}
              transition={{ duration: 1.45, delay: 0.68 + dot * 0.16, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: 54 + dot * 8,
                top: 17,
                width: 11 + dot * 3,
                height: 11 + dot * 3,
                borderRadius: "50%",
                background: "rgba(220, 235, 240, 0.25)",
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}

export function StreakWelcomeCard({
  streak,
  previousStreak,
  streakBroken,
  onGoWorkout,
}: StreakWelcomeCardProps) {
  const [open, setOpen] = useState(false)
  const [freezeUsed, setFreezeUsed] = useState(false)
  const [freezing, setFreezing] = useState(false)
  const hasActiveStreak = streak > 0
  const showMoment = hasActiveStreak || streakBroken
  const missedStreak = streakBroken && !hasActiveStreak
  const displayStreak = hasActiveStreak ? streak : previousStreak

  useEffect(() => {
    if (!showMoment) {
      setOpen(false)
      return
    }

    const dayKey = new Date().toDateString()
    const stateKey = hasActiveStreak ? "active" : "broken"
    const storageKey = `fitsched-streak-pop:${stateKey}:${displayStreak}:${dayKey}`
    if (window.sessionStorage.getItem(storageKey)) return

    window.sessionStorage.setItem(storageKey, "1")
    setFreezeUsed(false)
    setFreezing(false)
    setOpen(true)
  }, [displayStreak, hasActiveStreak, showMoment])

  if (!showMoment) return null

  const close = () => setOpen(false)
  const goWorkout = () => {
    setOpen(false)
    onGoWorkout()
  }
  const useFreeze = () => {
    setFreezing(true)
    window.setTimeout(() => {
      setFreezeUsed(true)
      setFreezing(false)
    }, 950)
  }

  const freezeActive = missedStreak && (freezing || freezeUsed)
  const frozenTitle = freezeUsed ? `${displayStreak} day streak protected` : "Protect your streak"
  const activeTitle = `${displayStreak} day streak is alive`
  const title = hasActiveStreak ? activeTitle : missedStreak ? frozenTitle : "Your streak went quiet"

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9996,
            background: "rgba(0, 0, 0, 0.56)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Streak welcome"
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 170, damping: 20 }}
            style={{
              position: "relative",
              width: "min(92vw, 390px)",
              overflow: "visible",
              borderRadius: 0,
              padding: "22px",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close streak welcome"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 34,
                height: 34,
                borderRadius: "999px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background: "rgba(255, 255, 255, 0.07)",
                color: "rgba(255, 255, 255, 0.72)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={16} strokeWidth={2.4} />
            </button>

            <FireBurst broken={missedStreak && !freezeActive} frozen={freezeActive} />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.28, ease: "easeOut" }}
            >
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.17em", color: freezeActive ? "rgba(171, 236, 255, 0.72)" : "rgba(255, 255, 255, 0.48)", textTransform: "uppercase", marginBottom: 7 }}>
                {freezeActive ? "Streak freeze" : missedStreak ? "Recovery moment" : "Welcome back"}
              </div>
              <div style={{ fontSize: 25, lineHeight: 1.08, fontWeight: 950, letterSpacing: "-0.35px" }}>
                {title}
              </div>
              <div style={{ maxWidth: 288, margin: "10px auto 0", color: "rgba(255, 255, 255, 0.64)", fontSize: 13, lineHeight: 1.48 }}>
                {hasActiveStreak
                  ? "Keep it warm with today's workout."
                  : freezeUsed
                    ? "The missed day is frozen for now. Finish today's workout to keep the streak moving."
                    : missedStreak && displayStreak > 0
                    ? `That ${displayStreak} day run can still become today's comeback. Freeze the miss, then train.`
                    : "Start fresh today and build the next one."}
              </div>
            </motion.div>

            <motion.button
              type="button"
              onClick={missedStreak && !freezeUsed ? useFreeze : goWorkout}
              disabled={freezing}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.72, type: "spring", stiffness: 220, damping: 18 }}
              whileTap={{ scale: 0.985 }}
              style={{
                position: "relative",
                marginTop: 22,
                width: "100%",
                border: "none",
                borderRadius: 16,
                padding: "14px 15px",
                background: hasActiveStreak || freezeUsed ? "#6bbfb8" : "rgba(147, 225, 250, 0.16)",
                color: hasActiveStreak || freezeUsed ? "#10201f" : "#dff8ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                fontSize: 14,
                fontWeight: 950,
                cursor: freezing ? "default" : "pointer",
                opacity: freezing ? 0.72 : 1,
              }}
            >
              {missedStreak && !freezeUsed ? <Snowflake size={17} strokeWidth={2.4} /> : <Dumbbell size={17} strokeWidth={2.4} />}
              <span>{freezing ? "Freezing streak" : missedStreak && !freezeUsed ? "Use freeze" : hasActiveStreak ? "Go exercise" : "Restart streak"}</span>
              {!(missedStreak && !freezeUsed) && <ArrowRight size={16} strokeWidth={2.4} />}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
