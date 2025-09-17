/* -------------------------------------------------------------------------------------------------
 * RevenueDistribution
 *
 * Intent:
 *   Donut chart + right-side breakdown list for payment methods.
 *   Reads totals + layout “knobs” from constants; math comes from utils.
 *
 * Notes:
 *   - Typed legend/tooltip payloads to avoid implicit any.
 *   - Keep visual constants centralized to simplify designer tweaks.
 * ------------------------------------------------------------------------------------------------ */

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  RD,
  SLICE_COLORS,
  CURRENT,
  type Period,
  type SliceDatum,
} from "./constants";
import { buildRevenueBreakdown, fmtMoney } from "./utils";
import type {
  Props as LegendProps,
  LegendPayload as RechartsLegendPayload,
} from "recharts/types/component/DefaultLegendContent";

const DonutTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: SliceDatum }>;
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const pct = `${(p.payload.pct * 100).toFixed(0)}%`;
  return (
    <div className="rounded-lg border border-elev bg-surface px-3 py-2 text-sm shadow-fresh">
      <div className="font-medium text-foreground">{p.name}</div>
      <div className="text-foreground/70">
        {fmtMoney(p.value)} • {pct}
      </div>
    </div>
  );
};

const legendFormatter: LegendProps["formatter"] = (
  value,
  entry: RechartsLegendPayload
) => {
  const d = entry.payload as SliceDatum | undefined;
  const percent = d ? `${(d.pct * 100).toFixed(0)}%` : "";
  return (
    <span className="text-sm text-foreground/80">
      {String(value)} {percent ? `— ${percent}` : ""}
    </span>
  );
};

export default function RevenueDistribution({ period }: { period: Period }) {
  const { data } = buildRevenueBreakdown(period);

  return (
    <div className="my-8 rounded-2xl bg-surface border border-elev card-inset overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-base font-medium text-foreground/70">
          Revenue Distribution
        </p>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold text-foreground">
            {fmtMoney(CURRENT[period].revenue)}
          </p>
          <p className="text-sm text-foreground/60">by Payment Method</p>
        </div>
      </div>

      {/* Body: grid with donut + list */}
      <div
        className="px-4 sm:px-6 pb-6"
        style={{ paddingRight: RD.cardRightPad }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2 items-center"
          style={{ columnGap: RD.gridGap }}
        >
          {/* Donut */}
          <div
            className="[--donut-stroke:#fff] dark:[--donut-stroke:#0b1220] no-chart-focus"
            style={{ height: RD.donutHeight }}
            tabIndex={-1}
            onMouseDownCapture={(e) => e.preventDefault()}
            onFocusCapture={(e) => (e.target as HTMLElement)?.blur?.()}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter id="innerShadow">
                    <feGaussianBlur
                      in="SourceAlpha"
                      stdDeviation="3"
                      result="blur"
                    />
                    <feOffset dy="2" />
                    <feComposite in2="blur" operator="atop" />
                  </filter>
                </defs>

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={RD.donutInner}
                  outerRadius={RD.donutOuter}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={2}
                  cornerRadius={8}
                  stroke="var(--donut-stroke)"
                  strokeWidth={2}
                >
                  {data.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip content={<DonutTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={legendFormatter}
                  wrapperStyle={{ paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown list */}
          <div
            className="space-y-6 self-center"
            style={{ marginLeft: RD.listShiftX, marginTop: RD.listShiftY }}
          >
            {data.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center justify-between gap-2"
              >
                {/* Label + color dot */}
                <div className="flex items-center gap-3 min-w-[110px]">
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full"
                    style={{
                      backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length],
                    }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {d.name}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2 flex-1 max-w-[360px]">
                  <div className="w-full bg-gray-200/70 dark:bg-gray-700/40 rounded-full h-[10px]">
                    <div
                      className="h-[10px] rounded-full"
                      style={{
                        width: `${Math.round(d.pct * 100)}%`,
                        backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length],
                      }}
                    />
                  </div>
                </div>

                {/* Value + percent */}
                <div className="text-sm text-foreground/70 w-[110px] -ml-1 text-right shrink-0 tabular-nums">
                  {fmtMoney(d.value)} · {Math.round(d.pct * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
