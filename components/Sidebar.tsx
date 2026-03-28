"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, BookOpen, ClipboardList, Trophy,
  BarChart3, Users, Settings, Flame, Star, Orbit, Plus
} from "lucide-react";
import Link from "next/link";
import { AI_STUDENT_TIPS, AI_TEACHER_TIPS } from "@/lib/demo-data";
import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { label: "My Courses", href: "/courses", icon: BookOpen },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "Achievements", href: "/achievements", icon: Trophy },
  { label: "Leaderboard", href: "/leaderboard", icon: Star },
];

const TEACHER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/teacher", icon: BarChart3 },
  { label: "Add Course", href: "/dashboard/teacher/courses/new", icon: Plus },
  { label: "My Courses", href: "/dashboard/teacher?tab=courses", icon: BookOpen },
  { label: "Students", href: "/dashboard/teacher?tab=students", icon: Users },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin?tab=overview", icon: BarChart3 },
  { label: "Users", href: "/dashboard/admin?tab=users", icon: Users },
  { label: "Courses", href: "/dashboard/admin?tab=courses", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const { user } = useAuth();
  const [currentTip, setCurrentTip] = useState("");

  // Randomize tip on navigation
  useEffect(() => {
    if (user?.role === "STUDENT" || user?.role === "TEACHER") {
      const tips = user.role === "STUDENT" ? AI_STUDENT_TIPS : AI_TEACHER_TIPS;
      const randomIndex = Math.floor(Math.random() * tips.length);
      setCurrentTip(tips[randomIndex]);
    }
  }, [pathname, currentTab, user?.role]);

  // Automated toasts for students & teachers
  useEffect(() => {
    if (user?.role !== "STUDENT" && user?.role !== "TEACHER") return;

    // Toast shortly after mount if on a major page
    const timeout = setTimeout(() => {
      const tips = user.role === "STUDENT" ? AI_STUDENT_TIPS : AI_TEACHER_TIPS;
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      toast(randomTip, {
        icon: <Orbit className="w-4 h-4 text-primary" />,
        duration: 5000,
      });
    }, 5000);

    // Occasional toasts every 3 minutes
    const interval = setInterval(() => {
      const tips = user.role === "STUDENT" ? AI_STUDENT_TIPS : AI_TEACHER_TIPS;
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      toast(randomTip, {
        icon: <Orbit className="w-4 h-4 text-primary" />,
        duration: 5000,
      });
    }, 180000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [user?.role]);

  const navItems =
    user?.role === "TEACHER" ? TEACHER_NAV :
      user?.role === "ADMIN" ? ADMIN_NAV :
        STUDENT_NAV;

  const isActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split("?");
    const hrefTab = hrefQuery ? new URLSearchParams(hrefQuery).get("tab") : null;
    if (!hrefTab) {
      // Plain path link — active if pathname matches and no tab is active from a query
      return pathname === hrefPath && !currentTab;
    }
    // Tab link — active if path matches AND tab matches
    return pathname === hrefPath && currentTab === hrefTab;
  };

  return (
    <aside className="w-56 shrink-0 hidden lg:flex flex-col gap-3 sticky top-[4.5rem] h-[calc(100vh-4.5rem)] pb-6 pt-2 overflow-y-auto">
      {/* User level card */}
      {user && (
        <div className="brand-gradient rounded-2xl p-4 text-white shadow-lg shadow-violet-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm backdrop-blur-sm">
            {user.avatar}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{user.name.split(" ")[0]}</p>
            <p className="text-white/70 text-xs capitalize">{user.role.toLowerCase()} · {user.city}</p>
          </div>
        </div>
        {user && user.role !== "ADMIN" && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs font-bold">{user.level}</p>
              <p className="text-[10px] text-white/70">Level</p>
            </div>
            <div>
              <p className="text-xs font-bold">{user.xp.toLocaleString()}</p>
              <p className="text-[10px] text-white/70">XP</p>
            </div>
            <div>
              <p className="text-xs font-bold flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3" />{user.streak}
              </p>
              <p className="text-[10px] text-white/70">Streak</p>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }, i) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{ x: 3, backgroundColor: "var(--color-muted)" }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 brand-gradient rounded-r-full"
                  />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
                {label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* AI Tip card */}
      {(user?.role === "STUDENT" || user?.role === "TEACHER") && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-auto bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/10 dark:to-blue-900/10 border border-pink-200/50 dark:border-pink-700/20 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Orbit className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold text-primary">AI Insight</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {currentTip || (user.role === "STUDENT" ? AI_STUDENT_TIPS[0] : AI_TEACHER_TIPS[0])}
          </p>
        </motion.div>
      )}
    </aside>
  );
}
