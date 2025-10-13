// src/components/ui/Card.tsx
import type { PropsWithChildren } from "react";
import { motion } from "framer-motion";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export default function Card({ children, className = "" }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.6 }}
      className={[
        // removed any glass or shadow, replaced with clean border style
        "rounded-2xl bg-surface border border-[rgba(2,6,23,0.06)]",
        "dark:border-[rgba(255,255,255,0.06)]",
        "shadow-none transform-gpu",
        className,
      ].join(" ")}
    >
      {children}
    </motion.div>
  );
}
