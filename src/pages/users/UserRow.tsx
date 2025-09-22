import { roleChip, statusBadge } from "./helpers";
import type { User } from "./types";

export default function UserRow({ user }: { user: User }) {
  return (
    <div className="flex items-center">
      {/* Avatar + name */}
      <div className="flex items-center w-1/3 min-w-[220px] pr-3">
        <img
          src={user.avatar}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <div className="text-sm font-medium text-foreground">
            {user.username}
          </div>
          <div className="text-xs text-foreground/60 capitalize">
            {user.role}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex-1 px-4">
        <div className="h-2.5 w-full rounded-full bg-foreground/[0.08]">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${roleChip(
              user.role
            )}`}
            style={{
              width: `${Math.max(5, Math.min(100, user.activityPct ?? 0))}%`,
            }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="w-28 text-right">
        <span
          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadge(
            user.status
          )}`}
        >
          {user.status}
        </span>
      </div>
    </div>
  );
}
