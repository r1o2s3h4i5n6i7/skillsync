"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCourses } from "@/lib/course-context";
import { useSearchParams } from "next/navigation";
import { Loader } from "@/components/Loader";
import Image from "next/image";
import { getAvatarPath } from "@/types/auth";
import type { AdminDashboardData, LeaderboardEntry } from "@/types/dashboard";
import type { CourseListItem } from "@/types/course";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Users, BookOpen, TrendingUp, BarChart3, Settings,
  Shield, UserCheck, Award, Activity, Orbit,
  CheckCircle2, XCircle, ChevronUp, Zap, Flag, Star, Search, Filter,
} from "lucide-react";
import Link from "next/link";

const FADE_UP = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
const stagger = (i: number) => ({ ...FADE_UP, transition: { ...FADE_UP.transition, delay: i * 0.07 } });

const ROLE_STYLES: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  STUDENT: { color: "from-pink-500 to-rose-500", label: "Student", icon: Orbit },
  TEACHER: { color: "from-blue-500 to-cyan-500", label: "Teacher", icon: UserCheck },
  ADMIN:   { color: "from-rose-500 to-pink-500", label: "Admin", icon: Shield },
};

function AdminDashboardContent() {
  const { user } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "overview" | "users" | "courses" | "system" | null;
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "courses" | "system">(tabParam ?? "overview");
  
  const [dashData, setDashData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin Users Search & Pagination
  const [userSearch, setUserSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [adminUsers, setAdminUsers] = useState<LeaderboardEntry[]>([]);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [usersLoading, setUsersLoading] = useState(false);

  // Admin Courses Search & Pagination
  const [courseSearch, setCourseSearch] = useState("");
  const [coursesPage, setCoursesPage] = useState(1);
  const [adminCourses, setAdminCourses] = useState<CourseListItem[]>([]);
  const [totalCoursePages, setTotalCoursePages] = useState(1);
  const [courseSubjectFilter, setCourseSubjectFilter] = useState("ALL");
  const [courseDifficultyFilter, setCourseDifficultyFilter] = useState("ALL");
  const [adminCoursesLoading, setAdminCoursesLoading] = useState(false);

  useEffect(() => {
    if (tabParam && ["overview", "users", "courses", "system"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/admin");
      if (res.ok) {
        const data: AdminDashboardData = await res.json();
        setDashData(data);
      }
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user, fetchDashboard]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${usersPage}&limit=10&search=${encodeURIComponent(userSearch)}&role=${userRoleFilter}`);
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users);
        setTotalUserPages(data.totalPages);
      }
    } finally {
      setUsersLoading(false);
    }
  }, [usersPage, userSearch, userRoleFilter]);

  useEffect(() => {
    if (user && activeTab === "users") fetchUsers();
  }, [user, activeTab, fetchUsers]);

  const fetchAdminCourses = useCallback(async () => {
    setAdminCoursesLoading(true);
    try {
      const res = await fetch(`/api/admin/courses?page=${coursesPage}&limit=6&search=${encodeURIComponent(courseSearch)}&subject=${courseSubjectFilter}&difficulty=${courseDifficultyFilter}`);
      if (res.ok) {
        const data = await res.json();
        setAdminCourses(data.courses);
        setTotalCoursePages(data.totalPages);
      }
    } finally {
      setAdminCoursesLoading(false);
    }
  }, [coursesPage, courseSearch, courseSubjectFilter, courseDifficultyFilter]);

  useEffect(() => {
    if (user && activeTab === "courses") fetchAdminCourses();
  }, [user, activeTab, fetchAdminCourses]);

  if (!user) return null;

  if (isLoading || coursesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader size="lg" />
        <p className="text-sm text-muted-foreground font-medium">Loading admin dashboard...</p>
      </div>
    );
  }

  const stats = dashData?.stats;

  const TABS = [
    { id: "overview" as const, label: "Overview" },
    { id: "users" as const, label: `Users (${stats?.totalUsers ?? 0})` },
    { id: "courses" as const, label: "Courses" },
    { id: "system" as const, label: "System" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div {...FADE_UP} className="relative overflow-hidden brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-pink-500/20">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={getAvatarPath(user.role)}
              alt="Admin avatar"
              width={56}
              height={56}
              className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white/30"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-white/70" />
                <p className="text-white/70 text-sm font-medium">Admin Control Panel</p>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name}</h1>
              <p className="text-white/80 text-sm mt-1">{user?.city} · Super Admin</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center shrink-0">
            <p className="text-xl font-extrabold">{stats?.totalEnrollments ?? 0}</p>
            <p className="text-xs text-white/70">Total Enrollments</p>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full bg-white/5" />
      </motion.div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "from-pink-500 to-rose-600", change: `${stats?.totalStudents ?? 0} students` },
          { label: "Total Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "from-blue-500 to-cyan-500", change: `${stats?.totalTeachers ?? 0} teachers` },
          { label: "Enrollments", value: stats?.totalEnrollments ?? 0, icon: TrendingUp, color: "from-emerald-400 to-green-500", change: "All time" },
          { label: "Completion Rate", value: `${stats?.courseCompletionRate ?? 0}%`, icon: CheckCircle2, color: "from-amber-400 to-orange-500", change: `Avg quiz: ${stats?.avgQuizScore ?? 0}%` },
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Enrollment Trend */}
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col">
              <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Enrollment Growth (14d)
              </h3>
              <div className="h-48 flex items-end gap-1.5 px-2 relative">
                {dashData?.dailyEnrollments.map((day, i) => {
                  const maxCount = Math.max(...dashData.dailyEnrollments.map(d => d.count), 5);
                  const h = (day.count / maxCount) * 100;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                       <div className="relative w-full flex-1 flex flex-col justify-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(4, h)}%` }}
                            className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-colors cursor-pointer"
                          />
                          <div className="absolute -top-8 px-2 py-1 bg-foreground text-background text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {day.count} enrollments
                          </div>
                       </div>
                       <span className="text-[8px] text-muted-foreground font-bold rotate-45 mt-1">{day.date.split("-").slice(1).join("/")}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-card border border-border rounded-2xl p-5">
               <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
                <Orbit className="w-4 h-4 text-primary" /> Subject Distribution
              </h3>
              <div className="flex flex-col gap-4">
                {dashData?.categoryDistribution.map((cat, i) => {
                  const maxCount = Math.max(...dashData.categoryDistribution.map(c => c.count), 1);
                  const pct = Math.round((cat.count / maxCount) * 100);
                  return (
                    <div key={cat.subject} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-muted-foreground uppercase">{cat.subject}</span>
                        <span className="text-foreground">{cat.count} courses</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          className="h-full brand-gradient rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
             {/* Role distribution */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> User Distribution
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Students", count: stats?.totalStudents ?? 0, total: stats?.totalUsers ?? 1, color: "from-pink-500 to-rose-500" },
                  { label: "Teachers", count: stats?.totalTeachers ?? 0, total: stats?.totalUsers ?? 1, color: "from-blue-500 to-cyan-500" },
                  { label: "Admins", count: (stats?.totalUsers ?? 0) - (stats?.totalStudents ?? 0) - (stats?.totalTeachers ?? 0), total: stats?.totalUsers ?? 1, color: "from-rose-500 to-pink-500" },
                ].map((role) => {
                  const pct = role.total > 0 ? Math.round((role.count / role.total) * 100) : 0;
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
                        <span className="text-xs font-bold text-foreground">{role.count}</span>
                        <span className="text-[10px] text-muted-foreground">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performing Courses */}
            <div className="bg-card border border-border rounded-2xl p-5">
               <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Top Performing Courses
              </h3>
              <div className="flex flex-col gap-2">
                {dashData?.topCourses.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/50">
                    <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-white">#{i+1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                           <Users className="w-2 h-2" /> {c.enrolled} Enrolled
                         </span>
                         <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                           <Star className="w-2 h-2 fill-emerald-500" /> {c.rating}
                         </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform health summary */}
          <div className="bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/10 dark:to-blue-900/10 border border-pink-200/40 dark:border-pink-700/20 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center shadow-md shadow-pink-500/20">
                <Orbit className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold text-primary">Platform Insights</p>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                `${stats?.totalUsers ?? 0} users on the platform with ${stats?.totalEnrollments ?? 0} total enrollments.`,
                `Average course completion rate: ${stats?.courseCompletionRate ?? 0}%`,
                `Average quiz score across all students: ${stats?.avgQuizScore ?? 0}%`,
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUsersPage(1); }}
                className="w-full pl-4 pr-10 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm">
              <Filter className="w-4 h-4 text-primary" />
              <select 
                value={userRoleFilter} 
                onChange={(e) => { setUserRoleFilter(e.target.value); setUsersPage(1); }}
                className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer pr-2"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="TEACHER">Teachers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>
          {usersLoading ? (
            <div className="flex justify-center p-8"><Loader /></div>
          ) : (
            <div className="flex flex-col gap-2">
              {adminUsers.map((u, i) => {
                const roleStyle = ROLE_STYLES[u.role] ?? ROLE_STYLES.STUDENT;
              const RoleIcon = roleStyle.icon;
              return (
                <motion.div key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:bg-muted/30 transition-colors"
                >
                  <Image
                    src={getAvatarPath(u.role as "STUDENT" | "TEACHER" | "ADMIN")}
                    alt={`${u.role} avatar`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-xl object-cover shadow-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground">{u.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${roleStyle.color} text-white flex items-center gap-1`}>
                        <RoleIcon className="w-2.5 h-2.5" /> {roleStyle.label}
                      </span>
                    </div>
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
          )}
          {totalUserPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-2">
              <button disabled={usersPage === 1} onClick={() => setUsersPage(p => p - 1)} className="px-3 py-1 bg-card rounded-md border text-sm disabled:opacity-50">Prev</button>
              <span className="text-sm font-semibold">{usersPage} / {totalUserPages}</span>
              <button disabled={usersPage === totalUserPages} onClick={() => setUsersPage(p => p + 1)} className="px-3 py-1 bg-card rounded-md border text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}

      {/* COURSES TAB */}
      {activeTab === "courses" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => { setCourseSearch(e.target.value); setCoursesPage(1); }}
                className="w-full pl-4 pr-10 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                <select 
                  value={courseSubjectFilter} 
                  onChange={(e) => { setCourseSubjectFilter(e.target.value); setCoursesPage(1); }}
                  className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer pr-2"
                >
                  <option value="ALL">All Subjects</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm">
                <Activity className="w-4 h-4 text-primary" />
                <select 
                  value={courseDifficultyFilter} 
                  onChange={(e) => { setCourseDifficultyFilter(e.target.value); setCoursesPage(1); }}
                  className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer pr-2"
                >
                  <option value="ALL">All Levels</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>
          </div>
          {adminCoursesLoading ? (
            <div className="flex justify-center p-8"><Loader /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminCourses.map((course, i) => (
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
                <Link href={`/courses/${course.id}`}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full brand-gradient text-white text-xs font-semibold py-2 rounded-lg shadow-sm">
                    View
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
          </div>
          )}
          {totalCoursePages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-2">
              <button disabled={coursesPage === 1} onClick={() => setCoursesPage(p => p - 1)} className="px-3 py-1 bg-card rounded-md border text-sm disabled:opacity-50">Prev</button>
              <span className="text-sm font-semibold">{coursesPage} / {totalCoursePages}</span>
              <button disabled={coursesPage === totalCoursePages} onClick={() => setCoursesPage(p => p + 1)} className="px-3 py-1 bg-card rounded-md border text-sm disabled:opacity-50">Next</button>
            </div>
          )}
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
