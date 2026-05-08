export default function SectionDivider() {
  return (
    <div className="relative flex items-center justify-center py-2 px-8 max-w-[1100px] mx-auto">
      {/* Left fade line */}
      <div
        className="flex-1 h-px"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(var(--accent-rgb), 0.25))',
        }}
      />

      {/* Center diamond */}
      <div className="mx-4 flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-sm rotate-45"
          style={{ background: 'rgba(var(--accent-rgb), 0.5)' }}
        />
        <div
          className="w-2 h-2 rounded-sm rotate-45"
          style={{ background: 'rgba(var(--accent-rgb), 0.8)' }}
        />
        <div
          className="w-1.5 h-1.5 rounded-sm rotate-45"
          style={{ background: 'rgba(var(--accent-rgb), 0.5)' }}
        />
      </div>

      {/* Right fade line */}
      <div
        className="flex-1 h-px"
        style={{
          background: 'linear-gradient(to left, transparent, rgba(var(--accent-rgb), 0.25))',
        }}
      />
    </div>
  )
}
