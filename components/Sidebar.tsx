"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, BookOpen, ClipboardList, Trophy,
  BarChart3, Users, Settings, Flame, Star, Brain
} from "lucide-react";
import Link from "next/link";

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
  { label: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
  { label: "My Courses", href: "/courses", icon: BookOpen },
  { label: "Students", href: "/dashboard/teacher?tab=students", icon: Users },
  { label: "Analytics", href: "/dashboard/teacher?tab=overview", icon: BarChart3 },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/admin?tab=users", icon: Users },
  { label: "Courses", href: "/dashboard/admin?tab=courses", icon: BookOpen },
  { label: "Analytics", href: "/dashboard/admin?tab=overview", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const { user } = useAuth();

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
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 brand-gradient rounded-r-full"
                  />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* AI Tip card */}
      <div className="mt-auto bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-200/50 dark:border-violet-700/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary">AI Tip</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Complete 3 more lessons today to maintain your streak and earn bonus XP!
        </p>
      </div>
    </aside>
  );
}
