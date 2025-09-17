/* -------------------------------------------------------------------------------------------------
 * Dashboard constants & shared types
 *
 * Intent:
 *   Centralize data and “knobs” used across dashboard components. This keeps component files lean,
 *   makes tuning safe, and avoids magic numbers scattered everywhere.
 *
 * Constraints:
 *   - Import-only module: no side effects, no React imports, no functions.
 *   - Prefer explicit, narrow types. If shapes change, you want compile-time failures.
 *
 * Consumers:
 *   - Dashboard.tsx, MetricsGrid.tsx, RevenueTrend.tsx, RevenueDistribution.tsx, utils.ts
 * ------------------------------------------------------------------------------------------------ */

export const PERIODS = ["Today", "This Week", "This Month"] as const;

/** Canonical union for valid tabs. Use everywhere a period is referenced. */
export type Period = (typeof PERIODS)[number];

/** Recharts slice payload we attach to legend/tooltip. Keep it minimal. */
export type SliceDatum = {
  name: string;
  /** Absolute currency value for the slice. Computed from pct * total revenue. */
  value: number;
  /** Normalized percent (0..1). Formatting happens at the edge. */
  pct: number;
};

/* =================================================================================================
 * Current metrics per period
 * - Source of truth for counters + CSV export.
 * - When backend lands, keep the shape and swap the provider.
 * ================================================================================================= */
export const CURRENT: Record<
  Period,
  {
    users: number;
    revenue: number;
    conv: number;
    sales: number;
    engagement: number;
    bounce: number;
  }
> = {
  Today: {
    users: 122,
    revenue: 8318,
    conv: 48.1,
    sales: 1800,
    engagement: 63.2,
    bounce: 30.1,
  },
  "This Week": {
    users: 544,
    revenue: 19741,
    conv: 51.3,
    sales: 9564,
    engagement: 71.4,
    bounce: 28.3,
  },
  "This Month": {
    users: 1369,
    revenue: 72340,
    conv: 52.4,
    sales: 52800,
    engagement: 78.6,
    bounce: 26.4,
  },
} as const;

/* -------------------------------------------------------------------------------------------------
 * Baselines for delta math (Users/Revenue).
 * - Keep it tight. If you need more baselines later, extend shape with care.
 * ------------------------------------------------------------------------------------------------ */
export const BASELINE: Record<Period, { users: number; revenue: number }> = {
  Today: { users: 116, revenue: 7233 }, // yesterday
  "This Week": { users: 518, revenue: 17166 }, // last week
  "This Month": { users: 1304, revenue: 62991 }, // last month
} as const;

/** Copy surface for comparison labels (avoid stringly-typed repeats in components). */
export const COMPARE_LABEL: Record<Period, string> = {
  Today: "vs yesterday",
  "This Week": "vs last week",
  "This Month": "vs last month",
};

/* =================================================================================================
 * Revenue distribution (by payment method)
 * - Percent splits MUST sum ~1.0 per period. We reconcile last slice in utils.
 * - If you add a method, ensure SLICE_COLORS has ≥ that many entries.
 * ================================================================================================= */
export const METHOD_PCT: Record<
  Period,
  Array<{ name: string; pct: number }>
> = {
  Today: [
    { name: "UPI", pct: 0.4 },
    { name: "Card", pct: 0.34 },
    { name: "Wallet", pct: 0.17 },
    { name: "NetBanking", pct: 0.09 },
  ],
  "This Week": [
    { name: "UPI", pct: 0.42 },
    { name: "Card", pct: 0.33 },
    { name: "Wallet", pct: 0.16 },
    { name: "NetBanking", pct: 0.09 },
  ],
  "This Month": [
    { name: "UPI", pct: 0.41 },
    { name: "Card", pct: 0.34 },
    { name: "Wallet", pct: 0.15 },
    { name: "NetBanking", pct: 0.1 },
  ],
};

/* -------------------------------------------------------------------------------------------------
 * Visual palette for donut slices
 * - Order matters; index maps to METHOD_PCT order.
 * - Colors chosen for contrast on light/dark; brand-safe.
 * ------------------------------------------------------------------------------------------------ */
export const SLICE_COLORS = ["#00A4EF", "#F25022", "#7FBA00", "#FFB900"]; // UPI, Card, Wallet, NetBanking

/* =================================================================================================
 * Area chart data (last six full months) + baseline for delta badge
 * - Components and CSV export consume this. Keep shape stable.
 * ================================================================================================= */
export const chartData: Array<{ month: string; revenue: number }> = [
  { month: "Mar", revenue: 18200 },
  { month: "Apr", revenue: 22100 },
  { month: "May", revenue: 25350 },
  { month: "Jun", revenue: 27400 },
  { month: "Jul", revenue: 26200 },
  { month: "Aug", revenue: 31000 },
];

/** Previous six months total (Sep–Feb). Used for the “+X%” badge on the trend card. */
export const baseline6m = 130_880;

/* =================================================================================================
 * Layout “knobs” for the Revenue Distribution card
 * - Non-semantic spacing/tuning values that designers iterate on frequently.
 * - Centralizing keeps component code clean and makes polish passes painless.
 * ================================================================================================= */
export const RD = {
  /** px padding on the right to give the list breathing room against the card edge. */
  cardRightPad: 64,
  /** px gap between donut and list columns. */
  gridGap: 24,
  /** Fixed px height to stabilize chart container and prevent layout jumps. */
  donutHeight: 420,
  /** Donut ring radii (Recharts accepts px or %). */
  donutInner: "58%",
  donutOuter: "88%",
  /** Fine-grained offsets to visually align the list with the donut centerline. */
  listShiftX: -1,
  listShiftY: -80,
} as const;
