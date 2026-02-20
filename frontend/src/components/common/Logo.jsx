import React from 'react'

/**
 * EduGen Logo
 *
 * Monogram: Geometric E+G constructed from flat rectangles on a navy tile.
 * - E: left vertical spine + 3 horizontal bars (top, middle-short, bottom)
 * - G: right vertical bar + top/bottom bars + middle crossbar, open on left
 * - E and G share the same top-y, middle-y, and bottom-y for visual alignment.
 * Wordmark: "Edu" in #111827, "Gen" in #1E3A8A — Inter, weight 600.
 *
 * Variants:
 *   default  — navy tile (#111827) + dark/blue wordmark
 *   light    — white tile outline + white wordmark (for dark backgrounds)
 *   mark     — icon only, no wordmark
 */

function Logo({ size = 'md', showText = true, variant = 'default' }) {
  const sizes = {
    sm: { icon: 28, wordmarkEdu: 'text-sm',  wordmarkGen: 'text-sm'  },
    md: { icon: 36, wordmarkEdu: 'text-base', wordmarkGen: 'text-base' },
    lg: { icon: 44, wordmarkEdu: 'text-lg',  wordmarkGen: 'text-lg'  },
    xl: { icon: 56, wordmarkEdu: 'text-2xl', wordmarkGen: 'text-2xl' },
  }

  const config = sizes[size] || sizes.md

  // Tile colours
  const tileFill   = variant === 'light' ? 'transparent' : '#111827'
  const tileBorder = variant === 'light' ? '#FFFFFF'     : 'none'
  const markFill   = variant === 'light' ? '#FFFFFF'     : '#FFFFFF'

  // Wordmark colours
  const eduColor = variant === 'light' ? '#FFFFFF' : '#111827'
  const genColor = variant === 'light' ? '#C7D2FE' : '#1E3A8A'

  return (
    <div className="inline-flex items-center gap-2.5 select-none">

      {/* ── Monogram tile ───────────────────────────────────────── */}
      <svg
        width={config.icon}
        height={config.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        {/* Tile background */}
        <rect
          width="48"
          height="48"
          rx="10"
          fill={tileFill}
          stroke={variant === 'light' ? tileBorder : 'none'}
          strokeWidth={variant === 'light' ? 1.5 : 0}
        />

        {/*
          Grid anchor points (viewBox 48×48, 9px padding each side → 30px interior)
            Top-y    : 9
            Middle-y : 22   (centre of 3px bar = 22–25)
            Bottom-y : 36
            E spine  : x=9–12
            E right  : x=9–22
            Gap      : x=22–26
            G left   : x=26
            G right  : x=36–39
        */}

        {/* ── E ───────────────────────────────────────────────── */}
        {/* Vertical spine */}
        <rect x="9"  y="9"  width="3" height="30" fill={markFill} />
        {/* Top bar */}
        <rect x="9"  y="9"  width="13" height="3" fill={markFill} />
        {/* Middle bar (shorter — classic E proportions) */}
        <rect x="9"  y="22" width="10" height="3" fill={markFill} />
        {/* Bottom bar */}
        <rect x="9"  y="36" width="13" height="3" fill={markFill} />

        {/* ── G ───────────────────────────────────────────────── */}
        {/* Top bar */}
        <rect x="26" y="9"  width="13" height="3" fill={markFill} />
        {/* Right vertical — full height, closes the G on the right */}
        <rect x="36" y="9"  width="3"  height="30" fill={markFill} />
        {/* Crossbar — extends inward from right, aligns with E's middle bar */}
        <rect x="29" y="22" width="10" height="3" fill={markFill} />
        {/* Bottom bar */}
        <rect x="26" y="36" width="13" height="3" fill={markFill} />
        {/*
          G is intentionally open on the left — the negative space between E and G
          forms the mouth of the G, reinforcing the interlock.
        */}
      </svg>

      {/* ── Wordmark ────────────────────────────────────────────── */}
      {showText && (
        <span
          className={`${config.wordmarkEdu} font-semibold leading-none tracking-tight`}
          style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.01em' }}
        >
          <span style={{ color: eduColor }}>Edu</span>
          <span style={{ color: genColor }}>Gen</span>
        </span>
      )}

    </div>
  )
}

export default Logo
