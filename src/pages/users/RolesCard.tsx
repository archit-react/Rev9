import { roleChip } from "./helpers";
import type { RoleKey } from "./types";

export default function RolesCard({
  roleCounts,
  total,
}: {
  roleCounts: Record<RoleKey, number>;
  total: number;
}) {
  const rows: Array<{ name: string; key: RoleKey; chip: string }> = [
    { name: "Admin", key: "admin", chip: roleChip("admin") },
    { name: "Editor", key: "editor", chip: roleChip("editor") },
    { name: "User", key: "user", chip: roleChip("user") },
  ];

  return (
    <aside className="rounded-xl bg-surface border border-elev p-6 card-inset">
      <h2 className="text-lg font-semibold text-foreground mb-6">User Roles</h2>

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${r.chip}`} />
              <span className="text-sm font-medium text-foreground">
                {r.name}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground/60">
              {roleCounts[r.key]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-base font-medium text-foreground mb-2">
          Total Users
        </h3>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-foreground">{total}</span>
          <span className="ml-2 text-sm font-medium text-emerald-500">
            +2 this month
          </span>
        </div>
      </div>
    </aside>
  );
}
