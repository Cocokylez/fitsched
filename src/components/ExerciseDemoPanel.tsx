"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { getExerciseDemo } from "@/lib/exerciseDemos"

type ExerciseDemoPanelProps = {
  exerciseName: string
  compact?: boolean
  showName?: boolean
  showVisual?: boolean
}

type ExerciseDemoVisualProps = {
  exerciseName: string
  compact?: boolean
  height?: number | string
  objectFit?: "cover" | "contain"
  timerText?: string
  paused?: boolean
  active?: boolean
  onToggleTimer?: () => void
}

/**
 * Renders the start/end exercise demo images and handles fallback image sources.
 *
 * @param props - Demo image paths, labels, timer state, and interaction callbacks.
 * @returns The interactive visual frame for an exercise demo.
 */
function DemoFrame({
  startSrc,
  endSrc,
  startFallbackSrcs,
  endFallbackSrcs,
  startAlt,
  endAlt,
  objectFit = "contain",
  timerText,
  paused = false,
  active = false,
  onToggleTimer,
}: {
  startSrc: string
  endSrc: string
  startFallbackSrcs: string[]
  endFallbackSrcs: string[]
  startAlt: string
  endAlt: string
  objectFit?: "cover" | "contain"
  timerText?: string
  paused?: boolean
  active?: boolean
  onToggleTimer?: () => void
}) {
  const [phase, setPhase] = useState<"start" | "end">("start")
  const [startImageSrc, setStartImageSrc] = useState(startSrc)
  const [endImageSrc, setEndImageSrc] = useState(endSrc)
  const [startFallbackIndex, setStartFallbackIndex] = useState(0)
  const [endFallbackIndex, setEndFallbackIndex] = useState(0)
  const [startFailed, setStartFailed] = useState(false)
  const [endFailed, setEndFailed] = useState(false)

  useEffect(() => {
    setPhase("start")
    setStartImageSrc(startSrc)
    setEndImageSrc(endSrc)
    setStartFallbackIndex(0)
    setEndFallbackIndex(0)
    setStartFailed(false)
    setEndFailed(false)
  }, [startSrc, endSrc])

  useEffect(() => {
    if (!active) return

    const timer = window.setInterval(() => {
      setPhase((current) => (current === "start" ? "end" : "start"))
    }, 2000)

    return () => window.clearInterval(timer)
  }, [active])

  const handleImageError = (position: "start" | "end") => {
    if (position === "start") {
      if (startFallbackIndex < startFallbackSrcs.length) {
        setStartImageSrc(startFallbackSrcs[startFallbackIndex])
        setStartFallbackIndex((index) => index + 1)
        return
      }

      setStartFailed(true)
      return
    }

    if (endFallbackIndex < endFallbackSrcs.length) {
      setEndImageSrc(endFallbackSrcs[endFallbackIndex])
      setEndFallbackIndex((index) => index + 1)
      return
    }

    setEndFailed(true)
  }

  const visiblePhase = startFailed ? "end" : endFailed ? "start" : phase
  const imageClass = `${objectFit === "cover" ? "object-cover" : "object-contain"} absolute inset-0 block h-full w-full [transform:translateZ(0)] transition-opacity duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)]`

  return (
    <button
      type="button"
      onClick={onToggleTimer}
      aria-label={onToggleTimer ? (paused ? "Resume timer" : "Pause timer") : undefined}
      className={`relative grid h-full w-full min-w-0 place-items-center overflow-hidden border-0 bg-[rgba(255,255,255,0.025)] p-0 font-[inherit] text-inherit [-webkit-tap-highlight-color:transparent] ${
        onToggleTimer ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {startFailed && endFailed ? (
        <div className="p-1.5 text-center text-[9px] font-extrabold text-[var(--text-muted)]">
          Pending
        </div>
      ) : (
        <>
          {!startFailed && (
            <Image
              src={startImageSrc}
              alt={startAlt}
              onError={() => handleImageError("start")}
              loading="lazy"
              fill
              sizes="(max-width: 768px) 100vw, 128px"
              unoptimized
              className={`${imageClass} ${visiblePhase === "start" ? "opacity-100" : "opacity-0"}`}
            />
          )}
          {!endFailed && (
            <Image
              src={endImageSrc}
              alt={endAlt}
              onError={() => handleImageError("end")}
              loading="lazy"
              fill
              sizes="(max-width: 768px) 100vw, 128px"
              unoptimized
              className={`${imageClass} ${visiblePhase === "end" ? "opacity-100" : "opacity-0"}`}
            />
          )}
        </>
      )}
      <div className="absolute bottom-[5px] left-[5px] rounded-full bg-[rgba(0,0,0,0.48)] px-[5px] py-0.5 text-[8px] font-black tracking-normal text-white">
        {visiblePhase === "start" ? "START" : "END"}
      </div>
      {timerText && (
        <div className={`absolute bottom-[7px] right-[7px] rounded-full border border-[rgba(107,191,184,0.32)] bg-[rgba(15,18,18,0.74)] font-[950] leading-none text-[#7fd8d1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] [font-variant-numeric:tabular-nums] ${
          paused ? "px-2 py-[5px] text-[11px] opacity-70" : "px-[9px] py-1.5 text-[13px] opacity-100"
        }`}>
          {timerText}
        </div>
      )}
    </button>
  )
}

/**
 * Displays the visual-only exercise demo frame.
 *
 * @param props - Exercise name, sizing, timer, and playback controls.
 * @returns A responsive exercise demo visual.
 */
export function ExerciseDemoVisual({
  exerciseName,
  compact = false,
  height,
  objectFit = "contain",
  timerText,
  paused = false,
  onToggleTimer,
}: ExerciseDemoVisualProps) {
  const demo = useMemo(() => getExerciseDemo(exerciseName), [exerciseName])
  const frameHeightClass = height === "clamp(260px, 52dvh, 390px)"
    ? "h-[clamp(260px,52dvh,390px)] min-h-[clamp(260px,52dvh,390px)]"
    : compact
      ? "h-[88px] min-h-[88px]"
      : "h-[126px] min-h-[126px]"
  const frameRef = useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = frameRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: "160px 0px" },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={frameRef}
      className={`relative overflow-hidden border border-[rgba(107,191,184,0.2)] bg-[linear-gradient(135deg,rgba(107,191,184,0.1),rgba(255,255,255,0.035))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] [contain:layout_paint_style] ${
        compact ? "rounded-[11px]" : "rounded-[14px]"
      } ${frameHeightClass}`}
    >
      <DemoFrame
        startSrc={demo.startAssetPath}
        endSrc={demo.endAssetPath}
        startFallbackSrcs={[demo.startFallbackAssetPath, demo.startSvgFallbackAssetPath, demo.fallbackImagePath]}
        endFallbackSrcs={[demo.endFallbackAssetPath, demo.endSvgFallbackAssetPath, demo.fallbackImagePath]}
        startAlt={`${demo.name} start position`}
        endAlt={`${demo.name} end position`}
        objectFit={objectFit}
        timerText={timerText}
        paused={paused}
        active={isInView}
        onToggleTimer={onToggleTimer}
      />
    </div>
  )
}

/**
 * Displays exercise instructions, target muscles, difficulty, and optional demo visual.
 *
 * @param props - Exercise name and display mode options.
 * @returns The exercise demo information panel.
 */
export function ExerciseDemoPanel({
  exerciseName,
  compact = false,
  showName = false,
  showVisual = true,
}: ExerciseDemoPanelProps) {
  const demo = useMemo(() => getExerciseDemo(exerciseName), [exerciseName])
  const visibleInstructions = compact ? demo.instructions.slice(0, 2) : demo.instructions
  const panelClass = showVisual
    ? compact
      ? "mt-2.5 mb-0 grid grid-cols-[92px_1fr] items-stretch gap-2.5 rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] p-2.5"
      : "mt-3.5 mb-3.5 grid grid-cols-[128px_1fr] items-stretch gap-3.5 rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] p-3"
    : "mb-2.5 grid grid-cols-1 items-stretch gap-3.5 bg-transparent p-0"

  return (
    <div className={`exercise-demo-panel ${panelClass}`}>
      {showVisual && <ExerciseDemoVisual exerciseName={demo.name} compact={compact} />}

      <div className="min-w-0">
        {showName && (
          <div className={`mb-1 font-black text-[var(--text)] ${compact ? "text-[13px]" : "text-base"}`}>
            {demo.name}
          </div>
        )}
        <div className={`mb-2 leading-[1.45] text-[var(--text-muted)] ${compact ? "text-xs" : "text-[13px]"}`}>
          {demo.description}
        </div>
        <ol className={`m-0 list-decimal pl-[18px] leading-normal text-[var(--text)] ${compact ? "text-[11px]" : "text-xs"}`}>
          {visibleInstructions.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ol>
        {!compact && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {demo.targetMuscles.slice(0, 4).map((muscle) => (
              <span
                key={muscle}
                className="rounded-full bg-[rgba(107,191,184,0.12)] px-2 py-1 text-[10px] font-[850] text-[#6bbfb8]"
              >
                {muscle}
              </span>
            ))}
            <span
              className="rounded-full bg-[var(--surface)] px-2 py-1 text-[10px] font-[850] text-[var(--text-muted)]"
            >
              {demo.difficulty}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
