import { useEffect, useMemo, useState } from "react";
import { Search, BarChart3 } from "lucide-react";

import architAvatar from "../assets/archit-avatar.png";
import ramAvatar from "../assets/ram-avatar.png";
import golloAvatar from "../assets/gollo-avatar.png";
import { api } from "@/lib/api";

/* ------------------------------- Types -------------------------------- */

export type RoleKey = "admin" | "editor" | "user" | "other";

interface User {
  _id?: string;
  username: string;
  email: string;
  role: "admin" | "editor" | "user" | string;
  status: "Active" | "Inactive" | "Pending" | string;
  avatar?: string;
  /** Optional activity percent (0–100). If missing we derive one deterministically. */
  activityPct?: number;
}

type ApiError = { error?: string };

/* --------------------------- Helper styling --------------------------- */

const roleChip = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "bg-[#5C6AC4]";
    case "editor":
      return "bg-[#8A9BDB]";
    default:
      return "bg-[#B9C3E9]";
  }
};

const statusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === "active") return "bg-emerald-500/15 text-emerald-400";
  if (s === "pending") return "bg-amber-500/15 text-amber-400";
  return "bg-rose-500/15 text-rose-400"; // inactive / anything else
};

const toRoleKey = (role?: string): RoleKey => {
  const r = (role ?? "").toLowerCase();
  if (r === "admin" || r === "editor" || r === "user") return r;
  return "other";
};
/* ----------------------- Decorative Coin Fountain ----------------------- */
type CoinStyle = React.CSSProperties & Record<"--rise" | "--drift", string>;

function Coin({
  delay = 0,
  left = 50,
  size = 28,
  rise = 38,
  drift = 0,
  duration = 2.8,
}: {
  delay?: number;
  left?: number; // % from left
  size?: number; // px
  rise?: number; // vh upwards
  drift?: number; // vw horizontal drift
  duration?: number;
}) {
  const style: CoinStyle = {
    left: `${left}%`,
    width: size,
    height: size,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    "--rise": `${rise}vh`,
    "--drift": `${drift}vw`,
  };

  return (
    <span
      aria-hidden
      className="absolute bottom-[-48px] will-change-transform animate-coin pointer-events-none"
      style={style}
    >
      <svg
        viewBox="0 0 100 100"
        className="block w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,.25)]"
      >
        <defs>
          <linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--coin-edge)" />
            <stop offset="60%" stopColor="var(--coin-fill)" />
            <stop offset="100%" stopColor="var(--coin-shine)" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="url(#coinGrad)"
          stroke="var(--coin-edge)"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r="28"
          fill="transparent"
          stroke="var(--coin-ring)"
          strokeWidth="8"
        />
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fontSize="42"
          fontWeight="700"
          fill="var(--coin-symbol)"
        >
          $
        </text>
      </svg>
    </span>
  );
}

function CoinFountain() {
  // Not a hook — safe to compute conditionally
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Call hooks unconditionally; return [] when reduced motion is on
  const coins = useMemo(() => {
    if (prefersReduced)
      return [] as Array<{
        key: number;
        delay: number;
        left: number;
        size: number;
        rise: number;
        drift: number;
        duration: number;
      }>;

    const count = 14; // tweak density
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      delay: (i * 0.22) % 3.4,
      left: Math.random() * 100,
      size: 22 + Math.random() * 22,
      rise: 26 + Math.random() * 26,
      drift: -10 + Math.random() * 20,
      duration: 2.6 + Math.random() * 0.9,
    }));
  }, [prefersReduced]);

  // If there are no coins (reduced motion), render nothing
  if (coins.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh] overflow-visible z-10"
    >
      {coins.map(({ key, ...rest }) => (
        <Coin key={key} {...rest} />
      ))}
    </div>
  );
}

