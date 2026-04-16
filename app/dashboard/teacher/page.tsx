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
import { calculateLevelAndProgress } from "@/lib/level-utils";
import type { TeacherDashboardData, TeacherCourseStats } from "@/types/dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  BookOpen, Search, Filter, Plus, ChevronLeft, ChevronRight, 
  TrendingUp, Activity, Star, Clock, Users, Play, Trash2, Edit, ExternalLink,
  Flame, Zap, Target, Award, CheckCircle2, Orbit
} from "lucide-react";
import Link from "next/link";

const FADE_UP = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
const stagger = (i: number) => ({ ...FADE_UP, transition: { ...FADE_UP.transition, delay: i * 0.07 } });

function ProgressBar({ value, max = 100, color = "brand-gradient" }: { value: number; max?: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  );
}

function TeacherDashboardContent() {
  const { user } = useAuth();
  const { courses, deleteCourse, isLoading: coursesLoading } = useCourses();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "overview" | "courses" | null;
  const [activeTab, setActiveTab] = useState<"overview" | "courses">(tabParam ?? "overview");
  const [dashData, setDashData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Courses Tab States
  const [courseSearch, setCourseSearch] = useState("");
  const [courseCategory, setCourseCategory] = useState("ALL");
  const [courseSort, setCourseSort] = useState("NEWEST");
  const [coursePage, setCoursePage] = useState(1);
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourseStats[]>([]);
  const [totalCoursePages, setTotalCoursePages] = useState(1);
  const [coursesTabLoading, setCoursesTabLoading] = useState(false);
  const itemsPerPage = 6;



  useEffect(() => {
    if (tabParam && ["overview", "courses"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/teacher");
      if (res.ok) {
        const data: TeacherDashboardData = await res.json();
        setDashData(data);
      }
    } catch (err) {
      console.error("Teacher dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user, fetchDashboard]);

  const fetchTeacherCourses = useCallback(async () => {
    setCoursesTabLoading(true);
    try {
      const res = await fetch(`/api/teacher/my-courses?page=${coursePage}&limit=${itemsPerPage}&search=${encodeURIComponent(courseSearch)}&category=${courseCategory}&sort=${courseSort}`);
      if (res.ok) {
        const data = await res.json();
        setTeacherCourses(data.courses);
        setTotalCoursePages(data.totalPages);
      }
    } finally {
      setCoursesTabLoading(false);
    }
  }, [coursePage, courseSearch, courseCategory, courseSort]);

  useEffect(() => {
    if (user && activeTab === "courses") fetchTeacherCourses();
  }, [user, activeTab, fetchTeacherCourses]);

  if (!user) return null;

  if (isLoading || coursesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader size="lg" />
        <p className="text-sm text-muted-foreground font-medium">Loading teacher dashboard...</p>
      </div>
    );
  }

  const totalStudents = dashData?.totalStudents ?? 0;
  const courseStats: TeacherCourseStats[] = dashData?.courses ?? [];
  
  const myCourses = courses.filter((c) => c.instructorId === user.id);
  const uniqueCategories = Array.from(new Set(myCourses.map(c => c.subject)));
  const totalEnrollments = dashData?.totalEnrollments ?? 0;
  const avgProgress = courseStats.length > 0
    ? Math.round(courseStats.reduce((s, c) => s + c.avgProgress, 0) / courseStats.length)
    : 0;

  const dailyActivity = dashData?.dailyActivity ?? [];

  const handleDeleteCourse = (id: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      deleteCourse(id);
      toast.success("Course deleted successfully!");
    }
  };

  const TABS = [
    { id: "overview" as const, label: "Overview" },
    { id: "courses" as const, label: "My Courses" },
  ];

  const { level: computedLevel } = calculateLevelAndProgress(dashData?.stats.xp ?? user.xp);
  const currentStreak = dashData?.stats.streak ?? user.streak;
  const currentXP = dashData?.stats.xp ?? user.xp;

  return (
    <div className="flex flex-col gap-6 p-1 sm:p-2 transition-colors duration-300">
      {/* Header Banner */}
      <motion.div {...FADE_UP} className="relative overflow-hidden brand-gradient rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl shadow-pink-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Image
                src={getAvatarPath(user.role)}
                alt="Teacher avatar"
                width={80}
                height={80}
                className="w-20 h-20 rounded-3xl object-cover shadow-2xl border-4 border-white/20"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">Teacher Dashboard</p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{user.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-white/80 font-medium">
                <span className="bg-white/20 px-3 py-1 rounded-lg text-xs">Level {computedLevel}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="text-sm">{user.city} · Educator</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 flex flex-col items-center justify-center min-w-[100px] shadow-xl">
              <Flame className="w-6 h-6 text-orange-400 mb-1" />
              <p className="text-2xl font-black">{currentStreak}</p>
              <p className="text-[10px] uppercase font-bold text-white/60">Day Streak</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 flex flex-col items-center justify-center min-w-[100px] shadow-xl">
              <Zap className="w-6 h-6 text-yellow-400 mb-1" />
              <p className="text-2xl font-black">{currentXP.toLocaleString()}</p>
              <p className="text-[10px] uppercase font-bold text-white/60">Total XP</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "My Courses", value: totalEnrollments, val: myCourses.length, icon: BookOpen, color: "from-pink-500 to-rose-600", detail: "Active content" },
          { label: "Total Students", value: totalStudents, icon: Users, color: "from-blue-500 to-cyan-500", detail: "Global reach" },
          { label: "Enrollments", value: totalEnrollments, icon: Zap, color: "from-amber-400 to-orange-500", detail: "Course spikes" },
          { label: "Avg Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "from-emerald-400 to-green-500", detail: "Success rate" },
        ].map((stat, i) => (
          <motion.div key={stat.label} {...stagger(i)}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-card border border-border rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm hover:shadow-2xl hover:shadow-pink-500/5 transition-all group">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">{stat.val ?? stat.value}</p>
              <p className="text-sm font-bold text-muted-foreground mt-1">{stat.label}</p>
              <p className="text-[10px] font-bold text-primary/70 uppercase tracking-tighter mt-1">{stat.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2">
           <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-black text-foreground">Teacher Activity</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">XP & Engagement History</p>
                </div>
                <div className="bg-primary/10 rounded-2xl p-3">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
              </div>

              {dailyActivity.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                   <Target className="w-12 h-12 text-muted-foreground/30 mb-3" />
                   <p className="text-muted-foreground font-medium">No activity recorded this week.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-8">
                   <div className="relative h-48 flex items-end gap-3 sm:gap-6 px-4">
                      {/* Grid line */}
                      <div className="absolute inset-0 flex flex-col justify-between py-2">
                        <div className="w-full border-t border-border/30 border-dashed" />
                        <div className="w-full border-t border-border/30 border-dashed" />
                        <div className="w-full border-t border-border/30 border-dashed" />
                      </div>

                      {dailyActivity.slice(-7).map((day, i) => {
                        const mx = Math.max(...dailyActivity.slice(-7).map(d => d.xp), 500);
                        const h = Math.round((day.xp / mx) * 100);
                        const isToday = new Date().toDateString() === new Date(day.date).toDateString();

                        return (
                          <div key={day.date} className="h-full flex-1 flex flex-col items-center gap-4 z-10 group relative">
                             <div className="relative w-full flex-1 flex justify-center items-end">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: `${Math.max(6, h)}%`, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 100, delay: i * 0.1 }}
                                  className={`w-full max-w-[42px] rounded-t-3xl shadow-xl transition-all duration-300 ${
                                    isToday 
                                      ? "brand-gradient" 
                                      : "bg-slate-200 dark:bg-slate-800 group-hover:bg-primary/40"
                                  }`}
                                />
                             </div>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                                {new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" })}
                             </span>
                          </div>
                        );
                      })}
                   </div>

                   <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-muted/30 rounded-[2rem] p-6 border border-border/50">
                        <Star className="w-5 h-5 text-amber-500 mb-2" />
                        <p className="text-xl font-black">{Math.round(user.xp / 100)}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Reputation Score</p>
                      </div>
                      <div className="bg-muted/30 rounded-[2rem] p-6 border border-border/50">
                        <Award className="w-5 h-5 text-emerald-500 mb-2" />
                        <p className="text-xl font-black">Expert</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Rank Status</p>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Quick Review */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-black text-foreground mb-6">Course Performance</h3>
            <div className="flex flex-col gap-6">
              {courseStats.slice(0, 4).map((c, i) => (
                <div key={c.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-black text-foreground line-clamp-1">{c.title}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{c.subject}</p>
                    </div>
                    <p className="text-lg font-black text-primary">{c.avgProgress}%</p>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.avgProgress}%` }}
                      transition={{ duration: 1.2, delay: i * 0.15 }}
                      className="h-full brand-gradient rounded-full"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.enrolledCount}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {c.lessonCount}</span>
                  </div>
                </div>
              ))}
              {courseStats.length === 0 && (
                <div className="text-center py-12">
                   <p className="text-muted-foreground font-medium">No courses published yet.</p>
                </div>
              )}
            </div>
            {courseStats.length > 4 && (
               <button onClick={() => setActiveTab("courses")} className="mt-8 w-full py-4 rounded-2xl border border-border text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors">
                  View All Stats
               </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mt-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-3 text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="teacher-tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 brand-gradient rounded-t-full shadow-[0_-4px_10px_rgba(236,72,153,0.3)]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
           {/* AI Insights - Re-styled */}
           <div className="relative group">
              <div className="absolute -inset-0.5 brand-gradient rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
                      <Orbit className="w-6 h-6 text-white" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black text-foreground">AI Teaching Intelligence</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Strategic Recommendations</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {[
                     { tip: `Global student network: ${totalStudents} active learners.`, icon: Users },
                     { tip: `Teaching efficacy: Course completion is at ${avgProgress}%.`, icon: Star },
                     { tip: `Momentum: Your content gain is leading in ${myCourses[0]?.subject ?? "tech"}.`, icon: TrendingUp },
                   ].map((item, i) => (
                     <div key={i} className="bg-muted/30 rounded-2xl p-4 border border-border/50 flex items-start gap-3">
                        <item.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">{item.tip}</p>
                     </div>
                   ))}
                </div>
              </div>
           </div>
        </motion.div>
      )}

      {activeTab === "courses" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="font-bold text-foreground self-start sm:self-auto">Manage your content</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Courses Filter Menu */}
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search courses..." 
                  value={courseSearch}
                  onChange={e => { setCourseSearch(e.target.value); setCoursePage(1); }}
                  className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <select 
                value={courseCategory} 
                onChange={e => { setCourseCategory(e.target.value); setCoursePage(1); }}
                className="bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select 
                value={courseSort} 
                onChange={e => { setCourseSort(e.target.value); setCoursePage(1); }}
                className="bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="NEWEST">Newest</option>
                <option value="ENROLLMENTS">Most Enrolled</option>
                <option value="RATING">Top Rated</option>
              </select>

              <Link href="/dashboard/teacher/courses/new" className="shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="brand-gradient text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-pink-500/20 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Course
                </motion.button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coursesTabLoading ? (
            <div className="col-span-full py-12 flex justify-center"><Loader /></div>
              ) : teacherCourses.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-card border border-border rounded-3xl mt-4">
               <Filter className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
               <p className="text-muted-foreground font-medium">No courses found matching your criteria.</p>
            </div>
          ) : teacherCourses.map((course, i) => (
            <motion.div key={course.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/10"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={(course as any).image || "/images/default-course.png"}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-2xl px-3 py-1 border border-white/20">
                   <p className="text-[10px] font-black text-white/90 uppercase tracking-widest">{course.subject}</p>
                </div>
                <div className="absolute bottom-4 left-6 right-6">
                  <h3 className="font-black text-lg text-white leading-tight line-clamp-2 drop-shadow-lg">{course.title}</h3>
                </div>
              </div>
              
              <div className="p-6 pt-2">
                <div className="flex items-center gap-4 mb-5 p-2 bg-muted/30 rounded-[2rem] border border-border/50">
                  <div className="flex-1 text-center">
                    <p className="text-sm font-black text-foreground">{course.lessonCount}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Lessons</p>
                  </div>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="flex-1 text-center">
                    <p className="text-sm font-black text-foreground">{course.enrolledCount}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Students</p>
                  </div>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="flex-1 text-center">
                    <p className="text-sm font-black text-foreground flex items-center justify-center gap-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{course.rating}
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Rating</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/courses/${course.id}`} className="flex-1">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="w-full brand-gradient text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-2xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" /> View
                    </motion.button>
                  </Link>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/teacher/courses/edit/${course.id}`}>
                      <motion.button whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}
                         className="p-3.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-2xl transition-all shadow-sm">
                        <Edit className="w-4.5 h-4.5" />
                      </motion.button>
                    </Link>
                    <motion.button whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-3.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-2xl transition-all shadow-sm border border-rose-500/10">
                      <Trash2 className="w-4.5 h-4.5" />
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Progress bar subtle */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${course.avgProgress}%` }}
                   className="h-full brand-gradient"
                 />
              </div>
            </motion.div>
          ))}
          </div>

          {/* Pagination Controls */}
          {totalCoursePages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button 
                onClick={() => setCoursePage(p => Math.max(1, p - 1))}
                disabled={coursePage === 1}
                className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <span className="text-sm font-semibold text-foreground">
                Page {coursePage} of {totalCoursePages}
              </span>
              <button 
                onClick={() => setCoursePage(p => Math.min(totalCoursePages, p + 1))}
                disabled={coursePage === totalCoursePages}
                className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TeacherDashboard() {
  return (
    <ProtectedRoute allowedRoles={["TEACHER"]}>
      <TeacherDashboardContent />
    </ProtectedRoute>
  );
}
