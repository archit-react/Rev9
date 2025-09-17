/* -------------------------------------------------------------------------------------------------
 * useAnimatedCounters
 *
 * Intent:
 *   Drive the KPI tiles with a lightweight, frame-based tween so numbers “count up”
 *   to the selected period’s targets. Cheap, state-local, and dependency-free.
 *
 * Design notes:
 *   - Runs a short rAF loop on period change. We tween toward targets with a decaying step
 *     (ceil((target - current)/10)) for a quick ease-out feel without pulling in an animation lib.
 *   - Hook remains UI-agnostic: returns raw numbers only; formatting is a caller concern.
 *   - Bounded work: cancels rAF on unmount or when period flips.
 *
 * Trade-offs:
 *   - Not time-based; frame rate variations can alter the exact duration slightly.
 *     Good enough for dashboard candy; replace with spring if product needs precision.
 * ------------------------------------------------------------------------------------------------ */

import { useEffect, useState } from "react";
import { CURRENT } from "./constants";
import type { Period } from "./constants";

export function useAnimatedCounters(active: Period) {
  // Local state is intentionally primitive to keep renders cheap and predictable.
  const [count, setCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [conversion, setConversion] = useState(0);
  const [sales, setSales] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [bounceRate, setBounceRate] = useState(0);

  useEffect(() => {
    let frame: number;

    // Working accumulators – kept outside state to avoid re-render churn mid-tween.
    let u = 0; // users
    let r = 0; // revenue
    let c10 = 0; // conversion *10 to preserve one decimal w/out float jitter
    let s = 0; // sales
    let e10 = 0; // engagement *10
    let b10 = 0; // bounce *10

    const target = CURRENT[active];

    const step = () => {
      // Decaying step: fast at the start, asymptotically approaches target.
      u += Math.ceil((target.users - u) / 10);
      r += Math.ceil((target.revenue - r) / 10);
      c10 += Math.ceil((target.conv * 10 - c10) / 10);
      s += Math.ceil((target.sales - s) / 10);
      e10 += Math.ceil((target.engagement * 10 - e10) / 10);
      b10 += Math.ceil((target.bounce * 10 - b10) / 10);

      // Push to React state in one go. Keep the component render count predictable.
      setCount(u);
      setRevenue(r);
      setConversion(c10 / 10);
      setSales(s);
      setEngagement(e10 / 10);
      setBounceRate(b10 / 10);

      // Continue until all channels hit or exceed their targets.
      const done =
        u >= target.users &&
        r >= target.revenue &&
        c10 >= target.conv * 10 &&
        s >= target.sales &&
        e10 >= target.engagement * 10 &&
        b10 >= target.bounce * 10;

      if (!done) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return { count, revenue, conversion, sales, engagement, bounceRate };
}
