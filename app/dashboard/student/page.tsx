"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  BookOpen, Flame, Star, Trophy, Zap, Target, TrendingUp,
  ArrowRight, Lock, CheckCircle2, Clock, Play, Plus,
  Orbit, Award, Medal, FlaskConical
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  DEMO_ACHIEVEMENTS, DEMO_DAILY_ACTIVITY,
  DEMO_NOTIFICATIONS,
  getXpForNextLevel, getXpForCurrentLevel, type DemoAchievement,
  AI_STUDENT_TIPS
} from "@/lib/demo-data";
import { useCourses } from "@/lib/course-context";
import { useEffect } from "react";

const ACHIEVEMENT_ICONS: Record<string, React.ElementType> = {
  Star, Trophy, Flame, Award, Zap, FlaskConical, Medal
};

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const stagger = (i: number) => ({ ...FADE_UP, transition: { ...FADE_UP.transition, delay: i * 0.07 } });

function AchievementBadge({ a, i }: { a: DemoAchievement; i: number }) {
  const Icon = ACHIEVEMENT_ICONS[a.icon] || Star;
  return (
    <motion.div
      key={a.id}
      {...stagger(i)}
      whileHover={a.earned ? { scale: 1.05, y: -3 } : {}}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all ${
        a.earned
          ? "border-pink-200 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/10 dark:to-blue-900/10"
          : "border-border bg-muted/30 opacity-50"
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
        a.earned ? "brand-gradient" : "bg-muted"
      }`}>
        {a.earned ? (
          <Icon className="w-6 h-6 text-white" />
        ) : (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground leading-tight">{a.title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{a.description}</p>
        {a.earned && <p className="text-[10px] font-bold text-primary mt-1">+{a.xpBonus} XP</p>}
      </div>
    </motion.div>
  );
}

function StudentDashboardContent() {
  const { user } = useAuth();
  const { courses: DEMO_COURSES, enrolledIds, enrollCourse } = useCourses();
  const [showEnroll, setShowEnroll] = useState(false);

  useEffect(() => {
    // Local state/sync logic if any
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
        <Link href="/signin">
          <motion.button whileHover={{ scale: 1.02 }} className="brand-gradient text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-pink-500/20">
            Sign In
          </motion.button>
        </Link>
      </div>
    );
  }

  const enrolledCourses = DEMO_COURSES.filter((c) => enrolledIds.includes(c.id));
  const availableCourses = DEMO_COURSES.filter((c) => !enrolledIds.includes(c.id));
  const currentXp = user.xp;
  const xpForCurrent = getXpForCurrentLevel(user.level);
  const xpForNext = getXpForNextLevel(user.level);
  const xpProgress = Math.round(((currentXp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100);

  const handleEnroll = (courseId: number, courseTitle: string) => {
    enrollCourse(courseId);
    toast.success(`Enrolled in "${courseTitle}"!`, { description: "Start learning and earn XP." });
  };

  const statusColors: Record<string, string> = {
    COMPLETED: "from-emerald-400 to-green-500",
    IN_PROGRESS: "from-pink-400 to-blue-500",
    NOT_STARTED: "from-slate-300 to-slate-400",
  };

  const statusLabel: Record<string, string> = {
    COMPLETED: "Completed",
    IN_PROGRESS: "In Progress",
    NOT_STARTED: "Not Started",
  };

  return (
    <div className="flex flex-col gap-6 p-1 sm:p-2 transition-colors duration-300">
      {/* Welcome header */}
      <motion.div {...FADE_UP} className="relative overflow-hidden brand-gradient rounded-[2rem] p-8 text-white shadow-xl shadow-pink-500/20">
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm font-medium">Welcome back,</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-0.5">{user.name.split(" ")[0]} 👋</h1>
              <p className="text-white/80 text-sm mt-1">{user.city} · Keep up the great work!</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
              <Flame className="w-5 h-5 text-orange-300" />
              <div>
                <p className="text-xl font-extrabold leading-none">{user.streak}</p>
                <p className="text-[10px] text-white/70">day streak</p>
              </div>
            </div>
          </div>
          {/* XP progress bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/70 font-medium">Level {user.level}</span>
              <span className="text-xs text-white/70">{currentXp.toLocaleString()} / {xpForNext.toLocaleString()} XP</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-white rounded-full"
              />
            </div>
            <p className="text-[10px] text-white/60 mt-1">{xpForNext - currentXp} XP to Level {user.level + 1}</p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-6 -bottom-8 w-28 h-28 rounded-full bg-white/5" />
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Enrolled", value: enrolledCourses.length, icon: BookOpen, color: "from-pink-500 to-rose-600" },
          { label: "Completed", value: enrolledCourses.filter(c => c.status === "COMPLETED").length, icon: CheckCircle2, color: "from-emerald-400 to-green-500" },
          { label: "XP Earned", value: `${(user.xp / 1000).toFixed(1)}k`, icon: Zap, color: "from-amber-400 to-orange-500" },
          { label: "Coins", value: user.coins, icon: Star, color: "from-blue-400 to-cyan-500" },
        ].map((stat, i) => (
          <motion.div key={stat.label} {...stagger(i)}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-xl hover:shadow-pink-500/5 transition-all">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Recommendation banner */}
      <motion.div {...FADE_UP} className="bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/10 dark:to-blue-900/10 border border-pink-200/40 dark:border-pink-700/20 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
          <Orbit className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Orbit className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-semibold text-primary">AI Recommendation</p>
          </div>
          <p className="text-sm text-foreground font-medium">Continue <span className="font-bold">Cloud Computing with AWS</span></p>
          <p className="text-xs text-muted-foreground mt-0.5">Based on your progress, 3 more lessons will complete this module.</p>
        </div>
        <Link href="/courses/1/lessons">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="brand-gradient text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md shadow-pink-500/20 shrink-0 flex items-center gap-1.5">
            Resume <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">My Courses</h2>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowEnroll(true)}
            className="brand-gradient text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md shadow-pink-500/20 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Enroll
          </motion.button>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">No courses yet</p>
            <p className="text-sm text-muted-foreground mb-4">Enroll in a course to start learning</p>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowEnroll(true)}
              className="brand-gradient text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-pink-500/20">
              Browse Courses
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {enrolledCourses.map((course, i) => (
              <motion.div key={course.id} {...stagger(i)} whileHover={{ y: -3 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-pink-500/10 transition-all group">
                <div className={`h-2 bg-gradient-to-r ${statusColors[course.status || "NOT_STARTED"]}`} />
                {/* Course Banner */}
                <div className="relative h-32 w-full overflow-hidden bg-muted">
                  <img 
                    src={course.image || "/images/default-course.png"} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-bold text-xs text-white leading-tight line-clamp-1">{course.title}</h3>
                    <span className={`mt-1 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r ${statusColors[course.status || "NOT_STARTED"]} text-white outline outline-1 outline-white/20`}>
                      {statusLabel[course.status || "NOT_STARTED"]}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{course.description}</p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.lessons} lessons</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" />{course.rating}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                        className={`h-full bg-gradient-to-r ${statusColors[course.status || "NOT_STARTED"]} rounded-full`}
                      />
                    </div>
                  </div>

                  <Link href={`/courses/${course.id}`}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                      className="w-full brand-gradient text-white text-xs font-semibold py-2.5 rounded-xl shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 font-bold tracking-tight uppercase">
                      <Play className="w-3.5 h-3.5" />
                      {course.progress === 0 ? "Start Course" : course.progress === 100 ? "Review" : "Continue"}
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Activity */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Weekly Activity</h2>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-end gap-2 h-24">
            {DEMO_DAILY_ACTIVITY.map((day, i) => {
              const maxXp = Math.max(...DEMO_DAILY_ACTIVITY.map((d) => d.xp));
              const h = Math.round((day.xp / maxXp) * 100);
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="relative w-full flex justify-center group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                      className="w-full max-w-[28px] brand-gradient rounded-t-md min-h-[4px] shadow-sm cursor-default"
                    />
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded-lg px-2 py-1 text-[10px] font-semibold text-foreground whitespace-nowrap shadow-lg z-10">
                      {day.xp} XP
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground">{day.date.split(" ")[1]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-primary" />This week</span>
            <span className="font-semibold text-foreground">
              {DEMO_DAILY_ACTIVITY.reduce((s, d) => s + d.xp, 0)} XP earned
            </span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Achievements</h2>
          <Link href="/achievements" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEMO_ACHIEVEMENTS.slice(0, 8).map((a, i) => (
            <AchievementBadge key={a.id} a={a} i={i} />
          ))}
        </div>
      </div>

      {/* Enroll dialog */}
      <AnimatePresence>
        {showEnroll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowEnroll(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="brand-gradient p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Browse Courses</h3>
                    <p className="text-white/70 text-sm">Enroll and start earning XP</p>
                  </div>
                  <button onClick={() => setShowEnroll(false)} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                    <span className="text-white text-lg leading-none">×</span>
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
                {availableCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                    <p className="font-semibold text-foreground">You&apos;re enrolled in all courses!</p>
                  </div>
                ) : (
                  availableCourses.map((course) => (
                    <div key={course.id} className="flex items-center gap-4 p-4 bg-muted/30 border border-border rounded-2xl hover:bg-muted/50 transition-colors">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-md">
                        <img 
                          src={course.image || "/images/default-course.png"} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <BookOpen className="w-5 h-5 text-white shadow-sm" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{course.title}</p>
                        <p className="text-[10px] text-muted-foreground">{course.instructor} · {course.lessons} lessons</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-amber-400" />
                          <span className="text-xs font-medium text-foreground">{course.rating}</span>
                          <span className="text-xs text-muted-foreground">({course.enrolled} students)</span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleEnroll(course.id, course.title)}
                        className="brand-gradient text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md shadow-pink-500/20 shrink-0 font-bold"
                      >
                        Enroll
                      </motion.button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}
