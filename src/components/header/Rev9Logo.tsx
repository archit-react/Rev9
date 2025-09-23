import * as React from "react";

/**
 * Rev9Logo
 * - Animated money gradient that gently pans (CSS keyframes)
 * - Soft outer glow (different in light vs dark)
 * - Per-letter slide-in (staggered) for a lively entrance
 * - Tiny “cash sparkles” that float up randomly (JSR-inspired motion variety)
 * - Respects prefers-reduced-motion
 *
 * Props:
 *  - className: pass height/width via Tailwind (e.g., "h-10 sm:h-12")
 *  - label: override text ("Rev9" by default)
 */
type Props = { className?: string; label?: string };

const SPARKLES = Array.from({ length: 14 }).map((_, i) => ({
  // light random scatter around the word
  x: (Math.random() * 100).toFixed(2),
  y: (Math.random() * 38 + 20).toFixed(2),
  d: 800 + Math.floor(Math.random() * 1200), // ms
  s: (Math.random() * 0.7 + 0.6).toFixed(2), // scale
  dl: Math.floor(Math.random() * 900), // delay
}));

export default function Rev9Logo({
  className = "h-12",
  label = "Rev9",
}: Props) {
  // Split into letters so we can stagger entrance
  const letters = Array.from(label);

  return (
    <svg
      className={className}
      viewBox="0 0 480 120"
      role="img"
      aria-label={label}
      style={{ display: "block" }}
    >
      <defs>
        {/* Animated money gradient (light: greens; dark: cyan→blue) */}
        <linearGradient id="rev9-money" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--rev9-g1, #10b981)" />
          <stop offset="50%" stopColor="var(--rev9-g2, #34d399)" />
          <stop offset="100%" stopColor="var(--rev9-g3, #16a34a)" />
        </linearGradient>

        {/* We animate the gradient by moving this gradientRect mask */}
        <clipPath id="rev9-clip">
          <text
            x="10"
            y="92"
            fontFamily="Audiowide, ui-sans-serif, system-ui"
            fontWeight={800}
            fontSize="88"
            letterSpacing="2"
          >
            {label}
          </text>
        </clipPath>

        {/* Stroke outline to keep readable on white or dark */}
        <filter id="rev9-glow" x="-30%" y="-50%" width="160%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodOpacity="0.28" />
        </filter>

        {/* Sparkle (small circle) */}
        <symbol id="rev9-spark" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="2.1" fill="url(#rev9-money)" />
        </symbol>
      </defs>

      {/* --- Styles: all scoped to this SVG --- */}
      <style>
        {`
        :root {
          /* light money gradient */
          --rev9-g1: #22c55e; /* emerald-500 */
          --rev9-g2: #84cc16; /* lime-500   */
          --rev9-g3: #16a34a; /* emerald-600 */
        }
        .dark :where(svg) {
          /* dark tech gradient */
          --rev9-g1: #22d3ee; /* cyan-400 */
          --rev9-g2: #38bdf8; /* sky-400  */
          --rev9-g3: #3b82f6; /* blue-500 */
        }

        /* Slide-in per-letter */
        .rev9-letter {
          opacity: 0;
          transform: translateY(18px);
          animation: rev9_in 600ms cubic-bezier(.2,.7,.2,1) forwards;
        }
        /* small stagger via style attr */

        @keyframes rev9_in {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Gradient pan (gives living money feel) */
        .rev9-sheen {
          animation: rev9_pan 4600ms linear infinite;
        }
        @keyframes rev9_pan {
          0% { transform: translateX(-20%); }
          100% { transform: translateX(20%); }
        }

        /* Sparkles drift upward + fade */
        .rev9-float {
          animation: rev9_float var(--dur) ease-in var(--delay)ms infinite;
          opacity: 0.0;
        }
        @keyframes rev9_float {
          0%   { transform: translateY(0) scale(var(--scale)); opacity: 0; }
          12%  { opacity: .85; }
          100% { transform: translateY(-28px) scale(var(--scale)); opacity: 0; }
        }

        /* Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .rev9-sheen, .rev9-float, .rev9-letter {
            animation-duration: 0ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}
      </style>

      {/* Outline text to keep readable (paint-order ensures stroke behind fill) */}
      <text
        x="10"
        y="92"
        fontFamily="Audiowide, ui-sans-serif, system-ui"
        fontWeight={900}
        fontSize="88"
        letterSpacing="2"
        fill="none"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="6"
        paintOrder="stroke"
        filter="url(#rev9-glow)"
      >
        {label}
      </text>

      {/* Gradient fill masked to the text, with slow pan */}
      <g clipPath="url(#rev9-clip)">
        {/* Sheen rect (pans horizontally) */}
        <rect
          className="rev9-sheen"
          x="-20%"
          y="0"
          width="140%"
          height="120"
          fill="url(#rev9-money)"
        />
      </g>

      {/* Per-letter entrance (slight JSR vibe without squares) */}
      {letters.map((ch, i) => (
        <text
          key={i}
          x={10 + i * 56} // crude monospace-ish offset; Audiowide looks good here
          y={92}
          className="rev9-letter"
          style={{ animationDelay: `${80 + i * 80}ms` }}
          fontFamily="Audiowide, ui-sans-serif, system-ui"
          fontWeight={900}
          fontSize="88"
          letterSpacing="2"
          fill="url(#rev9-money)"
        >
          {ch}
        </text>
      ))}

      {/* Money sparkles (JSR-inspired little pieces with varied timing) */}
      {SPARKLES.map((s, i) => (
        <use
          key={i}
          href="#rev9-spark"
          x={s.x}
          y={s.y}
          className="rev9-float"
          style={
            {
              // @ts-ignore custom CSS vars
              "--dur": `${s.d}ms`,
              "--scale": s.s,
              "--delay": s.dl,
            } as React.CSSProperties
          }
          opacity="0.95"
        />
      ))}
    </svg>
  );
}
