import { Footprints, Mountain, Route } from "lucide-react"

const HIKE_FEATURES = [
  { label: "Route builder", Icon: Route },
  { label: "Outdoor sessions", Icon: Footprints },
]

/**
 * Shows the placeholder page for the upcoming dedicated Hike feature.
 *
 * @returns The under-construction Hike page UI.
 */
export default function HikePage() {
  return (
    <div
      data-dashboard-scroll
      className="min-h-screen overflow-y-auto bg-[var(--bg)] px-4 pb-[110px] pt-[22px]"
    >
      <div className="mx-auto max-w-[560px]">
        <div className="mb-5">
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-[rgba(107,191,184,0.3)] bg-[rgba(107,191,184,0.1)] px-3 py-[7px] text-[11px] font-black uppercase tracking-[0.08em] text-[#6bbfb8]">
            <Footprints size={14} strokeWidth={1.9} />
            Hike
          </div>
          <h1 className="mb-[9px] text-[32px] font-black leading-[1.05] tracking-normal text-[var(--text)]">
            Under construction
          </h1>
          <p className="max-w-[430px] text-sm leading-[1.55] text-[var(--text-muted)]">
            The Hike section is being prepared as its own dedicated mode. Trail planning, hike sessions, and outdoor progress will live here.
          </p>
        </div>

        <div className="relative grid min-h-[280px] place-items-center overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-[22px] py-[26px] text-center">
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(135deg,rgba(107,191,184,0.12),transparent_42%),radial-gradient(circle_at_70%_24%,rgba(255,255,255,0.07),transparent_28%)]" />

          <div className="relative w-full">
            <div className="mx-auto mb-[18px] grid h-[76px] w-[76px] place-items-center rounded-3xl border border-[rgba(107,191,184,0.35)] bg-[rgba(107,191,184,0.12)] text-[#6bbfb8]">
              <Mountain size={34} strokeWidth={1.7} />
            </div>

            <div className="mb-[7px] text-xl font-black text-[var(--text)]">
              Trail mode is coming soon
            </div>
            <div className="mx-auto mb-5 max-w-[360px] text-[13px] leading-normal text-[var(--text-muted)]">
              This page is ready for tomorrow&apos;s details, so the hike feature can grow without mixing into normal workouts.
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {HIKE_FEATURES.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3.5 text-xs font-extrabold text-[var(--text)]"
                >
                  <item.Icon size={16} strokeWidth={1.8} className="text-[#6bbfb8]" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
