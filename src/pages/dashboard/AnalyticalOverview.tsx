/* -------------------------------------------------------------------------------------------------
 * AnalyticalOverview
 *
 * Intent:
 *   Present a compact summary of business health (4 stats) below the main charts.
 *   Defaults to static demo values but accepts an override for real data.
 *
 * Design:
 *   - Pure presentational component. No fetching. No time-based logic.
 *   - Stable DOM structure to keep CLS low; minimal wrappers.
 *   - Uses your existing <Card /> container for consistent surface styling.
 *
 * Extensibility:
 *   - If PMs want a fifth/sixth stat, extend the `items` array — no code churn.
 *   - If metrics become dynamic, pass `items` via props from the page shell.
 *
 * Trade-offs:
 *   - We keep a light abstraction instead of splitting each stat into child components;
 *     avoids prop drilling + keeps render cost small for a tiny grid.
 * ------------------------------------------------------------------------------------------------ */

import { TrendingUp, UserPlus, LineChart, Activity } from "lucide-react";
import Card from "@/components/ui/Card";

type OverviewItem = {
  title: string;
  value: string;
  /** React node for the leading glyph; caller controls the icon to avoid coupling. */
  icon: React.ReactNode;
  /** Short status/rationale, e.g., “+20% from last month”. */
  note: string;
  /** Tailwind classes for note color (brand-safe on light/dark). */
  noteClass: string;
};

type Props = {
  /** Provide to override the default demo content. Order renders left→right. */
  items?: OverviewItem[];
};

/** Default demo content — mirrors your original values. Safe to ship screenshots with. */
const DEFAULT_ITEMS: OverviewItem[] = [
  {
    title: "Total Profit",
    value: "$12,545",
    icon: <TrendingUp className="w-4 h-4" />,
    note: "+20% from last month",
    noteClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "New Customers",
    value: "78",
    icon: <UserPlus className="w-4 h-4" />,
    note: "+5% this week",
    noteClass: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Avg. Order Value",
    value: "$127.73",
    icon: <LineChart className="w-4 h-4" />,
    note: "Up 6% from last month",
    noteClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Conversion Rate",
    value: "4.5%",
    icon: <Activity className="w-4 h-4" />,
    note: "Maintained",
    noteClass: "text-yellow-600 dark:text-yellow-400",
  },
];

export default function AnalyticalOverview({ items = DEFAULT_ITEMS }: Props) {
  return (
    <Card className="mt-8 p-10 pb-16 rounded-2xl bg-surface border border-elev !transform-none !transition-none">
      <h3 className="text-xl font-semibold text-foreground mb-4">
        Analytical Overview
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        {items.map((s, i) => (
          <div key={s.title} className="relative px-4 py-3 flex flex-col">
            {/* Separator rule between cards (skip the first). Keep it in-flow for simplicity. */}
            {i > 0 && (
              <span className="absolute -left-12 top-5 bottom-5 w-px bg-gray-300 dark:bg-gray-600 rounded" />
            )}

            <div className="flex items-center gap-2 text-foreground/70">
              <div className="w-7 h-7 rounded-full bg-foreground/5 flex items-center justify-center">
                {s.icon}
              </div>
              <span className="text-sm font-medium">{s.title}</span>
            </div>

            <div className="mt-2 text-2xl font-semibold text-foreground">
              {s.value}
            </div>

            <div className={`mt-1 text-xs font-medium ${s.noteClass}`}>
              {s.note}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
