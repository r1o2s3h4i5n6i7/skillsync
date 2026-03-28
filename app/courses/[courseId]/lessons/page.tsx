"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useCourses } from "@/lib/course-context";
import { 
  ArrowLeft, Orbit, Play, Clock, 
  CheckCircle2, Lock, ChevronRight, BookOpen, Zap
} from "lucide-react";
import Link from "next/link";

const TYPE_STYLES: Record<string, { bg: string; label: string }> = {
  VIDEO: { bg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", label: "Video" },
  INTERACTIVE: { bg: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400", label: "Interactive" },
  TEXT: { bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", label: "Reading" },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  VIDEO: Play,
  INTERACTIVE: Orbit,
  TEXT: BookOpen,
};

export default function LessonsPage() {
  const { user } = useAuth();
  const { getCourse, getCourseLessons, enrolledIds, completedLessonIds } = useCourses();
  const params = useParams();
  const router = useRouter();
  
  if (!user) return null;
  
  const courseId = Number(params.courseId);
  const course = getCourse(courseId);
  const lessons = getCourseLessons(courseId);
  
  const isEnrolled = user?.role === "STUDENT" ? enrolledIds.includes(courseId) : true;
  const canAccess = user?.role !== "STUDENT" || isEnrolled;

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Course not found.</p>
        <Link href="/courses">
          <motion.button whileHover={{ scale: 1.02 }} className="brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-pink-500/20">
            Back to Courses
          </motion.button>
        </Link>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-center">You must enroll in this course to access lessons.</p>
        <Link href={`/courses/${courseId}`}><motion.button whileHover={{ scale: 1.02 }} className="brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Go to Course</motion.button></Link>
      </div>
    );
  }

  const completedCount = lessons.filter((l: any) => completedLessonIds.includes(l.id)).length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link href={`/courses/${courseId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to course
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">{course.subject}</p>
          <h1 className="text-xl sm:text-2xl font-extrabold mb-1">{course.title}</h1>
          <p className="text-white/80 text-sm mb-4">Lessons — {completedCount} of {lessons.length} completed</p>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden max-w-xs">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <p className="text-white/60 text-xs mt-1">{progressPct}% complete</p>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
      </motion.div>

      {/* Lessons list */}
      <div className="flex flex-col gap-2">
        {lessons.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-foreground">No lessons available yet</p>
          </div>
        ) : (
          lessons.map((lesson: any, i: number) => {
            const isDone = completedLessonIds.includes(lesson.id);
            const TypeIcon = TYPE_ICONS[lesson.type || "TEXT"] || Play;
            const typeStyle = TYPE_STYLES[lesson.type || "TEXT"] || TYPE_STYLES["TEXT"];
            return (
              <Link key={lesson.id} href={`/courses/${courseId}/lessons/${lesson.id}`}>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 3 }}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl cursor-pointer hover:bg-muted/30 hover:shadow-md hover:shadow-pink-500/5 transition-all group"
              >
                {/* Status icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all ${
                  isDone ? "brand-gradient shadow-pink-500/25" : "bg-primary/10"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Orbit className="w-10 h-10 text-primary mx-auto mb-4 animate-pulse" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold truncate ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {i + 1}. {lesson.title}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${typeStyle.bg}`}>
                      {typeStyle.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration}</span>
                    <span className="flex items-center gap-1 text-primary font-semibold"><Zap className="w-3 h-3" />+{lesson.xpReward} XP</span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </motion.div>
              </Link>
            );
          })
        )}
      </div>

      {/* Overall completion status */}
      {progressPct === 100 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 py-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl text-center">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <p className="font-extrabold text-lg text-emerald-700 dark:text-emerald-400">Course Complete! 🎉</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-500">You've finished all lessons in this course.</p>
          <Link href={`/courses/${courseId}`}>
            <motion.button whileHover={{ scale: 1.02 }} className="brand-gradient text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-pink-500/20">
              Back to Course
            </motion.button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
