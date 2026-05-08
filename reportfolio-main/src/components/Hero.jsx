import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

/* ═══════════════════════════════════════════════════════════════
   TECH ARRAY — add your logos here
   Each entry: { label: 'Name', svg: `...paste SVG...` }
   Get SVGs from: simpleicons.org  (click the < > copy button)
   ═══════════════════════════════════════════════════════════════ */
const TECH = [
  {
    label: 'HTML5',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" fill="#E34F26"/></svg>`,
  },
  {
    label: 'CSS3',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.413z" fill="#1572B6"/></svg>`,
  },
  {
    label: 'JavaScript',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="#F7DF1E"/></svg>`,
  },
  {
    label: 'Java',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0 0-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747 1.002c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.56 1.553 17.418-.7 14.977-1.831M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.545.123 5.743-.062 1.798-.153 3.604-.454 3.604-.454s-.634.272-1.092.587c-4.408 1.158-12.927.618-10.478-.568 2.082-.995 3.767-.915 3.767-.915M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-.998 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.54 1.644-2.469 6.197-3.665 5.19-7.626M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639" fill="#007396"/></svg>`,
  },
  {
    label: 'Git',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.605-.404-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187" fill="#F05032"/></svg>`,
  },
  {
    label: 'VS Code',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 19.995V4.005a1.5 1.5 0 0 0-.85-1.418zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" fill="#007ACC"/></svg>`,
  },
  {
    label: 'Tailwind CSS',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" fill="#06B6D4"/></svg>`,
  },
  {
    label: 'GitHub',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="#ffffff"/></svg>`,
  },
  {
    label: 'Node.js',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.605.065-.037.151-.023.218.017l2.256 1.339c.082.045.198.045.275 0l8.795-5.076c.082-.047.134-.141.134-.238V6.921c0-.099-.053-.19-.137-.242l-8.791-5.072c-.081-.047-.189-.047-.271 0L3.075 6.68c-.084.053-.139.146-.139.241v10.15c0 .097.055.189.139.235l2.409 1.392c1.307.654 2.108-.116 2.108-.891V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.111.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675c-.57-.329-.922-.943-.922-1.604V6.921c0-.661.352-1.275.922-1.603l8.795-5.082c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.943.924 1.603v10.15c0 .661-.354 1.275-.924 1.604l-8.794 5.078c-.282.163-.6.247-.925.247zm2.718-6.979c-3.855 0-4.663-1.772-4.663-3.259 0-.142.114-.253.256-.253h1.138c.127 0 .233.092.253.217.172 1.161.683 1.748 3.018 1.748 1.857 0 2.646-.42 2.646-1.405 0-.568-.224-.99-3.112-1.273-2.415-.238-3.907-.773-3.907-2.708 0-1.784 1.503-2.845 4.022-2.845 2.829 0 4.231.981 4.406 3.091.006.07-.019.138-.063.189-.045.05-.108.079-.175.079h-1.143c-.12 0-.225-.084-.251-.199-.276-1.222-.946-1.613-2.774-1.613-2.041 0-2.278.711-2.278 1.244 0 .646.281.835 3.017 1.199 2.709.361 3.997.872 3.997 2.77 0 1.926-1.606 3.017-4.406 3.017z" fill="#339933"/></svg>`,
  },
]

/* ── Typewriter hook ─────────────────────────────────────────── */
function useTypewriter(text, speed = 38, delay = 900) {
  const [out, setOut] = useState('')
  useEffect(() => {
    let i = 0, tid
    const run = () => {
      tid = setInterval(() => {
        setOut(text.slice(0, ++i))
        if (i >= text.length) clearInterval(tid)
      }, speed)
    }
    const start = setTimeout(run, delay)
    return () => { clearTimeout(start); clearInterval(tid) }
  }, [])
  return out
}

