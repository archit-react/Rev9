// src/pages/dashboard/dashboard.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Linkedin,
  Github,
  Link as LinkIcon,
  Download,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";

import PageTitle from "@/components/PageTitle";
import ThemeToggle from "@/components/ThemeToggle";
import UserModal from "@/components/UserModal"; // no named type import
import Toast from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { logout as clearAuth } from "@/lib/api";
import adminAvatar from "@/assets/admin.png";

// Dashboard modules (local)
import PeriodToggle from "./PeriodToggle";
import MetricsGrid from "./MetricsGrid";
import RevenueTrend from "./RevenueTrend";
import RevenueDistribution from "./RevenueDistribution";
import AnalyticalOverview from "./AnalyticalOverview";

// Dashboard constants / utils / hooks
import {
  CURRENT,
  BASELINE,
  COMPARE_LABEL,
  chartData,
  type Period,
} from "./constants";
import { buildRevenueReportCSV } from "./utils";
import { useAnimatedCounters } from "./useAnimatedCounters"; // named import

type UserModalProps = React.ComponentProps<typeof UserModal>;
type User = UserModalProps["user"];

const formatDelta = (curr: number, base: number) => {
  if (base === 0) return "—";
  const pct = ((curr - base) / base) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
};

function BrandMark() {
  return (
    <div className="relative w-8 h-8 sm:w-9 sm:h-9 text-[#7c3aed] -translate-y-[1px] shrink-0">
      <svg
        className="absolute inset-0 block"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
          fill="currentColor"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-white text-[19px] sm:text-[21px] font-extrabold leading-none select-none -translate-y-[0.5px]">
        $
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Period>("This Month");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const { count, revenue, conversion, sales, engagement, bounceRate } =
    useAnimatedCounters(activeTab);

  const usersDeltaText = `${formatDelta(
    CURRENT[activeTab].users,
    BASELINE[activeTab].users
  )} ${COMPARE_LABEL[activeTab]}`;

  const revenueDeltaText = `${formatDelta(
    CURRENT[activeTab].revenue,
    BASELINE[activeTab].revenue
  )} ${COMPARE_LABEL[activeTab]}`;

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      const token = localStorage.getItem("token");

      if (editingUser?._id) {
        const res = await fetch(api(`/api/users/${editingUser._id}`), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
        const data = await res.json();
        setToast({
          show: true,
          message: res.ok ? "User updated successfully!" : data.error,
          type: res.ok ? "success" : "error",
        });
      } else {
        const res = await fetch(api("/api/users"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
        const data = await res.json();
        setToast({
          show: true,
          message: res.ok ? "User added successfully!" : data.error,
          type: res.ok ? "success" : "error",
        });
      }
    } catch (err) {
      console.error("Save user error:", err);
      setToast({
        show: true,
        message: "Something went wrong while saving the user.",
        type: "error",
      });
    } finally {
      setShowModal(false);
      setEditingUser(null);
    }
  };

  const handleExport = () => {
    const csv = buildRevenueReportCSV({
      period: activeTab,
      users: CURRENT[activeTab].users,
      revenue: CURRENT[activeTab].revenue,
      conv: CURRENT[activeTab].conv,
      sales: CURRENT[activeTab].sales,
      engagement: CURRENT[activeTab].engagement,
      bounce: CURRENT[activeTab].bounce,
      chartData,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rev9-report-${activeTab
      .replace(/\s+/g, "-")
      .toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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

  // avatar dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Link style (bold always; cyan in dark; underline on hover)
  const linkCls =
    "font-semibold outline-none focus-visible:ring-2 ring-indigo-400/40 hover:underline underline-offset-4 decoration-1 " +
    "text-gray-900 dark:text-cyan-300 dark:hover:text-cyan-200 transition";

  return (
    <>
      <PageTitle title="Dashboard" />

      {/* Header: Brand + (Left controls)  •  (Right) Home|Users + Theme + Avatar */}
      <div className="flex items-center justify-between mb-6 -mt-3">
        {/* LEFT: Brand + period/export */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <BrandMark />
            <h1 className="font-['General Sans'] text-[28px] sm:text-[30px] md:text-[32px] font-semibold tracking-tight text-gray-900 dark:text-white">
              Rev9
            </h1>
          </div>

          {/* move Today/ThisWeek/ThisMonth + Export here */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4 ml-2">
            <PeriodToggle value={activeTab} onChange={(p) => setActiveTab(p)} />
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/30"
              aria-label="Export revenue report as CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Home | Users | Theme | Avatar */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <nav className="flex items-center gap-2 sm:gap-3">
            <NavLink to="/" end className={() => linkCls}>
              Home
            </NavLink>
            <span
              className="text-gray-300 dark:text-gray-600 select-none"
              aria-hidden="true"
            >
              |
            </span>
            <NavLink to="/users" className={() => linkCls}>
              Users
            </NavLink>
          </nav>

          <span className="text-gray-300 dark:text-gray-600 select-none">
            |
          </span>
          <ThemeToggle />

          <span className="text-gray-300 dark:text-gray-600 select-none">
            |
          </span>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open user menu"
              className="rounded-full transition shadow-none focus-visible:outline-none hover:ring-2 hover:ring-cyan-400/50 dark:hover:ring-cyan-300/50 hover:ring-offset-2 hover:ring-offset-transparent"
            >
              <img
                src={adminAvatar}
                alt="Admin avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
            </button>

            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                role="menu"
                aria-orientation="vertical"
                className="absolute top-11 right-0 min-w-[164px] rounded-xl border border-elev bg-surface shadow-lg p-1.5 z-50"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                  }}
                  role="menuitem"
                  className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted focus:outline-none"
                >
                  <LogOut className="w-4 h-4 text-foreground/70" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <MetricsGrid
        users={count}
        revenue={revenue}
        conversion={conversion}
        sales={sales}
        engagement={engagement}
        bounceRate={bounceRate}
        usersDeltaText={usersDeltaText}
        revenueDeltaText={revenueDeltaText}
      />

      {/* Charts */}
      <RevenueTrend />
      <RevenueDistribution period={activeTab} />

      {/* Overview */}
      <AnalyticalOverview />

      {/* Footer */}
      <footer className="mt-8">
        <div className="pt-3 pb-3">
          <div className="w-full max-w-9xl mx-auto px-3 sm:px-3 flex flex-col sm:flex-row items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <p>© 2025 Rev9</p>
            <div className="flex items-center gap-4 sm:ml-auto">
              <a
                href="https://www.linkedin.com/in/archit-react/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 rounded"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/archit-react"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#7c3aed] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/30 rounded"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/30 rounded"
              >
                <LinkIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals + Toast */}
      <UserModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        user={editingUser}
      />
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Confirm Logout Modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
            onClick={() => setConfirmOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="relative z-50 w-[92%] max-w-sm rounded-2xl bg-white dark:bg-[#111213] border border-elev p-5 shadow-xl"
          >
            <h2 className="text-base font-semibold text-foreground mb-1">
              Sign out?
            </h2>
            <p className="text-sm text-foreground/70 mb-5">
              You’ll need to log in again to access the dashboard.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 h-10 rounded-full border border-elev text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                autoFocus
                className="px-4 h-10 rounded-full bg-red-600 text-white text-sm hover:bg-red-500 active:bg-red-700"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
