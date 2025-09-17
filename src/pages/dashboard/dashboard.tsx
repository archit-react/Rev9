import { useState } from "react";
import { Linkedin, Github, Link as LinkIcon, Download } from "lucide-react";

import PageTitle from "@/components/PageTitle";
import ThemeToggle from "@/components/ThemeToggle";
import UserModal from "@/components/UserModal"; // no named type import
import Toast from "@/components/ui/Toast";
import { api } from "@/lib/api";

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

// ---- Infer the User type from UserModal's props (avoids duplicate type defs) ----
type UserModalProps = React.ComponentProps<typeof UserModal>;
type User = UserModalProps["user"];

// ✅ Clean percent-delta formatter (fixes raw decimals)
const formatDelta = (curr: number, base: number) => {
  if (base === 0) return "—";
  const pct = ((curr - base) / base) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
};

// ✅ Brand mark component (fixes invisible icon)
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

/* -------------------------------------------------------------------------------------------------
 * Dashboard Page
 * ------------------------------------------------------------------------------------------------ */

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Period>("This Month");

  // Modal + toast state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  // Animated counters for metrics
  const { count, revenue, conversion, sales, engagement, bounceRate } =
    useAnimatedCounters(activeTab);

  // ✅ Delta labels (now properly formatted)
  const usersDeltaText = `${formatDelta(
    CURRENT[activeTab].users,
    BASELINE[activeTab].users
  )} ${COMPARE_LABEL[activeTab]}`;

  const revenueDeltaText = `${formatDelta(
    CURRENT[activeTab].revenue,
    BASELINE[activeTab].revenue
  )} ${COMPARE_LABEL[activeTab]}`;

  // Save user (add / update)
  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      const token = localStorage.getItem("token");

      if (editingUser?._id) {
        // Update user
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
        // Create user
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
    }
    setShowModal(false);
    setEditingUser(null);
  };

  // CSV export handler
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

  return (
    <>
      <PageTitle title="Dashboard" />

      {/* Header row */}
      <div className="flex justify-between items-center mb-6 -mt-3">
        <div className="flex items-center gap-3">
          <BrandMark /> {/* ✅ Now visible */}
          <h1 className="font-['General Sans'] text-[28px] sm:text-[30px] md:text-[32px] font-semibold tracking-tight text-gray-900 dark:text-white">
            Rev9
          </h1>
        </div>

        <div className="flex items-center gap-2">
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
          <ThemeToggle />
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
    </>
  );
}
