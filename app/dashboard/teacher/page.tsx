"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCourses } from "@/lib/course-context";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  DEMO_COURSES, TEACHER_STUDENT_DATA, DEMO_NOTIFICATIONS, DEMO_LESSONS,
  type StudentPerformance, type DemoCourse
} from "@/lib/demo-data";
import {
  Plus, Edit, Trash2, MessageSquare, Zap, Flame, Star, BookOpen, Users, TrendingUp, BarChart3, CheckCircle2, AlertCircle, Orbit, ArrowRight
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
  const { courses, addCourse, updateCourse, deleteCourse } = useCourses();

  if (!user) {
    return null;
  }
  const searchParams = useSearchParams();
  const tabParam = typeof window !== "undefined"
  ? (searchParams.get("tab") as "overview" | "students" | "courses" | null) : null;
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "courses">(tabParam ?? "overview");
  const [feedbackStudent, setFeedbackStudent] = useState<StudentPerformance | null>(null);

  // Sync tab when URL changes (e.g. from sidebar click)
  useEffect(() => {
    if (tabParam && ["overview", "students", "courses"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const myCourses = courses.filter((c) => c.instructorId === user.id);
  const myCourseTitles = myCourses.map(c => c.title);
  
  // Filter students based on teacher's courses and sync with live session progress
  const myStudents = TEACHER_STUDENT_DATA.filter(s => myCourseTitles.includes(s.course)).map(student => {
    // 1. Identify Course ID from student.course title
    const courseObj = courses.find(c => student.course.includes(c.title.split(" – ")[1] || c.title));
    const courseId = courseObj?.id;

    // 2. Check for real-time progress of this student (Arjun simulation)
    if (student.name === "Arjun Subramanian" && typeof window !== "undefined") {
      const saved = localStorage.getItem("intellixlearn_user_progress");
      if (saved && courseId) {
        const completedIdsArr = JSON.parse(saved); // It's an array [1, 2, 3...]
        if (Array.isArray(completedIdsArr)) {
          // Get all lessons for this course
          const courseLessons = DEMO_LESSONS.filter(l => l.courseId === courseId);
          if (courseLessons.length > 0) {
            const completedInCourse = courseLessons.filter(l => completedIdsArr.includes(l.id)).length;
            const liveProgress = Math.round((completedInCourse / courseLessons.length) * 100);
            return { ...student, progress: liveProgress };
          }
        }
      }
    }
    return student;
  });
  
  const totalStudents = myStudents.length;
  const avgProgress = totalStudents > 0 ? Math.round(myStudents.reduce((s, st) => s + st.progress, 0) / totalStudents) : 0;
  const avgQuiz = totalStudents > 0 ? Math.round(myStudents.reduce((s, st) => s + st.quizAvg, 0) / totalStudents) : 0;
  const atRisk = myStudents.filter((s) => s.progress < 30 || s.quizAvg < 60);

  const sendFeedback = (student: StudentPerformance) => {
    toast.success(`Feedback sent to ${student.name}!`, { description: "They will be notified immediately." });
    setFeedbackStudent(null);
  };

  const handleDeleteCourse = (id: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      deleteCourse(id);
      toast.success("Course deleted successfully!");
    }
  };

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "students", label: `Students` },
    { id: "courses", label: "My Courses" },
  ] as const;

  return (
    <div className="flex flex-col gap-6 p-1 sm:p-2 transition-colors duration-300">
      {/* Welcome header */}
      <motion.div {...FADE_UP} className="relative overflow-hidden brand-gradient rounded-[2rem] p-8 text-white shadow-xl shadow-pink-500/20">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Welcome back,</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-0.5">{user?.name}</h1>
            <p className="text-white/80 text-sm mt-1">{user?.city} · Educator · Level {user.level}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-center shrink-0">
            <p className="text-xl font-extrabold">{user.streak}</p>
            <p className="text-xs text-white/70 flex items-center gap-1 justify-center"><Flame className="w-3 h-3 text-orange-300" /> Streak</p>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full bg-white/5" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "My Courses", value: myCourses.length, icon: BookOpen, color: "from-pink-500 to-rose-600" },
          { label: "Total Students", value: totalStudents, icon: Users, color: "from-blue-500 to-cyan-500" },
          { label: "Avg Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "from-emerald-400 to-green-500" },
          { label: "Avg Quiz Score", value: `${avgQuiz}%`, icon: Star, color: "from-amber-400 to-orange-500" },
        ].map((stat, i) => (
          <motion.div key={stat.label} {...stagger(i)}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-xl hover:shadow-pink-500/5 transition-all">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
              <stat.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* At-risk alert */}
      {atRisk.length > 0 && (
        <motion.div {...FADE_UP}
          className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              {atRisk.length} student{atRisk.length > 1 ? "s" : ""} need attention
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
              {atRisk.map((s) => s.name.split(" ")[0]).join(", ")} — low progress or quiz scores.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("students")}
            className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline shrink-0 flex items-center gap-1">
            View <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="teacher-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 brand-gradient rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-4">
          {/* Performance chart */}
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Teacher Performance Overview
            </h3>
            <div className="flex flex-col gap-3">
              {Object.values(myStudents.reduce((acc, st) => {
                if (!acc[st.name]) {
                  acc[st.name] = { ...st, count: 1 };
                } else {
                  acc[st.name].progress += st.progress;
                  acc[st.name].quizAvg += st.quizAvg;
                  acc[st.name].count += 1;
                }
                return acc;
              }, {} as Record<string, StudentPerformance & { count: number }>)).map((student, i) => {
                const avgProgress = Math.round(student.progress / student.count);
                const avgQuiz = Math.round(student.quizAvg / student.count);
                return (
                  <div key={student.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                      {student.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-foreground truncate">{student.name.split(" ")[0]}</span>
                        <span className="text-xs font-bold text-foreground shrink-0">{avgProgress}%</span>
                      </div>
                      <ProgressBar value={avgProgress} />
                    </div>
                    <div className={`text-xs font-bold w-10 text-right shrink-0 ${
                      avgQuiz >= 80 ? "text-emerald-500" :
                      avgQuiz >= 60 ? "text-amber-500" : "text-rose-500"
                    }`}>
                      {avgQuiz}%
                    </div>
                  </div>
                );
              })}
            </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/10 dark:to-blue-900/10 border border-pink-200/40 dark:border-pink-700/20 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center shadow-md shadow-pink-500/20">
                <Orbit className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold text-primary">AI Teaching Insights</p>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                "Vikram Natarajan is your top performer — consider assigning advanced material.",
                "Deepa Sundaram has not logged in for 3 days. Send an encouragement message.",
                `Your course "${myCourses[0]?.title ?? "AI Fundamentals"}" has the highest engagement this week.`,
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

      {activeTab === "students" && (
        <div className="flex flex-col gap-3">
          {myStudents.map((student, i) => {
            const isAtRisk = student.progress < 30 || student.quizAvg < 60;
            return (
              <motion.div key={student.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all ${isAtRisk ? "border-amber-200 dark:border-amber-700/40" : "border-border"}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-pink-500/20">
                    {student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.city} · {student.course}</p>
                      </div>
                      {isAtRisk && (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Needs Help
                        </span>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-foreground">{student.progress}%</span>
                        </div>
                        <ProgressBar value={student.progress} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Quiz Avg</span>
                          <span className={`font-semibold ${student.quizAvg >= 80 ? "text-emerald-500" : student.quizAvg >= 60 ? "text-amber-500" : "text-rose-500"}`}>{student.quizAvg}%</span>
                        </div>
                        <ProgressBar value={student.quizAvg} color={student.quizAvg >= 80 ? "bg-gradient-to-r from-emerald-400 to-green-500" : student.quizAvg >= 60 ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-gradient-to-r from-rose-400 to-red-500"} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" />{student.streak}d</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" />{student.xp.toLocaleString()} XP</span>
                        <span className="text-muted-foreground/70">Last: {student.lastActive}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setFeedbackStudent(student)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Feedback
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {activeTab === "courses" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">Manage your content</h2>
            <Link href="/dashboard/teacher/courses/new">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="brand-gradient text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-pink-500/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Course
              </motion.button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myCourses.map((course, i) => (
            <motion.div key={course.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-pink-500/10 transition-all"
            >
              <div className="relative h-28 w-full overflow-hidden bg-muted">
                <img 
                  src={course.image || "/images/default-course.png"} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-bold text-xs text-white leading-tight line-clamp-1">{course.title}</h3>
                  <p className="text-white/70 text-[10px] mt-0.5">{course.subject}</p>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/30 rounded-xl p-2">
                    <p className="font-bold text-foreground text-sm">{course.lessons}</p>
                    <p className="text-[10px] text-muted-foreground">Lessons</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-2">
                    <p className="font-bold text-foreground text-sm">{course.enrolled}</p>
                    <p className="text-[10px] text-muted-foreground">Students</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-2">
                    <p className="font-bold text-foreground text-sm flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400" />{course.rating}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Rating</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/courses/${course.id}`} className="flex-1">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                      className="w-full brand-gradient text-white text-xs font-semibold py-2.5 rounded-xl shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> View
                    </motion.button>
                  </Link>
                  <Link href={`/dashboard/teacher/courses/edit/${course.id}`}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                      className="p-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl transition-colors">
                      <Edit className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      )}

      {/* Course Modal Removed and moved to separate page */}
      {/* Feedback modal */}
      {feedbackStudent && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setFeedbackStudent(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-pink-500/20">
                {feedbackStudent.avatar}
              </div>
              <div>
                <p className="font-bold text-foreground">{feedbackStudent.name}</p>
                <p className="text-xs text-muted-foreground">{feedbackStudent.city}</p>
              </div>
            </div>
            <textarea
              rows={4}
              defaultValue={`Hi ${feedbackStudent.name.split(" ")[0]}, keep up the great work! Focus on completing your pending lessons to improve your progress.`}
              className="w-full p-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setFeedbackStudent(null)}
                className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => sendFeedback(feedbackStudent)}
                className="flex-1 brand-gradient text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/25">
                Send Feedback
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
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
