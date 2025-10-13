import { createBrowserRouter, Navigate } from "react-router-dom";

import Dashboard from "@/pages/dashboard/dashboard";
import Users from "@/pages/Users";
import Settings from "@/pages/settings";
import Login from "@/pages/Login";
import Signup from "@/pages/signup";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/layout/AppLayout"; // 

export const router = createBrowserRouter([
  // Public routes
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },

  // Protected routes (wrap with ProtectedRoute + AppLayout)
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> }, // "/" -> Dashboard
      { path: "users", element: <Users /> },
      { path: "settings", element: <Settings /> },
    ],
  },

  // Catch-all fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);
