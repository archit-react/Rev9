// src/layout/MainLayout.tsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, Users, LogOut } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import adminAvatar from "../assets/admin.png";
import { logout as clearAuth } from "@/lib/api";

/** Clean solid crescent moon (no halo) */
function SolidMoon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
    </svg>
  );
}

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  testId?: string;
};

const NAV_LINKS: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: <Home className="w-6 h-6" />,
    testId: "nav-dashboard",
  },
  {
    to: "/users",
    label: "Users",
    icon: <Users className="w-6 h-6" />,
    testId: "nav-users",
  },
];

function SidebarItem({
  to,
  label,
  icon,
  testId,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  testId?: string;
}) {
  return (
    <NavLink to={to} end={to === "/"} data-testid={testId}>
      {({ isActive }) => (
        <motion.div
          className="relative group w-full pl-3 pr-2 flex items-center justify-center py-2.5 rounded-lg
             text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
             transform-gpu will-change-transform
             transition-transform duration-150 ease-out
             active:scale-95 active:translate-y-[1px]
             outline-none"
          title={label}
          aria-label={label}
        >
          <motion.span
            animate={{ scale: isActive ? 1.05 : 1 }}
            whileHover={{ scale: isActive ? 1.05 : 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={isActive ? "text-[#6366F1] dark:text-[#A5B4FC]" : ""}
          >
            {icon}
          </motion.span>
          <span className="sr-only">{label}</span>
        </motion.div>
      )}
    </NavLink>
  );
}

/* ---------------- Avatar menu + confirm modal (local-only) --------------- */

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>, // ✅ accept T | null to match useRef<T>(null)
  handler: () => void
) {
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      handler();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ref, handler]);
}

export default function MainLayout() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // avatar dropdown + confirm modal state
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  const handleLogout = useCallback(() => {
    try {
      clearAuth(); // removes token + user
    } finally {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // keyboard support for modal
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
      if (e.key === "Enter") handleLogout();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmOpen, handleLogout]); // ✅ include handleLogout

  return (
    // Root reveals black on overscroll
    <div className="min-h-screen bg-black">
      <div className="relative flex min-h-screen">
        {/* === Left rail (fixed) === */}
        <aside
          className="hidden md:flex fixed inset-y-0 left-0 w-16 h-screen z-10
                     flex-col items-center gap-y-4 px-4 py-4 bg-sidebar border-elev shadow-fresh
                     dark:border-transparent dark:shadow-none transition-shadow"
          aria-label="Primary"
        >
          {/* Logo */}
          <div className="w-12 flex items-center justify-center">
            <div className="relative w-9 h-9 text-[#7c3aed] -translate-y-[1px]">
              <svg
                className="absolute inset-0"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden
              >
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white text-[21px] font-extrabold leading-none select-none -translate-y-[0.5px]">
                $
              </span>
            </div>
          </div>

          {/* Theme toggle — stays here */}
          <div className="w-12 flex items-center justify-center">
            <button
              onClick={() => setDarkMode((p) => !p)}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              className="
                relative p-2 rounded-full
                text-black dark:text-white
                hover:text-amber-500 dark:hover:text-amber-300
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40
                transition-colors duration-200
              "
            >
              <div className="relative" style={{ perspective: 700 }}>
                <motion.div
                  initial={false}
                  animate={{ rotateX: darkMode ? 180 : 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 35,
                    mass: 0.6,
                  }}
                  className="transform-gpu relative w-6 h-6"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <SolidMoon className="w-6 h-6 translate-y-[-2px]" />
                  </span>
                  <span
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: "rotateX(180deg)",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <span className="material-icons text-[22px] leading-none select-none">
                      light_mode
                    </span>
                  </span>
                </motion.div>
              </div>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-y-1.5 -mt-2 -ml-1.5">
            {NAV_LINKS.map(({ to, label, icon, testId }) => (
              <SidebarItem
                key={to}
                to={to}
                label={label}
                icon={icon}
                testId={testId}
              />
            ))}
            {/* (Removed old Logout button from here) */}
          </nav>

          {/* Avatar + dropdown */}
          <div className="mt-auto w-12 flex items-center justify-center relative">
            {/* Avatar button */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open user menu"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40"
            >
              <img
                src={adminAvatar}
                alt="Admin avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                role="menu"
                aria-orientation="vertical"
                className="absolute bottom-12 left-1/2 -translate-x-1/2 min-w-[164px]
                           rounded-xl border border-elev bg-surface shadow-lg p-1.5 z-20"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                  }}
                  role="menuitem"
                  className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                             text-foreground hover:bg-muted focus:outline-none"
                >
                  <LogOut className="w-4 h-4 text-foreground/70" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </aside>

        {/* === Right column (scrolls only this area) === */}
        <div className="flex-1 flex flex-col md:ml-16">
          <main className="flex-1 h-dvh overflow-hidden bg-app">
            <motion.div
              className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-3 sm:pt-8 pb-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              data-testid="main-content"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>

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
    </div>
  );
}
