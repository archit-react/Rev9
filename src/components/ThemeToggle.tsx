import { motion } from "framer-motion";
import { useTheme } from "@/theme/useTheme";

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


export default function ThemeToggle({
  className = "",
  ariaLabelLight = "Switch to dark mode",
  ariaLabelDark = "Switch to light mode",
}: {
  className?: string;
  ariaLabelLight?: string;
  ariaLabelDark?: string;
}) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? ariaLabelDark : ariaLabelLight}
      className={[
        "relative p-2 rounded-full",
        "text-black dark:text-white",
        "hover:text-amber-500 dark:hover:text-amber-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40",
        "transition-colors duration-200",
        className,
      ].join(" ")}
    >
      <div className="relative" style={{ perspective: 700 }}>
        <motion.div
          initial={false}
          animate={{ rotateX: isDark ? 180 : 0 }}
          transition={{
            type: "spring",
            stiffness: 700,
            damping: 35,
            mass: 0.6,
          }}
          className="transform-gpu relative w-6 h-6"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Moon face */}
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <SolidMoon className="w-6 h-6 translate-y-[-2px]" />
          </span>
          {/* Sun face */}
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
  );
}
