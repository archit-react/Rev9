import { useEffect, useState } from "react";
import { Sun, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";

/** Solid crescent (same as MainLayout, no halo) */
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

export default function SettingsPage() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon
          aria-hidden
          className="h-6 w-6 text-gray-600 dark:text-gray-300"
        />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          App Settings
        </h1>
      </div>

      {/* Theme Toggle (smaller pill card) */}
      <div
        className="
          group relative rounded-xl p-4
          bg-surface border border-elev shadow-fresh hover:shadow-fresh-hover
          transition-shadow duration-300
          w-full sm:max-w-xs
        "
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-medium text-foreground">
              Theme Toggle
            </h2>
            <p className="text-sm text-foreground/60">Light/Dark Mode</p>
          </div>

          {/* Button — matches rail exactly (white sun in dark) */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-pressed={theme === "dark"}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="
              relative p-2 rounded-full
              text-slate-700 dark:text-white
              hover:text-slate-900 dark:hover:text-white/90
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
              transition-colors duration-200
            "
          >
            <motion.span
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex"
            >
              {theme === "dark" ? (
                <Sun
                  className="h-6 w-6 transition-colors duration-200"
                  strokeWidth={2}
                />
              ) : (
                <SolidMoon className="h-6 w-6 transition-colors duration-200" />
              )}
            </motion.span>
          </button>
        </div>
      </div>
    </div>
  );
}
