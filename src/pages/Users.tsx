// src/pages/Users.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";


import user1 from "../assets/user 1.png";
import user2 from "../assets/user 2.png";
import user3 from "../assets/user 3.png";
import adminAvatar from "@/assets/admin.png";

import { api } from "@/lib/api";
import { logout as clearAuth } from "@/lib/api";

import PageTitle from "@/components/PageTitle";
import HeaderActions from "@/components/header/HeaderActions";
import HeaderSearch from "@/components/header/HeaderSearch";
import ConfirmLogoutModal from "@/components/ConfirmLogoutModal";
import Rev9Wordmark from "@/components/header/Rev9Wordmark";


import UserList from "./users/UserList";
import RolesCard from "./users/RolesCard";
import Pagination from "./users/pagination";


import { toRoleKey } from "./users/helpers";
import type { ApiError, RoleKey, User } from "./users/types";

/* ------------------------------ Page ------------------------------ */

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 4;

  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = useCallback(() => {
    try {
      clearAuth();
    } finally {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
      if (e.key === "Enter") handleLogout();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmOpen, handleLogout]);

  // Load users
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(api("/api/users"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: User[] | ApiError = await res.json();
        if (!isMounted) return;
        if (res.ok && Array.isArray(data)) {
          const avatars = [user1, user2, user3];
          setUsers(
            data.map((u, i) => ({
              ...u,
              avatar:
                typeof u.avatar === "string" && /^https?:\/\//i.test(u.avatar)
                  ? u.avatar
                  : avatars[i % avatars.length],
              activityPct:
                typeof u.activityPct === "number"
                  ? u.activityPct
                  : 20 + ((i * 29) % 71),
            }))
          );
        } else {
          console.error("Error fetching users:", (data as ApiError).error);
        }
      } catch (e) {
        console.error("Failed to fetch users:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  /* ---------------------------- Derived data --------------------------- */

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.status?.toLowerCase().includes(q)
    );
  }, [users, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const startIdx = (clampedPage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  const roleCounts = useMemo<Record<RoleKey, number>>(() => {
    const counts: Record<RoleKey, number> = {
      admin: 0,
      editor: 0,
      user: 0,
      other: 0,
    };
    for (const u of filtered) counts[toRoleKey(u.role)] += 1;
    return counts;
  }, [filtered]);

  const handleHeaderSearch = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  /* ------------------------------ Render ------------------------------- */

  return (
    <div className="relative 7 pt-0 min-h-dvh pb-8">
      <PageTitle title="Users" />

      {/* Header row — same baseline/height as dashboard */}
      <div className="flex items-center gap-4 mb-6 h-6">
        {/* Left: Rev9 brand (flush-left, same row height) */}
        <div className="flex items-center gap-3 shrink-0 h-full">
          <Rev9Wordmark className="text-[32px] sm:text-[36px] md:text-[42px]" />
        </div>

        {/* Center: Search (desktop) — fills middle, same row height */}

        <div className="hidden sm:flex flex-1 items-center h-full">
          <HeaderSearch
            size="slim"
            onSearch={handleHeaderSearch}
            defaultValue={query}
            className="w-full max-w-[1200px] mx-4"
            hideIcon
            placeholder="Search for users"
            inputClassName="text-[18px] sm:text-[15px] font-medium leading-tight"
          />
        </div>

        {/* Right: Actions — pinned to far right, same row height */}
        <div className="ml-auto h-full flex items-center">
          <HeaderActions
            avatarSrc={adminAvatar}
            onRequestLogout={() => setConfirmOpen(true)}
            homeLabel="Dashboard" // rename Home → Dashboard on this page
            hideUsers
            className="-mt-[6px]" // hide Users link only on this page
          />
        </div>
      </div>

      {/* Mobile search — below header like dashboard/JSR */}
      <div className="sm:hidden -mt-2 mb-4">
        <HeaderSearch onSearch={handleHeaderSearch} defaultValue={query} />
      </div>

      {/* Page Title */}
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          User Management
        </h1>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserList
          items={pageItems}
          loading={loading && users.length === 0}
          pageSize={PAGE_SIZE}
        />
        <RolesCard roleCounts={roleCounts} total={filtered.length} />
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
        <Pagination
          totalPages={totalPages}
          current={clampedPage}
          onChange={setPage}
        />
      </div>

      {/* Confirm Logout Modal */}
      {confirmOpen && (
        <ConfirmLogoutModal
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
}
