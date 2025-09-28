// src/components/header/Rev9Logo.tsx
import * as React from "react";

type Props = { className?: string; label?: string };

// Sparkle points (randomized once on module load)
const SPARKLES = Array.from({ length: 14 }).map(() => ({
  x: (Math.random() * 100).toFixed(2),
  y: (Math.random() * 38 + 20).toFixed(2),
  d: 800 + Math.floor(Math.random() * 1200), // duration ms
  s: (Math.random() * 0.7 + 0.6).toFixed(2), // scale
  dl: Math.floor(Math.random() * 900), // delay ms
}));

// Helper type for CSS custom props
type CSSVars = React.CSSProperties & {
  ["--dur"]?: string;
  ["--scale"]?: string | number;
  ["--delay"]?: string | number;
};

export default function Rev9Logo({
  className = "h-12",
  label = "Rev9",
}: Props) {
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

        {/* Outline/glow so it reads on light/dark */}
        <filter id="rev9-glow" x="-30%" y="-50%" width="160%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodOpacity="0.28" />
        </filter>

        {/* Sparkle symbol */}
        <symbol id="rev9-spark" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="2.1" fill="url(#rev9-money)" />
        </symbol>
      </defs>

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

        .rev9-letter {
          opacity: 0;
          transform: translateY(18px);
          animation: rev9_in 600ms cubic-bezier(.2,.7,.2,1) forwards;
        }
        @keyframes rev9_in {
          to { opacity: 1; transform: translateY(0); }
        }

        .rev9-sheen {
          animation: rev9_pan 4600ms linear infinite;
        }
        @keyframes rev9_pan {
          0% { transform: translateX(-20%); }
          100% { transform: translateX(20%); }
        }

        .rev9-float {
          animation: rev9_float var(--dur) ease-in var(--delay) infinite;
          opacity: 0.0;
        }
        @keyframes rev9_float {
          0%   { transform: translateY(0) scale(var(--scale)); opacity: 0; }
          12%  { opacity: .85; }
          100% { transform: translateY(-28px) scale(var(--scale)); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .rev9-sheen, .rev9-float, .rev9-letter {
            animation-duration: 0ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}
      </style>

      {/* Stroke/outline for readability */}
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

      {/* Gradient fill masked to text with slow pan */}
      <g clipPath="url(#rev9-clip)">
        <rect
          className="rev9-sheen"
          x="-20%"
          y="0"
          width="140%"
          height="120"
          fill="url(#rev9-money)"
        />
      </g>

      {/* Per-letter entrance (staggered) */}
      {letters.map((ch, i) => (
        <text
          key={i}
          x={10 + i * 56}
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

      {/* Sparkles */}
      {SPARKLES.map((s, i) => {
        const style: CSSVars = {
          ["--dur"]: `${s.d}ms`,
          ["--scale"]: s.s,
          ["--delay"]: `${s.dl}ms`,
        };
        return (
          <use
            key={i}
            href="#rev9-spark"
            x={s.x}
            y={s.y}
            className="rev9-float"
            style={style}
            opacity="0.95"
          />
        );
      })}
    </svg>
  );
}
