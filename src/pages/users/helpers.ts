import type { RoleKey } from "./types";

export const roleChip = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "bg-[#5C6AC4]";
    case "editor":
      return "bg-[#8A9BDB]";
    default:
      return "bg-[#B9C3E9]";
  }
};

export const statusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === "active") return "bg-emerald-500/15 text-emerald-400";
  if (s === "pending") return "bg-amber-500/15 text-amber-400";
  return "bg-rose-500/15 text-rose-400";
};

export const toRoleKey = (role?: string): RoleKey => {
  const r = (role ?? "").toLowerCase();
  if (r === "admin" || r === "editor" || r === "user") return r;
  return "other";
};
