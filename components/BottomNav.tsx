"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, BookOpen, ClipboardList, Plus, Trophy, Users, BarChart3, Settings } from "lucide-react";
import Link from "next/link";

interface NavItem { label: string; href: string; icon: React.ElementType; }

const STUDENT_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard/student", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Tasks", href: "/assignments", icon: ClipboardList },
  { label: "Awards", href: "/achievements", icon: Trophy },
];

const TEACHER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/teacher", icon: BarChart3 },
  { label: "Add", href: "/dashboard/teacher/courses/new", icon: Plus },
  { label: "Courses", href: "/dashboard/teacher?tab=courses", icon: BookOpen },
  { label: "Students", href: "/dashboard/teacher?tab=students", icon: Users },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard/admin?tab=overview", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/admin?tab=users", icon: Users },
  { label: "Courses", href: "/dashboard/admin?tab=courses", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const { user } = useAuth();

  if (!user) return null;

  const navItems =
    user.role === "TEACHER" ? TEACHER_NAV :
    user.role === "ADMIN" ? ADMIN_NAV :
    STUDENT_NAV;

  const isActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split("?");
    const hrefTab = hrefQuery ? new URLSearchParams(hrefQuery).get("tab") : null;
    
    if (!hrefTab) {
      return pathname === hrefPath && !currentTab;
    }
    return pathname === hrefPath && currentTab === hrefTab;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl shadow-pink-500/10">
      <div className="grid grid-cols-4 h-16 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center justify-center gap-0.5 relative">
              {active && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 brand-gradient rounded-b-full"
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`flex flex-col items-center gap-0.5 ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? "brand-gradient shadow-md shadow-pink-500/25" : "bg-transparent"}`}>
                  <Icon className={`w-4.5 h-4.5 ${active ? "text-white" : ""}`} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
