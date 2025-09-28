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
      className={["glass-card rounded-2xl", "!transform-gpu", className].join(
        " "
      )}
    >
      {children}
    </motion.div>
  );
}
