import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import PageTitle from "@/components/PageTitle";
import UserModal from "@/components/UserModal";
import Toast from "@/components/ui/Toast";
import FooterBar from "@/components/footer";
import ConfirmLogoutModal from "@/components/ConfirmLogoutModal";

import { api, logout as clearAuth } from "@/lib/api";
import adminAvatar from "@/assets/admin.png";

import MetricsGrid from "./MetricsGrid";
import RevenueTrend from "./RevenueTrend";
import RevenueDistribution from "./RevenueDistribution";
import AnalyticalOverview from "./AnalyticalOverview";
import DashboardHeader from "./DashboardHeader";

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
      const isEdit = Boolean(editingUser?._id);
      const url = isEdit
        ? api(`/api/users/${editingUser!._id}`)
        : api("/api/users");
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      setToast({
        show: true,
        message: res.ok
          ? isEdit
            ? "User updated successfully!"
            : "User added successfully!"
          : data.error,
        type: res.ok ? "success" : "error",
      });
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

  // Export → passed to HeaderActions
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

  // Logout confirm modal
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

      <DashboardHeader
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onExport={handleExport}
        onRequestLogout={() => setConfirmOpen(true)}
        avatarSrc={adminAvatar}
      />

      {/* Tight main area: less bottom padding to pull content closer to the footer */}
      <main className="px-6 pb-2">
        <div className="space-y-6">
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

          <RevenueTrend />
          <RevenueDistribution period={activeTab} />

          {/* Last block: explicitly no bottom margin so footer hugs closely */}
          <div className="mb-0">
            <AnalyticalOverview />
          </div>
        </div>
      </main>

      {/* Footer unchanged */}
      <FooterBar />

      {/* Modals */}
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

      <ConfirmLogoutModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
