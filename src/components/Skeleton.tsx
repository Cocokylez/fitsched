"use client"

import { useTheme } from '@/context/ThemeContext'

const skeletonHeightClass: Record<string, string> = {
  "60px": "h-[60px]",
  "70px": "h-[70px]",
  "80px": "h-20",
  "88px": "h-[88px]",
  "120px": "h-[120px]",
  "160px": "h-40",
  "200px": "h-[200px]",
}

export function SkeletonLine({ 
  width = '100%', 
  height = '16px',
  borderRadius = '8px'
}: { 
  width?: string, 
  height?: string,
  borderRadius?: string 
}) {
  const { theme } = useTheme()
  const widthClass = width === "100%" ? "w-full" : width === "40%" ? "w-[40%]" : width === "70%" ? "w-[70%]" : width === "120px" ? "w-[120px]" : width === "48px" ? "w-12" : width === "28px" ? "w-7" : "w-full"
  const heightClass = height === "28px" ? "h-7" : height === "20px" ? "h-5" : height === "12px" ? "h-3" : height === "10px" ? "h-2.5" : "h-4"
  const radiusClass = borderRadius === "20px" ? "rounded-[20px]" : "rounded-lg"
  const gradientClass = theme === "dark"
    ? "bg-[linear-gradient(90deg,#242424_25%,#2f2f2f_50%,#242424_75%)]"
    : "bg-[linear-gradient(90deg,#e8e8ea_25%,#f0f0f2_50%,#e8e8ea_75%)]"
  return (
    <div className={`${widthClass} ${heightClass} ${radiusClass} ${gradientClass} bg-[length:200%_100%] [animation:shimmer_1.5s_infinite_ease-in-out]`} />
  )
}

export function SkeletonCard({ height = '80px' }: { height?: string }) {
  return (
    <div className={`mb-2.5 flex w-full flex-col justify-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 ${skeletonHeightClass[height] || "h-20"}`}>
      <SkeletonLine width="40%" height="12px" />
      <SkeletonLine width="70%" height="10px" />
    </div>
  )
}

export function SkeletonExerciseRow() {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5">
      <SkeletonLine width="28px" height="28px" borderRadius="8px" />
      <SkeletonLine width="120px" height="12px" />
      <div className="ml-auto">
        <SkeletonLine width="48px" height="20px" borderRadius="20px" />
      </div>
    </div>
  )
}
