import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { chartData, baseline6m } from "./constants";
import PeriodToggle from "./PeriodToggle";
import type { Period } from "./constants";

type TooltipPayload = { value: number }[];

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload;
  label?: string;
};

const ChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-lg border border-elev bg-surface px-3 py-2 text-sm shadow-fresh">
      <p className="font-medium text-gray-700 dark:text-gray-100">{label}</p>
      <p className="mt-0.5 font-semibold text-[var(--stroke)]">
        Revenue: {value.toLocaleString()}
      </p>
    </div>
  );
};

const CustomXAxisTick: React.FC<{
  x?: number;
  y?: number;
  payload?: { value: string };
}> = ({ x = 0, y = 0, payload }) => {
  if (!payload) return null;

  // Tweak start/end label positions to avoid clipping.
  let tx = x;
  if (payload.value === chartData[0].month) tx = x + 12;
  else if (payload.value === chartData[chartData.length - 1].month) tx = x - 6;

  return (
    <text
      x={tx}
      y={y + 16}
      fill="currentColor"
      className="text-gray-500 dark:text-gray-400"
      textAnchor="middle"
    >
      {payload.value}
    </text>
  );
};

/** Props for optionally showing the period toggle inside the card */
type Props = {
  /** If provided, shows the PeriodToggle inside the card (top-right). */
  period?: Period;
  onChangePeriod?: (p: Period) => void;
};

export default function RevenueTrend({ period, onChangePeriod }: Props) {
  // Derive totals here to keep the page shell skinny.
  const totalRevenue6m = chartData.reduce((s, m) => s + m.revenue, 0);

  // Normalize literal -> number to satisfy TS when comparing to 0.
  const baseline = Number(baseline6m);
  const revenueDelta6m =
    baseline === 0 ? 0 : ((totalRevenue6m - baseline) / baseline) * 100;

  return (
    <div className="relative mt-8 rounded-2xl bg-surface border border-elev card-inset overflow-hidden">
      {/* Period toggle inside the card (top-right). Only renders if props provided */}
      {period && onChangePeriod && (
        <div className="absolute top-5 right-5 z-10 pointer-events-auto">
          {/* Docked pill so the toggle feels part of the card */}
          <div
            className="
        
        border-black/5 dark:border-white/10
       
       
        backdrop-blur supports-[backdrop-filter]:backdrop-blur-md
        px-6   py-6
      "
          >
            <PeriodToggle value={period} onChange={onChangePeriod} />
          </div>
        </div>
      )}

      <div className="px-6 pt-5 pb-2">
        <p className="text-base font-medium text-foreground/70">
          Revenue Trend
        </p>
        <p className="text-3xl font-bold text-foreground">
          ${totalRevenue6m.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-sm text-foreground/60">Last 6 Months</p>
          <p
            className={`text-sm font-medium ${
              revenueDelta6m >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {revenueDelta6m >= 0 ? "+" : ""}
            {revenueDelta6m.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart area */}
      <div
        className="
          no-chart-focus relative h-80 w-full px-4 sm:px-5 pb-6
         [--stroke:#22c55e] [--fill1:rgba(34,197,94,0.30)] [--fill2:rgba(34,197,94,0)]
         dark:[--stroke:#38bdf8] dark:[--fill1:rgba(56,189,248,0.18)] dark:[--fill2:rgba(56,189,248,0)]
         "
        tabIndex={-1}
        onMouseDownCapture={(e) => e.preventDefault()} // prevent focus ring on click
        onFocusCapture={(e) => (e.target as HTMLElement)?.blur?.()} // and on keyboard focus
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.24] dark:opacity-[0.18]
                     bg-[radial-gradient(1200px_300px_at_50%_0%,rgba(14,165,233,0.10),transparent_60%)]"
        />
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
          >
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy="6"
                  stdDeviation="6"
                  floodOpacity="0.25"
                />
              </filter>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--fill1)" />
                <stop offset="100%" stopColor="var(--fill2)" />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="month"
              tick={(props) => <CustomXAxisTick {...props} />}
              tickMargin={3}
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              padding={{ left: 14, right: 14 }}
            />
            <YAxis
              tickMargin={15}
              width={70}
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
              padding={{ top: 10, bottom: 10 }}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "rgba(0,0,0,0.2)", strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--stroke)"
              strokeWidth={6}
              strokeLinecap="round"
              fill="url(#areaFill)"
              filter="url(#shadow)"
              dot={{ r: 3, fill: "var(--stroke)", strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: "var(--stroke)",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
