type Props = {
  users: number;
  revenue: number;
  conversion: number;
  sales: number;
  engagement: number;
  bounceRate: number;

  /** Formatted delta badge for Users, e.g. "+2.3% vs last week" */
  usersDeltaText: string;
  /** Formatted delta badge for Revenue, e.g. "-1.1% vs yesterday" */
  revenueDeltaText: string;
};

export default function MetricsGrid({
  users,
  revenue,
  conversion,
  sales,
  engagement,
  bounceRate,
  usersDeltaText,
  revenueDeltaText,
}: Props) {
  // Build the tiles in data-first form; easy to reorder or add/remove.
  const tiles: Array<{
    label: string;
    value: string;
    // Delta text is optional; only Users/Revenue get special coloring.
    deltaText?: string;
  }> = [
    {
      label: "Users",
      value: users.toLocaleString(),
      deltaText: usersDeltaText,
    },
    {
      label: "Revenue",
      value: `$${revenue.toLocaleString()}`,
      deltaText: revenueDeltaText,
    },
    { label: "Conversion", value: `${conversion.toFixed(1)}%` },
    { label: "Sales", value: sales.toLocaleString() },
    { label: "Engagement", value: `${engagement.toFixed(1)}%` },
    { label: "Bounce Rate", value: `${bounceRate.toFixed(1)}%` },
  ];

  return (
    <div className="-mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map((card) => {
        // Delta coloring rules only apply to Users/Revenue, matching original behavior.
        const isUsersOrRevenue =
          card.label === "Users" || card.label === "Revenue";
        const deltaClass =
          isUsersOrRevenue && card.deltaText
            ? card.deltaText.startsWith("+")
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
            : "";

        return (
          <div
            key={card.label}
            className="relative rounded-2xl p-5 bg-surface border border-elev card-inset"
          >
            <p className="text-sm font-medium text-foreground/70 mb-1">
              {card.label}
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {card.value}
            </p>

            {card.deltaText ? (
              <p className={`text-xs mt-1 ${deltaClass}`}>{card.deltaText}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
