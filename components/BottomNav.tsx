"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, BookOpen, ClipboardList, Trophy, Users, BarChart3, Settings } from "lucide-react";
import Link from "next/link";

interface NavItem { label: string; href: string; icon: React.ElementType; }

const STUDENT_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard/student", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Tasks", href: "/assignments", icon: ClipboardList },
  { label: "Trophies", href: "/achievements", icon: Trophy },
];

const TEACHER_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard/teacher", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Students", href: "/teacher/students", icon: Users },
  { label: "Stats", href: "/teacher/analytics", icon: BarChart3 },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const navItems =
    user.role === "TEACHER" ? TEACHER_NAV :
    user.role === "ADMIN" ? ADMIN_NAV :
    STUDENT_NAV;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl shadow-violet-500/10">
      <div className="grid grid-cols-4 h-16 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
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
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? "brand-gradient shadow-md shadow-violet-500/25" : "bg-transparent"}`}>
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
