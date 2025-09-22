import { BarChart3 } from "lucide-react";
import UserRow from "./UserRow";
import type { User } from "./types";

function UserRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center animate-pulse">
          <div className="flex items-center w-1/3 min-w-[220px] pr-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
            <div className="ml-3 space-y-2">
              <div className="h-3 w-24 rounded bg-gray-200/80 dark:bg-gray-700/80" />
              <div className="h-2 w-16 rounded bg-gray-200/70 dark:bg-gray-700/70" />
            </div>
          </div>
          <div className="flex-1 px-4">
            <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div className="h-full w-0 rounded-full bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-300 dark:from-indigo-500 dark:via-indigo-600 dark:to-indigo-500 animate-[loading-bar_1.8s_infinite]" />
            </div>
          </div>
          <div className="w-28 text-right">
            <div className="inline-block h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
      `}</style>
    </div>
  );
}

export default function UserList({
  items,
  loading,
  pageSize,
}: {
  items: User[];
  loading: boolean;
  pageSize: number;
}) {
  return (
    <section className="lg:col-span-2 rounded-xl bg-surface border border-elev p-6 card-inset">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-4 h-4 text-foreground/60" />
        <h2 className="text-lg font-semibold text-foreground">User List</h2>
      </div>

      {loading ? (
        <UserRowSkeleton count={pageSize} />
      ) : items.length ? (
        <div className="space-y-5">
          {items.map((u) => (
            <UserRow key={u._id || u.email} user={u} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-foreground/60">No users found.</div>
      )}
    </section>
  );
}
