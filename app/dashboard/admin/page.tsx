"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  ADMIN_STATS, ADMIN_MONTHLY_DATA, DEMO_USERS, DEMO_COURSES
} from "@/lib/demo-data";
import {
  Users, BookOpen, TrendingUp, BarChart3, Settings,
  Shield, UserCheck, Award, Activity, Orbit,
  CheckCircle2, XCircle, ChevronUp, Zap, Flag
} from "lucide-react";
import Link from "next/link";

const FADE_UP = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
const stagger = (i: number) => ({ ...FADE_UP, transition: { ...FADE_UP.transition, delay: i * 0.07 } });

const ROLE_STYLES = {
  STUDENT: { color: "from-pink-500 to-rose-500", label: "Student", icon: Orbit },
  TEACHER: { color: "from-blue-500 to-cyan-500", label: "Teacher", icon: UserCheck },
  ADMIN:   { color: "from-rose-500 to-pink-500", label: "Admin", icon: Shield },
};

function AdminDashboardContent() {
 const { user } = useAuth();
  if (!user) {
    return null;
  }
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = typeof window !== "undefined"
    ? (searchParams.get("tab") as "overview" | "users" | "courses" | "system" | null)
    : null;
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "courses" | "system">(tabParam ?? "overview");
  const [userSearch, setUserSearch] = useState("");

  // Sync tab when URL changes (e.g. from sidebar click)
  useEffect(() => {
    if (tabParam && ["overview", "users", "courses", "system"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const filteredUsers = DEMO_USERS.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const maxEnroll = Math.max(...ADMIN_MONTHLY_DATA.map((d) => d.enrollments));

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "users", label: `Users (${ADMIN_STATS.totalUsers.toLocaleString()})` },
    { id: "courses", label: "Courses" },
    { id: "system", label: "System" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div {...FADE_UP} className="relative overflow-hidden brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-pink-500/20">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-white/70" />
              <p className="text-white/70 text-sm font-medium">Admin Control Panel</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name}</h1>
            <p className="text-white/80 text-sm mt-1">{user?.city} · Super Admin</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center shrink-0">
            <p className="text-xl font-extrabold">{ADMIN_STATS.activeThisMonth.toLocaleString()}</p>
            <p className="text-xs text-white/70">Active this month</p>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full bg-white/5" />
      </motion.div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: ADMIN_STATS.totalUsers.toLocaleString(), icon: Users, color: "from-pink-500 to-rose-600", change: `+${ADMIN_STATS.newThisMonth} this month` },
          { label: "Total Courses", value: ADMIN_STATS.totalCourses, icon: BookOpen, color: "from-blue-500 to-cyan-500", change: "8 subjects" },
          { label: "Enrollments", value: ADMIN_STATS.totalEnrollments.toLocaleString(), icon: TrendingUp, color: "from-emerald-400 to-green-500", change: "All time" },
          { label: "Completion Rate", value: `${ADMIN_STATS.courseCompletionRate}%`, icon: CheckCircle2, color: "from-amber-400 to-orange-500", change: "Avg quiz: " + ADMIN_STATS.avgQuizScore + "%" },
        ].map((stat, i) => (
          <motion.div key={stat.label} {...stagger(i)}
            className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
              <stat.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-primary mt-0.5 font-medium">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative shrink-0 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="admin-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 brand-gradient rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-5">
          {/* Growth chart */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Enrollment Growth (Last 6 Months)
            </h3>
            <p className="text-sm text-muted-foreground">Monitor and manage the IT Training ecosystem</p>
            <div className="flex items-end gap-3 h-28">
              {ADMIN_MONTHLY_DATA.map((month, i) => {
                const h = Math.round((month.enrollments / maxEnroll) * 100);
                return (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="relative w-full flex justify-center group">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
                        className="w-full max-w-[32px] brand-gradient rounded-t-md min-h-[4px]"
                      />
                      <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded-lg px-2 py-1 text-[10px] font-semibold text-foreground whitespace-nowrap shadow-lg z-10">
                        {month.enrollments.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{month.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role distribution */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> User Distribution
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Students", count: ADMIN_STATS.totalStudents, total: ADMIN_STATS.totalUsers, color: "from-pink-500 to-rose-500" },
                { label: "Teachers", count: ADMIN_STATS.totalTeachers, total: ADMIN_STATS.totalUsers, color: "from-blue-500 to-cyan-500" },
                { label: "Admins", count: ADMIN_STATS.totalAdmins, total: ADMIN_STATS.totalUsers, color: "from-rose-500 to-pink-500" },
              ].map((role) => {
                const pct = Math.round((role.count / role.total) * 100);
                return (
                  <div key={role.label} className="flex items-center gap-3">
                    <span className="w-16 text-xs font-medium text-muted-foreground">{role.label}</span>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${role.color} rounded-full`}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 w-20 text-right justify-end">
                      <span className="text-xs font-bold text-foreground">{role.count.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            {filteredUsers.map((u, i) => {
              const roleStyle = ROLE_STYLES[u.role];
              const RoleIcon = roleStyle.icon;
              return (
                <motion.div key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:bg-muted/30 transition-colors"
                >
                  <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-pink-500/20">
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground">{u.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${roleStyle.color} text-white flex items-center gap-1`}>
                        <RoleIcon className="w-2.5 h-2.5" /> {roleStyle.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{u.city}</span>
                      <span className="text-primary font-semibold">Lv.{u.level}</span>
                      <span>{u.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => toast.success(`Verification email sent to ${u.name}`)}
                      className="w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => toast.error(`${u.name} has been flagged for review.`)}
                      className="w-8 h-8 bg-destructive/10 hover:bg-destructive/20 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Flag className="w-4 h-4 text-destructive" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* COURSES TAB */}
      {activeTab === "courses" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEMO_COURSES.map((course, i) => (
            <motion.div key={course.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="brand-gradient p-4 text-white">
                <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wide">{course.subject}</p>
                <h3 className="font-bold text-sm leading-snug mt-0.5 line-clamp-2">{course.title}</h3>
                <p className="text-xs text-white/70 mt-1">By {course.instructor}</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="bg-muted/30 rounded-xl p-2">
                    <p className="font-bold text-sm text-foreground">{course.lessons}</p>
                    <p className="text-[10px] text-muted-foreground">Lessons</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-2">
                    <p className="font-bold text-sm text-foreground">{course.enrolled}</p>
                    <p className="text-[10px] text-muted-foreground">Enrolled</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-2">
                    <p className="font-bold text-sm text-foreground">{course.rating}</p>
                    <p className="text-[10px] text-muted-foreground">Rating</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/courses/${course.id}`} className="flex-1">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full brand-gradient text-white text-xs font-semibold py-2 rounded-lg shadow-sm">
                      View
                    </motion.button>
                  </Link>
                  {/* <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/dashboard/teacher/courses/edit/${course.id}`)}
                    className="flex-1 bg-muted hover:bg-muted/80 text-xs font-semibold py-2 rounded-lg text-foreground transition-colors relative overflow-hidden group">
                    <span className="relative z-10 flex items-center justify-center gap-1.5"><Settings className="w-3.5 h-3.5" /> Manage & Edit</span>
                    <div className="absolute inset-0 brand-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
                  </motion.button> */}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* SYSTEM TAB */}
      {activeTab === "system" && (
        <div className="flex flex-col gap-4">
          {/* System health */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> System Health
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "API Response", value: "98ms", status: "Excellent", color: "text-emerald-500" },
                { label: "Database", value: "99.9%", status: "Uptime", color: "text-emerald-500" },
                { label: "Storage", value: "34%", status: "Used", color: "text-amber-500" },
              ].map((item) => (
                <div key={item.label} className="bg-muted/30 rounded-xl p-4 text-center border border-border">
                  <p className={`text-2xl font-extrabold ${item.color}`}>{item.value}</p>
                  <p className="text-xs font-medium text-foreground mt-1">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Send Announcement", icon: Orbit, action: () => toast.success("Announcement sent to all users!") },
                { label: "Export User Data", icon: Users, action: () => toast.info("Exporting user data...") },
                { label: "Backup Database", icon: Shield, action: () => toast.success("Database backup initiated!") },
                { label: "Clear Cache", icon: Zap, action: () => toast.success("Cache cleared successfully!") },
              ].map((item) => (
                <motion.button key={item.label}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={item.action}
                  className="flex items-center gap-3 p-4 bg-muted/30 hover:bg-primary/10 border border-border hover:border-primary/30 rounded-xl text-left transition-all group"
                >
                  <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center shadow-sm shrink-0">
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
