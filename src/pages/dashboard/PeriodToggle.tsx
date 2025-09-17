/* -------------------------------------------------------------------------------------------------
 * PeriodToggle
 *
 * Intent:
 *   Small, focused tab control for switching the dashboard period (Today | This Week | This Month).
 *   Animates press state for a tactile feel without introducing accessibility hazards.
 *
 * Trade-offs:
 *   - Uses framer-motion for a micro-scale “press” animation only; no layout shifts.
 *   - Keeps semantics correct (role=tablist / aria-selected) for screen readers.
 *
 * Usage:
 *   <PeriodToggle value={active} onChange={setActive} />
 *
 * Notes:
 *   - This is intentionally decoupled from any global theming or router concerns.
 *   - We import PERIODS/Period from constants to ensure the tabs and type union never diverge.
 * ------------------------------------------------------------------------------------------------ */

import { useState } from "react";
import { motion } from "framer-motion";
import { PERIODS, type Period } from "./constants";

type Props = {
  /** Currently selected period tab. */
  value: Period;
  /** Upstream setter. Caller owns the state (controlled component). */
  onChange: (p: Period) => void;
};

export default function PeriodToggle({ value, onChange }: Props) {
  // Local UI-only state to give a subtle press animation feedback.
  const [pressed, setPressed] = useState(false);

  return (
    <motion.div
      role="tablist"
      aria-label="Select period"
      className="inline-flex items-center gap-1 rounded-full p-1 bg-surface border border-elev card-inset"
      style={{ transformOrigin: "center" }}
      // Keep pointer handlers tight; we only need them to animate the scale.
      onPointerDownCapture={() => setPressed(true)}
      onPointerUpCapture={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      animate={{ scale: pressed ? 0.97 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.6 }}
    >
      {PERIODS.map((label) => {
        const active = value === label;

        return (
          <button
            key={label}
            role="tab"
            aria-selected={active}
            // Keep it controlled: we surface the next value and let the parent own state.
            onClick={() => onChange(label)}
            className={[
              "px-3.5 py-1.5 rounded-full text-sm font-medium",
              // Focus ring uses CSS vars to match brand token (light/dark safe).
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "ring-[var(--primary-color,#3B82F6)] dark:focus-visible:ring-offset-[#0b1220]",
              active
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </motion.div>
  );
}