/* ------------------------------ Component ----------------------------- */

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 4;

  /* ------------------------------- Fetch ------------------------------- */

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(api("/api/users"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: User[] | ApiError = await res.json();

        if (res.ok && Array.isArray(data)) {
          setUsers(
            data.map((u: User, i: number) => ({
              ...u,
              avatar:
                u.avatar ||
                [architAvatar, ramAvatar, golloAvatar][i % 3] ||
                architAvatar,
            }))
          );
        } else {
          const err = (data as ApiError).error ?? "Error fetching users";
          console.error("Error fetching users:", err);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  /* ---------------------------- Derived data --------------------------- */

  // Deterministic fallback activity % if not present
  const withActivity = useMemo(() => {
    return users.map((u, i) => {
      if (typeof u.activityPct === "number") return u;
      // derive a pleasant % range 20–90 based on index
      const pct = 20 + ((i * 29) % 71);
      return { ...u, activityPct: pct };
    });
  }, [users]);

  // Search filter
  const filtered = useMemo(() => {
    if (!query.trim()) return withActivity;
    const q = query.toLowerCase();
    return withActivity.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.status?.toLowerCase().includes(q)
    );
  }, [withActivity, query]);

  // Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const startIdx = (clampedPage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  // Role counts
  const roleCounts = useMemo<Record<RoleKey, number>>(() => {
    const counts: Record<RoleKey, number> = {
      admin: 0,
      editor: 0,
      user: 0,
      other: 0,
    };
    for (const u of filtered) {
      const key = toRoleKey(u.role);
      counts[key] += 1;
    }
    return counts;
  }, [filtered]);

  /* ------------------------------ Render ------------------------------- */

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    // relative so the footer image can be absolutely positioned without adding height
    <div className="relative px-6 pt-2 min-h-dvh pb-8">
      {/* Title + Search (pulled up slightly to align with left-rail logo) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 -mt-3 sm:-mt-6 mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground">
            User Management
          </h1>
        </div>

        <div className="sm:ml-auto w-full sm:w-80">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search"
              className="
                w-full pl-9 pr-3 py-1 rounded-lg
                bg-muted border border-elev
                focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#3B82F6)]
              "
            />
          </label>
        </div>
      </div>

      {/* Main grid: Activity (2) + Roles (1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <section className="lg:col-span-2 rounded-xl bg-surface border border-elev p-6 card-inset">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-foreground/60" />
            <h2 className="text-lg font-semibold text-foreground">User List</h2>
          </div>

          <div className="space-y-5">
            {pageItems.map((user) => (
              <div key={user._id || user.email} className="flex items-center">
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
                        width: `${Math.max(
                          5,
                          Math.min(100, user.activityPct ?? 0)
                        )}%`,
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
            ))}

            {pageItems.length === 0 && (
              <div className="text-sm text-foreground/60">No users found.</div>
            )}
          </div>
        </section>

        {/* User Roles card */}
        <aside className="rounded-xl bg-surface border border-elev p-6 card-inset">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            User Roles
          </h2>

          <div className="space-y-4">
            {[
              {
                name: "Admin",
                key: "admin" as RoleKey,
                chip: roleChip("admin"),
              },
              {
                name: "Editor",
                key: "editor" as RoleKey,
                chip: roleChip("editor"),
              },
              { name: "User", key: "user" as RoleKey, chip: roleChip("user") },
            ].map((r) => (
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
              <span className="text-3xl font-bold text-foreground">
                {filtered.length}
              </span>
              <span className="ml-2 text-sm font-medium text-emerald-500">
                +2 this month
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 gap-3">
        <div className="text-sm text-foreground/60">
          Showing{" "}
          <span className="font-medium text-foreground">
            {total === 0 ? 0 : startIdx + 1}
          </span>{" "}
          to <span className="font-medium text-foreground">{endIdx}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span> results
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={clampedPage === 1}
            className="px-3 py-1 rounded-md border border-elev text-sm text-foreground/70 hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            const active = n === clampedPage;
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={clampedPage === totalPages}
            className="px-3 py-1 rounded-md border border-elev text-sm text-foreground/70 hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <CoinFountain />
    </div>
  );
}
