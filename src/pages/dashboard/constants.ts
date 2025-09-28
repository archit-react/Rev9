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

export const SLICE_COLORS = ["#00A4EF", "#F25022", "#7FBA00", "#FFB900"]; // UPI, Card, Wallet, NetBanking

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
