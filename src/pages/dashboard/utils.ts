import type { Period, SliceDatum } from "./constants";
import { CURRENT, METHOD_PCT } from "./constants";

/** Format whole-dollar currency for UI surfaces and CSV. Keep it locale-aware. */
export const fmtMoney = (n: number): string =>
  `$${Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/**
 * Percentage delta with guard against division by zero.
 * Example: pctChange(110, 100) -> 10
 */
export const pctChange = (curr: number, base: number): number =>
  base === 0 ? 0 : ((curr - base) / base) * 100;

export function buildRevenueBreakdown(period: Period): {
  total: number;
  data: SliceDatum[];
} {
  const total = CURRENT[period].revenue;
  const pct = METHOD_PCT[period];

  const data: SliceDatum[] = pct.map((p, i) => ({
    name: p.name,
    value: i < pct.length - 1 ? Math.round(total * p.pct) : 0, // last slice fixed below
    pct: p.pct,
  }));

  // Reconcile rounding drift into the final slice to preserve exact total.
  const assigned = data.slice(0, -1).reduce((s, d) => s + d.value, 0);
  data[data.length - 1].value = Math.max(total - assigned, 0);

  return { total, data };
}

/** Escape a single CSV field. Keeps Excel/Numbers happy (incl. UTF-8 BOM upstream). */
function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  const needsWrap = /[",\n]/.test(s);
  const esc = s.replace(/"/g, '""');
  return needsWrap ? `"${esc}"` : esc;
}

/** Convert a 2D array of rows → CSV string (with BOM applied by the caller). */
function toCsv(rows: Array<Array<unknown>>): string {
  const lines = rows.map((r) => r.map(csvEscape).join(","));
  // BOM helps Excel auto-detect UTF-8
  return "\uFEFF" + lines.join("\n");
}

/**
 * Build a CSV snapshot of the current dashboard state.
 * Shape is intentionally simple so PMs can open it directly in Sheets/Excel.
 */
export function buildRevenueReportCSV(args: {
  period: Period;
  users: number;
  revenue: number;
  conv: number;
  sales: number;
  engagement: number;
  bounce: number;
  chartData: Array<{ month: string; revenue: number }>;
}): string {
  const { period, users, revenue, conv, sales, engagement, bounce, chartData } =
    args;

  // Derive the latest method breakdown from period state.
  const { data: breakdown } = buildRevenueBreakdown(period);

  const rows: Array<Array<unknown>> = [];

  // Header block
  rows.push(["Report", "Rev9 Dashboard"]);
  rows.push(["Generated At", new Date().toISOString()]);
  rows.push(["Selected Period", period]);
  rows.push([]);

  // KPI block
  rows.push(["Metric", "Value"]);
  rows.push(["Users", users]);
  rows.push(["Revenue", revenue]);
  rows.push(["Conversion (%)", conv]);
  rows.push(["Sales", sales]);
  rows.push(["Engagement (%)", engagement]);
  rows.push(["Bounce Rate (%)", bounce]);
  rows.push([]);

  // Revenue distribution block
  rows.push(["Revenue Distribution", "Value", "Percent"]);
  breakdown.forEach((d) =>
    rows.push([d.name, d.value, Math.round(d.pct * 100)])
  );
  rows.push([]);

  // Trend block (last 6 months)
  rows.push(["Month", "Revenue"]);
  chartData.forEach((m) => rows.push([m.month, m.revenue]));

  return toCsv(rows);
}

/**
 * Trigger a client-side download of a text blob.
 * NOTE: Keep DOM interaction here so the rest of the module remains pure.
 */
export function downloadTextFile(
  filename: string,
  mime: string,
  text: string
): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  // Avoid layout thrash; append to body for consistent click behavior.
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
