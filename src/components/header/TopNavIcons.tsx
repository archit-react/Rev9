import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import * as React from "react";

type NavItemLike = {
  to: string;
  label: string;
  icon: React.ReactNode;
  testId?: string;
};

export default function TopNavIcons({ items }: { items: NavItemLike[] }) {
  return (
    <nav className="flex items-center gap-1.5">
      {items.map(({ to, label, icon, testId }) => (
        <NavLink key={to} to={to} end={to === "/"} data-testid={testId}>
          {({ isActive }) => (
            <motion.div
              className="relative group px-2 py-2.5 rounded-lg
                         text-gray-500 dark:text-gray-400
                         hover:text-gray-900 dark:hover:text-white
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
      ))}
    </nav>
  );
}
