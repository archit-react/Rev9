// src/components/header/HeaderActions.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { LogOut } from "lucide-react";

type Props = {
  avatarSrc: string;
  onRequestLogout: () => void;
  onExport?: () => void; // new prop
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
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  const linkCls =
    "font-semibold outline-none focus-visible:ring-2 ring-indigo-400/40 " +
    "hover:underline underline-offset-4 decoration-1 " +
    "text-gray-900 dark:text-cyan-300 dark:hover:text-cyan-200 transition";

  return (
    <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
      <AnchorLink to="/" className={linkCls}>
        Home
      </AnchorLink>
      <Divider />
      <AnchorLink to="/users" className={linkCls}>
        Users
      </AnchorLink>

      {/* New Export link */}
      {onExport && (
        <>
          <Divider />
          <button type="button" onClick={onExport} className={linkCls}>
            Export
          </button>
        </>
      )}

      <Divider />
      <ThemeToggle />

      <Divider />
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
            className="w-9 h-9 rounded-full object-cover"
          />
        </button>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.12 }}
            className="absolute top-11 right-0 min-w-[164px] rounded-xl border border-elev bg-surface shadow-lg p-1.5 z-50"
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onRequestLogout();
              }}
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
  );
}