/* ── Single icon card ────────────────────────────────────────── */
function TechIcon({ label, svg }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="tech-icon-wrap"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`tech-icon-img ${hovered ? 'icon-hovered' : ''}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className={`tech-icon-label ${hovered ? 'label-visible' : ''}`}>
        {label}
      </div>
    </div>
  )
}

/* ── Marquee ─────────────────────────────────────────────────── */
function TechMarquee() {
  const [paused, setPaused] = useState(false)
  const items = [...TECH, ...TECH, ...TECH]

  return (
    /* mask-image fades edges left/right only — glow is NOT clipped top/bottom */
    <div style={{
      position: 'relative',
      width: '100%',
      paddingTop: '32px',
      paddingBottom: '40px',
      overflow: 'hidden',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
      maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
    }}>
      <div
        style={{ padding: '24px 0' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className={`marquee-track ${paused ? 'marquee-paused' : ''}`}>
          {items.map((t, i) => (
            <TechIcon key={`${t.label}-${i}`} label={t.label} svg={t.svg} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   HERO
   ════════════════════════════════════════════════════════════════ */
export default function Hero() {
  const typed = useTypewriter('1ST YEAR IT STUDENT  •  ASPIRING IT EXPERT')

  const scrollTo = (id) => {
    const el = document.querySelector(id)
    if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' })
  }

  return (
    <section id="hero" className="hero-section">

      {/* Status badge */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="hero-badge"
      >
        <span className="hero-badge-dot" />
        OPEN TO OPPORTUNITIES
      </motion.div>

      {/* Name */}
      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="hero-name"
      >
        ADRIAN KYLE CONDEZA
      </motion.h1>

      {/* Role typewriter */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="hero-role"
      >
        {typed}<span className="hero-caret" />
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="hero-btns"
      >
        <motion.button
          onClick={() => scrollTo('#contact')}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="hero-btn-primary"
        >
          CONTACT
        </motion.button>
        <motion.button
          onClick={() => scrollTo('#about')}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="hero-btn-ghost"
        >
          LEARN MORE
        </motion.button>
      </motion.div>

      {/* Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        style={{ width: '100%', overflow: 'visible' }}
      >
        <TechMarquee />
      </motion.div>

      {/* ══ STYLES ══════════════════════════════════════════════ */}
      <style>{`

        .hero-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px 40px;
          background: transparent;
          position: relative;
        }

        /* ── Badge ── */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 999px;
          padding: 9px 22px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #e0e0e0;
          margin-bottom: 44px;
          box-shadow: 0 0 24px rgba(255,255,255,0.05);
        }
        .hero-badge-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #30d158;
          box-shadow: 0 0 8px rgba(48,209,88,0.9);
          flex-shrink: 0;
          animation: greenPulse 2s ease-in-out infinite;
        }
        @keyframes greenPulse {
          0%,100% { box-shadow: 0 0 5px rgba(48,209,88,0.7); }
          50%      { box-shadow: 0 0 14px rgba(48,209,88,1); }
        }

        /* ── Name ── */
        .hero-name {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2.6rem, 7.5vw, 6rem);
          font-weight: 400;
          letter-spacing: -0.01em;
          line-height: 1.0;
          color: #f5f5f5;
          margin: 0 0 22px 0;
        }

        /* ── Role ── */
        .hero-role {
          font-size: clamp(0.7rem, 1.6vw, 0.9rem);
          font-weight: 600;
          letter-spacing: 0.14em;
          color: #3b9eff;
          margin-bottom: 44px;
          min-height: 1.4em;
        }
        .hero-caret {
          display: inline-block;
          width: 2px; height: 0.9em;
          background: #3b9eff;
          margin-left: 2px;
          vertical-align: text-bottom;
          border-radius: 1px;
          animation: caretBlink 1s step-end infinite;
        }
        @keyframes caretBlink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* ── Buttons ── */
        .hero-btns {
          display: flex; gap: 20px; flex-wrap: wrap;
          justify-content: center; margin-bottom: 64px;
        }
        .hero-btn-primary {
          background: #2563eb; color: #fff; border: none;
          border-radius: 999px; padding: 13px 34px;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em;
          cursor: crosshair;
          box-shadow: 0 4px 24px rgba(37,99,235,0.45);
        }
        .hero-btn-ghost {
          background: rgba(255,255,255,0.06); color: #ccc;
          border: 1.5px solid rgba(255,255,255,0.14);
          border-radius: 999px; padding: 13px 34px;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em;
          cursor: crosshair;
        }

        /* ══ MARQUEE ═══════════════════════════════════════════ */
        .marquee-track {
          display: flex;
          align-items: center;
          gap: 52px;
          width: max-content;
          overflow: visible;
          /* 50% because items = TECH*3, scroll 1/3 of total = 33% of 3x */
          animation: marqueeScroll 40s linear infinite;
        }
        .marquee-track.marquee-paused {
          animation-play-state: paused;
        }
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }

        /* ══ ICON CARD ═════════════════════════════════════════ */
        .tech-icon-wrap {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: crosshair;
          flex-shrink: 0;
          padding: 8px;
          overflow: visible;
        }

        .tech-icon-img {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: grayscale(0.3) opacity(0.55);
          transition: filter 0.3s ease, transform 0.3s ease;
        }
        .tech-icon-img svg {
          width: 100%;
          height: 100%;
        }

        /* Hover: full color + glow + scale */
        .tech-icon-img.icon-hovered {
          filter: grayscale(0) opacity(1) drop-shadow(0 0 12px rgba(255,255,255,0.5));
          transform: scale(1.35) translateY(-4px);
        }

        /* Name label */
        .tech-icon-label {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #60a5fa;
          opacity: 0;
          transform: translateY(5px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          white-space: nowrap;
          pointer-events: none;
        }
        .tech-icon-label.label-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 600px) {
          .hero-badge  { margin-bottom: 28px; }
          .hero-name   { margin-bottom: 16px; }
          .hero-role   { margin-bottom: 28px; }
          .hero-btns   { margin-bottom: 44px; gap: 12px; }
          .tech-icon-img { width: 36px; height: 36px; }
        }
      `}</style>
    </section>
  )
}
