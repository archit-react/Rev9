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
        "rounded-2xl border border-foreground/5",
        "bg-background/70 backdrop-blur-[6px]",
        "shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.15)]",
        "dark:shadow-[0_1px_0_0_rgba(255,255,255,0.03),0_8px_24px_-12px_rgba(0,0,0,0.6)]",
        className,
      ].join(" ")}
    >
      {children}
    </motion.div>
  );
}
