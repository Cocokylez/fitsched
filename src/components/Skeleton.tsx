"use client"

function SkeletonPulse({ className }: { className: string }) {
  return (
    <div
      className={`rounded-lg bg-[var(--surface-2)] ${className}`}
      style={{ animation: "skeletonPulse 1.6s ease-in-out infinite" }}
    />
  )
}

export function SkeletonLine({
  width = "100%",
  height = "16px",
  borderRadius = "8px",
}: {
  width?: string
  height?: string
  borderRadius?: string
}) {
  const widthClass =
    width === "100%" ? "w-full" :
    width === "40%" ? "w-[40%]" :
    width === "60%" ? "w-[60%]" :
    width === "70%" ? "w-[70%]" :
    width === "120px" ? "w-[120px]" :
    width === "48px" ? "w-12" :
    width === "28px" ? "w-7" : "w-full"
  const heightClass =
    height === "28px" ? "h-7" :
    height === "20px" ? "h-5" :
    height === "14px" ? "h-3.5" :
    height === "12px" ? "h-3" :
    height === "10px" ? "h-2.5" : "h-4"
  const radiusClass = borderRadius === "20px" ? "rounded-full" : "rounded-lg"
  return <SkeletonPulse className={`${widthClass} ${heightClass} ${radiusClass}`} />
}

export function SkeletonCard({ height = "80px" }: { height?: string }) {
  return (
    <div className="mb-2 flex w-full items-center gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--panel)] px-4 py-4">
      <SkeletonPulse className="h-10 w-10 shrink-0 rounded-[12px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <SkeletonPulse className="h-3 w-[55%] rounded-full" />
        <SkeletonPulse className="h-2.5 w-[38%] rounded-full" />
      </div>
      <SkeletonPulse className="h-6 w-14 shrink-0 rounded-full" />
    </div>
  )
}

export function SkeletonExerciseRow() {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5">
      <SkeletonPulse className="h-7 w-7 shrink-0 rounded-lg" />
      <SkeletonPulse className="h-3 w-[120px] rounded-full" />
      <div className="ml-auto">
        <SkeletonPulse className="h-5 w-12 rounded-full" />
      </div>
    </div>
  )
}
