export default function Pagination({
  totalPages,
  current,
  onChange,
}: {
  totalPages: number;
  current: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="px-3 py-1 rounded-md border border-elev text-sm text-foreground/70 hover:bg-muted disabled:opacity-50"
      >
        Previous
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const n = i + 1;
        const active = n === current;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={[
              "px-3 py-1 rounded-md border border-elev text-sm hover:bg-muted",
              active ? "bg-muted" : "",
            ].join(" ")}
          >
            {n}
          </button>
        );
      })}

      <button
        onClick={() => onChange(Math.min(totalPages, current + 1))}
        disabled={current === totalPages}
        className="px-3 py-1 rounded-md border border-elev text-sm text-foreground/70 hover:bg-muted disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
