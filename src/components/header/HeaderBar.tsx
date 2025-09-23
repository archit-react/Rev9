// src/components/header/HeaderBar.tsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { LogOut } from "lucide-react";
import Rev9Logo from "@/components/header/Rev9Logo"; // ⬅️ Animated logo

type Props = {
  onExport?: () => void; // Provide on Dashboard; optional elsewhere
  avatarSrc: string;
  onRequestLogout: () => void; // parent opens the confirm modal
};

/* ---------------- Utilities ---------------- */
function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
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

function Divider() {
  return (
    <span
      className="text-gray-300 dark:text-gray-600 select-none"
      aria-hidden="true"
    >
      |
    </span>
  );
}

/* ---------------- Component ---------------- */
export default function HeaderBar({
  onExport,
  avatarSrc,
  onRequestLogout,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  // JSR-like link styling (light/dark) + active weight
  const linkBase =
    "outline-none focus-visible:ring-2 ring-indigo-400/40 hover:underline underline-offset-4 decoration-1 " +
    "text-gray-900 dark:text-cyan-300 dark:hover:text-cyan-200 transition";

  // We want bold on the active page
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${isActive ? "font-semibold" : ""}`;

  // Force re-render on route change (no unused var)
  useLocation();

  return (
    <div className="w-full flex items-center justify-between gap-3 sm:gap-4 pointer-events-auto">
      {/* ---------- Left cluster: Rev9 logo + nav ---------- */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Rev9Logo className="h-8 sm:h-10 -mt-px" />
        <nav className="flex items-center gap-2 sm:gap-3">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <Divider />
          <NavLink to="/users" className={linkClass}>
            Users
          </NavLink>
          <Divider />
          <button
            type="button"
            onClick={onExport}
            className={`${linkBase} font-semibold disabled:opacity-50`}
            disabled={!onExport}
            aria-disabled={!onExport}
          >
            Export
          </button>
        </nav>
      </div>

      {/* ---------- Right cluster: theme toggle + avatar ---------- */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Divider />
        <ThemeToggle />
        <Divider />
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open user menu"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40
                       hover:ring-2 hover:ring-cyan-400/60 ring-offset-2 ring-offset-transparent transition"
          >
            <img
              src={avatarSrc}
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
              className="absolute top-11 right-0 min-w-[164px]
                         rounded-xl border border-elev bg-surface shadow-lg p-1.5 z-50"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onRequestLogout();
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
      </div>
    </div>
  );
}
