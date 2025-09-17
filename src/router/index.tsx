import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "@/layout/MainLayout";
import Dashboard from "@/pages/dashboard/dashboard";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Signup from "@/pages/signup";
import ProtectedRoute from "@/components/ProtectedRoute";

export const router = createBrowserRouter([
  // Public routes
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },

  // Protected routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
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
