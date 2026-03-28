"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  DEMO_ACHIEVEMENTS, DEMO_COURSES, STUDENT_ENROLLED_IDS,
  getXpForNextLevel, getXpForCurrentLevel, TEACHER_ACHIEVEMENTS
} from "@/lib/demo-data";
import {
  Flame, Zap, Star, Trophy, BookOpen, Calendar, MapPin,
  Mail, Orbit, Lock, User, Shield, LogOut, Edit2, ShieldCheck, Camera, Bell, Award, Clock
} from "lucide-react";
import Link from "next/link";

const ACH_ICONS: Record<string, React.ElementType> = { Star, Trophy, Flame, Zap };

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
        <Link href="/signin">
          <motion.button whileHover={{ scale: 1.02 }} className="brand-gradient text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-pink-500/20">
            Sign In
          </motion.button>
        </Link>
      </div>
    );
  }

  const xpForCurrent = getXpForCurrentLevel(user.level);
  const xpForNext = getXpForNextLevel(user.level);
  const xpProgress = Math.round(((user.xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100);
  const enrolledCourses = DEMO_COURSES.filter((c) => STUDENT_ENROLLED_IDS.includes(c.id));
  const myCreatedCourses = DEMO_COURSES.filter(c => c.instructorId === user.id);
  
  const achievements = user.role === "TEACHER" ? TEACHER_ACHIEVEMENTS : DEMO_ACHIEVEMENTS;
  const earnedAchievements = achievements.filter((a) => a.earned);

  const stats = user.role === "TEACHER" ? [
    { label: "Courses", value: myCreatedCourses.length, suffix: "", icon: BookOpen, color: "text-primary" },
    { label: "Students", value: myCreatedCourses.reduce((acc, c) => acc + c.enrolled, 0).toLocaleString(), suffix: "", icon: Orbit, color: "text-orange-500" },
    { 
      label: "Top Course", 
      value: myCreatedCourses.length > 0 ? [...myCreatedCourses].sort((a,b) => b.enrolled - a.enrolled)[0].enrolled : 0, 
      suffix: " enr.", 
      icon: Trophy, 
      color: "text-amber-500" 
    },
  ] : [
    { label: "Current Streak", value: user.streak, suffix: "d", icon: Flame, color: "text-orange-500" },
    { label: "Highest Streak", value: user.streak + 5, suffix: "d", icon: Trophy, color: "text-amber-500" },
    { label: "Total XP", value: (user.xp / 1000).toFixed(1), suffix: "k", icon: Zap, color: "text-primary" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden brand-gradient rounded-[2rem] p-8 text-white shadow-xl shadow-pink-500/20">
        <div className="relative z-10 flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-extrabold border-2 border-white/30 shrink-0 shadow-lg">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-white/80 text-xs">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user.email}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.city}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                Joined {new Date(user.joinedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                      <Orbit className="w-5 h-5 text-blue-500" /> {user.role.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* XP progress - hide for Admin */}
        {user.role !== "ADMIN" && (
          <div className="relative z-10 mt-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/70 font-medium">Level {user.level}</span>
              <span className="text-white/70">{user.xp.toLocaleString()} / {xpForNext.toLocaleString()} XP</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-white rounded-full"
              />
            </div>
            <p className="text-[10px] text-white/60 mt-1">{xpForNext - user.xp} XP to Level {user.level + 1}</p>
          </div>
        )}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full bg-white/5" />
      </motion.div>

      {/* Stats row - hide for Admin */}
      {user.role !== "ADMIN" && (
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <p className="text-xl font-extrabold text-foreground">{stat.value}<span className="text-xs text-muted-foreground ml-1">{stat.suffix}</span></p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Enrolled courses - show for Student */}
      {user.role === "STUDENT" && enrolledCourses.length > 0 && (
        <div>
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> My Courses
          </h2>
          <div className="flex flex-col gap-2">
            {enrolledCourses.slice(0, 4).map((course, i) => (
              <motion.div key={course.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-pink-500/20">
                  <BookOpen className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                  <p className="text-xs text-muted-foreground">{course.progress}% complete</p>
                </div>
                <Link href={`/courses/${course.id}`}>
                  <motion.button whileHover={{ scale: 1.05 }} className="text-xs font-semibold text-primary hover:underline">
                    Continue
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* My Published Courses - show for Teacher */}
      {user.role === "TEACHER" && myCreatedCourses.length > 0 && (
         <div>
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Published Courses
          </h2>
          <div className="flex flex-col gap-2">
            {myCreatedCourses.slice(0, 4).map((course, i) => (
              <motion.div key={course.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-pink-500/20">
                  <BookOpen className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                  <p className="text-xs text-muted-foreground">{course.enrolled} students enrolled</p>
                </div>
                <Link href={`/dashboard/teacher/courses/edit/${course.id}`}>
                  <motion.button whileHover={{ scale: 1.05 }} className="text-xs font-semibold text-primary hover:underline">
                    Edit Course
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements - hide for Admin */}
      {user.role !== "ADMIN" && (
        <div>
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> 
            {user.role === "TEACHER" ? "Teaching Achievements" : "Learning Achievements"} ({earnedAchievements.length}/{achievements.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {achievements.map((a, i) => {
              const Icon = ACH_ICONS[a.icon] || Star;
              return (
                <motion.div key={a.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  whileHover={a.earned ? { y: -2 } : {}}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center ${
                    a.earned
                      ? "border-pink-200 bg-pink-50/50 dark:bg-pink-900/10"
                      : "border-border bg-muted/20 opacity-40 grayscale"
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.earned ? "brand-gradient shadow-lg shadow-pink-500/20" : "bg-muted"}`}>
                    {a.earned ? <Icon className="w-5 h-5 text-white" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <p className="text-[11px] font-semibold text-foreground leading-tight">{a.title}</p>
                  {a.earned && <p className="text-[10px] font-bold text-primary">+{a.xpBonus} XP</p>}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
