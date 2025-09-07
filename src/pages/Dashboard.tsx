import { useEffect, useState } from "react";
import {
  Linkedin,
  Github,
  Link as LinkIcon,
  TrendingUp,
  UserPlus,
  LineChart,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import UserModal from "@/components/UserModal";
import Toast from "@/components/ui/Toast";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";

/* --------------------------- Period Toggle --------------------------- */

const PERIODS = ["Today", "This Week", "This Month"] as const;
type Period = (typeof PERIODS)[number];

function PeriodToggle({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <motion.div
      role="tablist"
      aria-label="Select period"
      className="
    inline-flex items-center gap-1 rounded-full p-1
    bg-surface border border-elev card-inset
  "
      style={{ transformOrigin: "center" }}
      onPointerDownCapture={() => setPressed(true)}
      onPointerUpCapture={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      animate={{ scale: pressed ? 0.97 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.6 }}
    >
      {PERIODS.map((label) => {
        const active = value === label;
        return (
          <button
            key={label}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(label)}
            className={[
              "px-3.5 py-1.5 rounded-full text-sm font-medium",

              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "ring-[var(--primary-color,#3B82F6)] dark:focus-visible:ring-offset-[#0b1220]",
              active
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </motion.div>
  );
}

/* ------------------------------- Types -------------------------------- */

interface User {
  _id?: string;
  username: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
}

/* -------------------------- Period-aware data -------------------------- */
/** Current values for each period */
const CURRENT = {
  Today: {
    users: 122,
    revenue: 8318,
    conv: 48.1,
    sales: 1800,
    engagement: 63.2,
    bounce: 30.1,
  },
  "This Week": {
    users: 544,
    revenue: 19741,
    conv: 51.3,
    sales: 9564,
    engagement: 71.4,
    bounce: 28.3,
  },
  "This Month": {
    users: 1369,
    revenue: 72340,
    conv: 52.4,
    sales: 52800,
    engagement: 78.6,
    bounce: 26.4,
  },
} as const;

/** Baselines used for percent comparison */
const BASELINE = {
  Today: {
    users: 116, // yesterday
    revenue: 7233, // yesterday
  },
  "This Week": {
    users: 518, // last week
    revenue: 17166, // last week
  },
  "This Month": {
    users: 1304, // last month
    revenue: 62991, // last month
  },
} as const;

/** UI text for each comparison */
const COMPARE_LABEL: Record<Period, string> = {
  Today: "vs yesterday",
  "This Week": "vs last week",
  "This Month": "vs last month",
};

/* ------------------------------ Component ----------------------------- */

export default function Dashboard() {
  const [count, setCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [conversion, setConversion] = useState(0);
  const [sales, setSales] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [bounceRate, setBounceRate] = useState(0);
  const [activeTab, setActiveTab] = useState<Period>("This Month");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  /* -------------------------- Helpers for labels ------------------------- */
  const pct = (curr: number, base: number) =>
    base === 0 ? 0 : ((curr - base) / base) * 100;

  const usersDelta = pct(CURRENT[activeTab].users, BASELINE[activeTab].users);
  const revenueDelta = pct(
    CURRENT[activeTab].revenue,
    BASELINE[activeTab].revenue
  );

  const usersDeltaText = `${usersDelta >= 0 ? "+" : ""}${usersDelta.toFixed(
    1
  )}% ${COMPARE_LABEL[activeTab]}`;
  const revenueDeltaText = `${
    revenueDelta >= 0 ? "+" : ""
  }${revenueDelta.toFixed(1)}% ${COMPARE_LABEL[activeTab]}`;

  /* --------------------------- Animated counters -------------------------- */
  useEffect(() => {
    let frame: number;
    let start = 0,
      startRev = 0,
      startConv = 0,
      startSales = 0,
      startEngage = 0,
      startBounce = 0;

    const selected = CURRENT[activeTab];

    const step = () => {
      start += Math.ceil((selected.users - start) / 10);
      startRev += Math.ceil((selected.revenue - startRev) / 10);
      startConv += Math.ceil((selected.conv * 10 - startConv) / 10);
      startSales += Math.ceil((selected.sales - startSales) / 10);
      startEngage += Math.ceil((selected.engagement * 10 - startEngage) / 10);
      startBounce += Math.ceil((selected.bounce * 10 - startBounce) / 10);

      setCount(start);
      setRevenue(startRev);
      setConversion(startConv / 10);
      setSales(startSales);
      setEngagement(startEngage / 10);
      setBounceRate(startBounce / 10);

      if (
        start < selected.users ||
        startRev < selected.revenue ||
        startConv < selected.conv * 10 ||
        startSales < selected.sales ||
        startEngage < selected.engagement * 10 ||
        startBounce < selected.bounce * 10
      ) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [activeTab]);

  /* --------------------------- Chart + Tooltip --------------------------- */
  type CustomTooltipProps = {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  };

  const ChartTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (!active || !payload || !payload.length) return null;
    const value = payload[0]?.value ?? 0;

    return (
      <div className="rounded-lg border border-elev bg-surface px-3 py-2 text-sm shadow-fresh">
        <p className="font-medium text-gray-700 dark:text-gray-100">{label}</p>
        <p className="mt-0.5 font-semibold text-[var(--stroke)]">
          Revenue: {value.toLocaleString()}
        </p>
      </div>
    );
  };

  /* -------- Last six full months (Mar–Aug), since current month is Sep ----- */
  const chartData = [
    { month: "Mar", revenue: 18200 },
    { month: "Apr", revenue: 22100 },
    { month: "May", revenue: 25350 },
    { month: "Jun", revenue: 27400 },
    { month: "Jul", revenue: 26200 },
    { month: "Aug", revenue: 31000 },
  ];

  // Fixed summary for the Revenue Trend card (independent of period toggle)
  const totalRevenue6m = chartData.reduce((s, m) => s + m.revenue, 0); // 6-month total (Mar–Aug)
  // Baseline = previous 6 months (Sep–Feb). Replace with real values when available.
  const baseline6m: number = 130880;
  const revenueDelta6m =
    baseline6m === 0 ? 0 : ((totalRevenue6m - baseline6m) / baseline6m) * 100;

  const CustomXAxisTick: React.FC<{
    x?: number;
    y?: number;
    payload?: { value: string };
  }> = ({ x = 0, y = 0, payload }) => {
    if (!payload) return null;
    let tx = x;
    if (payload.value === chartData[0].month) tx = x + 12;
    else if (payload.value === chartData[chartData.length - 1].month)
      tx = x - 6;

    return (
      <text
        x={tx}
        y={y + 16}
        fill="currentColor"
        className="text-gray-500 dark:text-gray-400"
        textAnchor="middle"
      >
        {payload.value}
      </text>
    );
  };

  /* ------------------------------ Save user ------------------------------ */
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
        if (res.ok) {
          setToast({
            show: true,
            message: "User updated successfully!",
            type: "success",
          });
        } else {
          setToast({
            show: true,
            message: data.error || "Failed to update user",
            type: "error",
          });
        }
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
        if (res.ok) {
          setToast({
            show: true,
            message: "User added successfully!",
            type: "success",
          });
        } else {
          setToast({
            show: true,
            message: data.error || "Failed to add user",
            type: "error",
          });
        }
      }
    } catch (err) {
      console.error("Save user error:", err);
    }
    setShowModal(false);
    setEditingUser(null);
  };

  /* -------------------------------- Render ------------------------------- */

  return (
    <>
      {/* Title + period selector */}
      <div className="flex justify-between items-center mb-6 -mt-5">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <PeriodToggle value={activeTab} onChange={(p) => setActiveTab(p)} />
      </div>

      {/* Metrics (global tokens) */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          {
            label: "Users",
            value: count.toLocaleString(),
            extra: usersDeltaText, // dynamic per period
          },
          {
            label: "Revenue",
            value: `$${revenue.toLocaleString()}`,
            extra: revenueDeltaText, // dynamic per period
          },
          { label: "Conversion", value: `${conversion.toFixed(1)}%` },
          { label: "Sales", value: sales.toLocaleString() },
          { label: "Engagement", value: `${engagement.toFixed(1)}%` },
          { label: "Bounce Rate", value: `${bounceRate.toFixed(1)}%` },
        ].map((card, i) => (
          <div
            key={i}
            className="
  relative rounded-2xl p-5
  bg-surface border border-elev card-inset
"
          >
            <p className="text-sm font-medium text-foreground/70 mb-1">
              {card.label}
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {card.value}
            </p>
            {card.extra && (
              <p
                className={`text-xs mt-1 ${
                  (card.label === "Users" || card.label === "Revenue") &&
                  (card.extra.startsWith("+")
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400")
                }`}
              >
                {card.extra}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div
        className="
  relative mt-8 rounded-2xl
  bg-surface border border-elev card-inset
  overflow-hidden
"
      >
        <div className="px-6 pt-5 pb-2">
          <p className="text-base font-medium text-foreground/70">
            Revenue Trend
          </p>
          {/* Always show last 6 months total */}
          <p className="text-3xl font-bold text-foreground">
            ${totalRevenue6m.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-foreground/60">Last 6 Months</p>
            <p
              className={`text-sm font-medium ${
                revenueDelta6m >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {revenueDelta6m >= 0 ? "+" : ""}
              {revenueDelta6m.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Chart area */}
        <div
          className="
    no-chart-focus relative h-80 w-full
    px-4 sm:px-5 pb-6
[--stroke:#0ea5e9] [--fill1:rgba(14,165,233,0.30)] [--fill2:rgba(14,165,233,0)]
dark:[--stroke:#38bdf8] dark:[--fill1:rgba(56,189,248,0.18)] dark:[--fill2:rgba(56,189,248,0)]








  "
          tabIndex={-1}
          onMouseDownCapture={(e) => e.preventDefault()} // kills click-to-focus
          onFocusCapture={(e) => {
            // kills keyboard focus
            const el = e.target as HTMLElement;
            if (el && el.blur) el.blur();
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.24] dark:opacity-[0.18]
             bg-[radial-gradient(1200px_300px_at_50%_0%,rgba(14,165,233,0.10),transparent_60%)]"
          />

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <filter
                  id="shadow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feDropShadow
                    dx="0"
                    dy="6"
                    stdDeviation="6"
                    floodOpacity="0.25"
                  />
                </filter>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--fill1)" />
                  <stop offset="100%" stopColor="var(--fill2)" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={(props) => <CustomXAxisTick {...props} />}
                tickMargin={3}
                stroke="currentColor"
                className="text-gray-500 dark:text-gray-400"
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                padding={{ left: 14, right: 14 }}
              />
              <YAxis
                tickMargin={15}
                width={70}
                stroke="currentColor"
                className="text-gray-500 dark:text-gray-400"
                axisLine={false}
                tickLine={false}
                padding={{ top: 10, bottom: 10 }}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "rgba(0,0,0,0.2)", strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--stroke)"
                strokeWidth={6}
                strokeLinecap="round"
                fill="url(#areaFill)"
                filter="url(#shadow)"
                dot={{ r: 3, fill: "var(--stroke)", strokeWidth: 0 }}
                activeDot={{
                  r: 5,
                  fill: "var(--stroke)",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytical Overview (static, no motion) */}
      <Card
        className="mt-8 p-6 rounded-2xl bg-surface border border-elev
    !transform-none !transition-none"
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Analytical Overview
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-4">
          {[
            {
              title: "Total Profit",
              value: "$12,545",
              icon: <TrendingUp className="w-4 h-4" />,
              note: "+20% from last month",
              noteClass: "text-emerald-600 dark:text-emerald-400",
            },
            {
              title: "New Customers",
              value: "78",
              icon: <UserPlus className="w-4 h-4" />,
              note: "+5% this week",
              noteClass: "text-blue-600 dark:text-blue-400",
            },
            {
              title: "Avg. Order Value",
              value: "$127.73",
              icon: <LineChart className="w-4 h-4" />,
              note: "Up 6% from last month",
              noteClass: "text-emerald-600 dark:text-emerald-400",
            },
            {
              title: "Conversion Rate",
              value: "4.5%",
              icon: <Activity className="w-4 h-4" />,
              note: "Maintained",
              noteClass: "text-yellow-600 dark:text-yellow-400",
            },
          ].map((s, i) => (
            <div key={i} className="relative px-4 py-3 flex flex-col">
              {/* separator, except for first card */}
              {i > 0 && (
                <span className="absolute -left-12 top-5 bottom-5 w-px bg-gray-300 dark:bg-gray-600 rounded" />
              )}

              <div className="flex items-center gap-2 text-foreground/70">
                <div className="w-7 h-7 rounded-full bg-foreground/5 flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="text-sm font-medium">{s.title}</span>
              </div>

              <div className="mt-2 text-2xl font-semibold text-foreground">
                {s.value}
              </div>

              <div className={`mt-1 text-xs font-medium ${s.noteClass}`}>
                {s.note}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <footer className="mt-8">
        <div className="pt-3 pb-3">
          <div
            className="
        w-full max-w-9xl mx-auto
        px-3 sm:px-3
        flex flex-col sm:flex-row
        items-center gap-2
        text-xs sm:text-sm text-gray-500 dark:text-gray-400
      "
          >
            <p>© 2025 Revenue Dashboard</p>
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
