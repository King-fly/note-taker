import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Mic, Camera, FileText, LayoutList, BrainCircuit, User } from "lucide-react";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Review from "./pages/Review";
import Profile from "./pages/Profile";

function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Mic, label: "速记" },
    { path: "/notes", icon: LayoutList, label: "整理" },
    { path: "/review", icon: BrainCircuit, label: "复盘" },
    { path: "/profile", icon: User, label: "我的" },
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

import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <Router>
      <div className="max-w-md mx-auto h-[100dvh] bg-background sm:border-x relative overflow-hidden flex flex-col shadow-xl">
        <div className="flex-1 overflow-y-auto pb-[72px] scroll-smooth">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/review" element={<Review />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <Toaster position="top-center" />
        <BottomNav />
      </div>
    </Router>
  );
}
