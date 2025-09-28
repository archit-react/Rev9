import { useEffect, useRef } from "react";

export type Period = "today" | "week" | "month";

type Props = {
  value: Period;
  onChange: (p: Period) => void;
  className?: string;
};

const LABELS: Record<Period, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
};

const ORDER: Period[] = ["today", "week", "month"];

export default function PeriodTabs({ value, onChange, className = "" }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard nav: ArrowLeft/Right moves focus & changes selection
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      const idx = ORDER.indexOf(value);
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % ORDER.length;
      if (e.key === "ArrowLeft")
        nextIdx = (idx - 1 + ORDER.length) % ORDER.length;
      if (e.key === "Home") nextIdx = 0;
      if (e.key === "End") nextIdx = ORDER.length - 1;
      if (nextIdx !== idx) {
        e.preventDefault();
        onChange(ORDER[nextIdx]);
        // move focus to the newly selected tab
        const btn =
          el.querySelectorAll<HTMLButtonElement>("[role=tab]")[nextIdx];
        btn?.focus();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [value, onChange]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Period"
      className={[
        "relative inline-grid w-full grid-cols-3 rounded-full border border-elev bg-surface p-1",
        "shadow-sm",
        className,
      ].join(" ")}
    >
      {/* Active pill */}
      <div
        aria-hidden="true"
        className="absolute inset-y-1 rounded-full bg-muted transition-[left,width] duration-200"
        style={{
          left:
            value === "today"
              ? "4px"
              : value === "week"
              ? "calc(33.333% + 4px)"
              : "calc(66.666% + 4px)",
          width: "calc(33.333% - 8px)",
        }}
      />

      {ORDER.map((key) => {
        const selected = key === value;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={[
              "relative z-10 h-10 w-full rounded-full text-sm font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40",
              selected
                ? "text-foreground"
                : "text-foreground/60 hover:text-foreground",
            ].join(" ")}
            onClick={() => onChange(key)}
          >
            <span className="block truncate">{LABELS[key]}</span>
          </button>
        );
      })}
    </div>
  );
}
