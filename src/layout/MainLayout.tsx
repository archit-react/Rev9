import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, Users, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
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
          {/* rail removed */}
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

  const handleLogout = () => {
    try {
      clearAuth(); // removes token + user
    } finally {
      navigate("/login", { replace: true });
    }
  };

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

          {/* Theme toggle — 3D flip (no border) */}
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

            {/* Logout */}
            <motion.button
              type="button"
              onClick={handleLogout}
              className="relative group w-full pl-4 pr-2 flex items-center justify-center py-2.5 rounded-lg
             text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400
             transform-gpu will-change-transform
             transition-transform duration-150 ease-out
             active:scale-95 active:translate-y-[1px]
             outline-none"
              title="Logout"
              aria-label="Logout"
              data-testid="nav-logout"
            >
              <LogOut className="w-6 h-6" />
              <span className="sr-only">Logout</span>
            </motion.button>
          </nav>

          {/* Avatar */}
          <div className="mt-auto w-12 flex items-center justify-center">
            <img
              src={adminAvatar}
              alt="Admin avatar"
              className="w-9 h-9 rounded-full object-cover"
            />
          </div>
        </aside>

        {/* === Right column (scrolls only this area) === */}
        <div className="flex-1 flex flex-col md:ml-16">
          {/* Make only the main column scroll; parent bg is black so overscroll shows black */}
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
    </div>
  );
}
