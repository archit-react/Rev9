/* -------------------------------------------------------------------------------------------------
 * AnalyticalOverview — styled to match RevenueDistribution card
 * Same container (bg-surface + border-elev + card-inset + overflow-hidden),
 * same header placement (px-6 pt-5 pb-2), and same body paddings (px-4 sm:px-6 pb-6).
 * ------------------------------------------------------------------------------------------------ */

import { TrendingUp, UserPlus, LineChart, Activity } from "lucide-react";

type OverviewItem = {
  title: string;
  value: string;
  icon: React.ReactNode;
  note: string;
  noteClass: string;
};

type Props = {
  items?: OverviewItem[];
};

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
    <div className="my-8 rounded-2xl bg-surface border border-elev card-inset overflow-hidden">
      {/* Header — matches RevenueDistribution */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-base font-medium text-foreground/70">
          Analytical Overview
        </p>
      </div>

      {/* Body — same padding scheme as RevenueDistribution */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {items.map((s, i) => (
            <div key={s.title} className="relative px-4 py-3 flex flex-col">
              {/* Divider between items, styled like a subtle hairline */}
              {i > 0 && (
                <span className="absolute -left-12 top-5 bottom-5 w-px bg-gray-200/70 dark:bg-gray-700/40 rounded" />
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
      </div>
    </div>
  );
}
