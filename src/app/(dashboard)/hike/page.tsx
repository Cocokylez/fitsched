import { Footprints, Mountain, Route } from "lucide-react"

const HIKE_FEATURES = [
  { label: "Route builder", Icon: Route, desc: "Plan your trail before you go" },
  { label: "Outdoor sessions", Icon: Footprints, desc: "Log hikes and outdoor cardio" },
]

export default function HikePage() {
  return (
    <div className="min-h-full bg-transparent px-4 pb-[118px] pt-8 sm:px-6">
      <div className="mx-auto max-w-[520px]">
        <div className="mb-7">
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

        <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-md)]">
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(135deg,rgba(107,191,184,0.14),transparent_44%),radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.07),transparent_30%)]" />

          <div className="relative px-5 pb-6 pt-8 text-center">
            <div className="mx-auto mb-5 grid h-[84px] w-[84px] place-items-center rounded-[26px] border border-[rgba(107,191,184,0.38)] bg-[rgba(107,191,184,0.13)] shadow-[0_0_32px_rgba(107,191,184,0.18)] text-[#6bbfb8]">
              <Mountain size={38} strokeWidth={1.6} />
            </div>

            <div className="mb-2 text-[21px] font-black leading-tight text-[var(--text)]">
              Trail mode is coming soon
            </div>
            <div className="mx-auto mb-6 max-w-[340px] text-[13px] leading-relaxed text-[var(--text-muted)]">
              This page is ready for tomorrow&apos;s details, so the hike feature can grow without mixing into normal workouts.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px border-t border-[var(--border)] sm:grid-cols-2">
            {HIKE_FEATURES.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-5 py-4 ${i === 0 ? "sm:border-r sm:border-[var(--border)]" : ""}`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-[rgba(107,191,184,0.28)] bg-[rgba(107,191,184,0.1)] text-[#6bbfb8]">
                  <item.Icon size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <div className="text-[13px] font-extrabold text-[var(--text)]">{item.label}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
