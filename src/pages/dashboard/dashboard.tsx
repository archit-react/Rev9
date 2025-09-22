// src/pages/dashboard/dashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Linkedin, Github, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";

import PageTitle from "@/components/PageTitle";
import UserModal from "@/components/UserModal";
import Toast from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { logout as clearAuth } from "@/lib/api";
import adminAvatar from "@/assets/admin.png";
import HeaderActions from "@/components/header/HeaderActions"; // ✅ use reusable header

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
import { useAnimatedCounters } from "./useAnimatedCounters";

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

  // ✅ Export handler — now wired into HeaderActions
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

  return (
    <>
      <PageTitle title="Dashboard" />

      {/* Header: Brand (left) • Period + Actions (right) */}
      <div className="flex items-center justify-between mb-6 -mt-3">
        {/* LEFT: Brand + period */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <BrandMark />
            <h1 className="font-['General Sans'] text-[28px] sm:text-[30px] md:text-[32px] font-semibold tracking-tight text-gray-900 dark:text-white">
              Rev9
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-3 sm:gap-4 ml-2">
            <PeriodToggle value={activeTab} onChange={(p) => setActiveTab(p)} />
          </div>
        </div>

        {/* RIGHT: Home | Users | Export | Theme | Avatar */}
        <HeaderActions
          avatarSrc={adminAvatar}
          onRequestLogout={() => setConfirmOpen(true)}
          onExport={handleExport}
        />
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
