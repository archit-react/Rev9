// src/layout/AppLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function AppLayout() {
  const location = useLocation();

  return (
    // Dynamic viewport height; allow scrolling
    <div className="min-h-[100dvh] bg-black">
      <main className="min-h-[100dvh] bg-app overflow-y-auto">
        <motion.div
          key={location.pathname} // <-- force re-render on route change
          className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-3 sm:pt-8 pb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          data-testid="main-content"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
