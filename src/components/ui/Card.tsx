// src/components/ui/Card.tsx
import type { PropsWithChildren } from "react";
import { motion } from "framer-motion";

type CardProps = PropsWithChildren<{ className?: string }>;

export default function Card({ children, className = "" }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.6 }}
      className={[
        // FLAT: no border, no shadow (both light & dark)
        "rounded-2xl bg-surface border-0 shadow-none ring-0 outline-none transform-gpu",
        className,
      ].join(" ")}
      style={{
        boxShadow: "none",
        border: "0", // ensures no hairline in dark
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
    >
      {children}
    </motion.div>
  );
}
