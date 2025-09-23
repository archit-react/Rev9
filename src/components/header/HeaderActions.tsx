import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { LogOut } from "lucide-react";

type Props = {
  avatarSrc: string;
  onRequestLogout: () => void;
  onExport?: () => void;
  /** Rename “Home” text (e.g., to “Dashboard” on Users page) */
  homeLabel?: string;
  /** Hide the Users link */
  hideUsers?: boolean;
  /** Hide the Home link (use on the dashboard) */
  hideHome?: boolean;
  className?: string;
};

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void
) {
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      handler();
    };
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

function AnchorLink({
  to,
  children,
  className,
}: {
  to: string;
  children: React.ReactNode;
  className: string;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      aria-current={isActive ? "page" : undefined}
      className={`${className} ${isActive ? "font-semibold" : ""}`}
    >
      {children}
    </a>
  );
}

export default function HeaderActions({
  avatarSrc,
  onRequestLogout,
  onExport,
  homeLabel = "Home",
  hideUsers = false,
  hideHome = false,
  className = "",
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  const linkCls =
    "text-lg font-semibold outline-none focus-visible:ring-2 ring-indigo-400/40 " +
    "hover:underline underline-offset-4 decoration-1 " +
    "text-gray-900 dark:text-cyan-400 dark:hover:text-cyan-300 transition";

  return (
    <div
      className={`flex items-center gap-2 sm:gap-4 pointer-events-auto ${className}`}
    >
      {/* Home (conditionally rendered) */}
      {!hideHome && (
        <>
          <AnchorLink to="/" className={linkCls}>
            {homeLabel}
          </AnchorLink>
          {(!hideUsers || onExport) && <Divider />}
        </>
      )}

      {/* Users (conditionally rendered) */}
      {!hideUsers && (
        <>
          <AnchorLink to="/users" className={linkCls}>
            Users
          </AnchorLink>
          {onExport && <Divider />}
        </>
      )}

      {/* Export (optional) */}
      {typeof onExport === "function" && (
        <>
          <button type="button" onClick={onExport} className={linkCls}>
            Export
          </button>
          <Divider />
        </>
      )}

      <ThemeToggle />
      <Divider />

      {/* Avatar / menu */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-full transition focus-visible:outline-none
                     hover:ring-2 hover:ring-cyan-400/50 dark:hover:ring-cyan-300/50
                     hover:ring-offset-2 hover:ring-offset-transparent"
        >
          <img
            src={avatarSrc}
            alt="Admin avatar"
            className="
    w-9 h-9 rounded-full object-cover
    transition
    hover:ring-2 hover:ring-cyan-400 mt-2
    hover:ring-offset-2 hover:ring-offset-surface
  "
          />
        </button>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16 }}
            className="
              absolute top-11 right-0 min-w-[164px] z-50
              rounded-2xl p-2
              bg-white/5 dark:bg-white/2
              backdrop-blur-xl backdrop-saturate-200
              border border-white/20 dark:border-white/10
              shadow-[0_4px_24px_rgba(0,0,0,0.2)]
            "
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onRequestLogout();
              }}
              className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                         text-foreground/90 hover:bg-white/20 dark:hover:bg-white/10
                         focus:outline-none transition"
            >
              <LogOut className="w-4 h-4 text-foreground/70" />
              Logout
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
