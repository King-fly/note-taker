import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { Mic, Camera, FileText, LayoutList, BrainCircuit, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "@/auth-context";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Review from "./pages/Review";
import Profile from "./pages/Profile";

function BottomNav() {
  const { t, ready } = useTranslation();
  const location = useLocation();

  // 确保只有在i18n准备就绪后才使用翻译
  const navItems = [
    { path: "/", icon: Mic, label: ready ? t("home.title") : "Class Notes" },
    { path: "/notes", icon: LayoutList, label: ready ? t("notes.title") : "Notes" },
    { path: "/review", icon: BrainCircuit, label: ready ? t("review.title") : "Review" },
    { path: "/profile", icon: User, label: ready ? t("profile.title") : "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-background border-t pb-safe flex justify-between p-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors ${
              isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <item.icon className={`h-5 w-5 mb-1 ${isActive ? "fill-primary/20" : ""}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

import { Toaster } from "sonner";

// ── Auth Guard ─────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

// ── Main App ───────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="max-w-md mx-auto h-[100dvh] bg-background sm:border-x relative overflow-hidden flex flex-col shadow-xl">
          <Routes>
            {/* Public: Auth */}
            <Route path="/auth" element={<Auth />} />

            {/* Protected: Main app */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <ProtectedRoute>
                  <Notes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <Review />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster position="top-center" />

          {/* Show bottom nav only on protected routes */}
          <ProtectedRoute>
            <BottomNav />
          </ProtectedRoute>
        </div>
      </Router>
    </AuthProvider>
  );
}