"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  DEMO_COURSES, DEMO_LESSONS, STUDENT_ENROLLED_IDS, type DemoLesson
} from "@/lib/demo-data";
import {
  ArrowLeft, CheckCircle2, Play, FileText, Zap, Clock,
  Lock, ChevronRight, BookOpen, X, Sparkles
} from "lucide-react";
import Link from "next/link";

const TYPE_STYLES: Record<string, { bg: string; label: string }> = {
  VIDEO: { bg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", label: "Video" },
  INTERACTIVE: { bg: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400", label: "Interactive" },
  TEXT: { bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", label: "Reading" },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  VIDEO: Play,
  INTERACTIVE: Sparkles,
  TEXT: FileText,
};

export default function LessonsPage() {
  const { user } = useAuth();
  if (!user) return null;
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.courseId);
  const course = DEMO_COURSES.find((c) => c.id === courseId);
  const lessons = DEMO_LESSONS.filter((l) => l.courseId === courseId);
  
  // Check enrollment for students
  const isEnrolled = user?.role === "STUDENT" ? STUDENT_ENROLLED_IDS.includes(courseId) : true;
  const canAccess = user?.role !== "STUDENT" || isEnrolled;
  const [completed, setCompleted] = useState<number[]>(
    lessons.filter((l) => l.completed).map((l) => l.id)
  );
  const [activeLesson, setActiveLesson] = useState<DemoLesson | null>(null);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [watching, setWatching] = useState(false);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Course not found.</p>
        <Link href="/courses">
          <motion.button whileHover={{ scale: 1.02 }} className="brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-violet-500/20">
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

  const completedCount = completed.length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const openLesson = (lesson: DemoLesson) => {
    setActiveLesson(lesson);
    setLessonProgress(0);
    setWatching(false);
  };

  const startLesson = () => {
    setWatching(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setLessonProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setWatching(false);
        if (activeLesson && !completed.includes(activeLesson.id)) {
          setCompleted((prev) => [...prev, activeLesson.id]);
          toast.success(`Lesson completed! +${activeLesson.xpReward} XP earned`, {
            description: `"${activeLesson.title}" marked as done.`,
          });
        }
      }
    }, 60);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link href={`/courses/${courseId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to course
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
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
          lessons.map((lesson, i) => {
            const isDone = completed.includes(lesson.id);
            const TypeIcon = TYPE_ICONS[lesson.type] || Play;
            const typeStyle = TYPE_STYLES[lesson.type];
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 3 }}
                onClick={() => openLesson(lesson)}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl cursor-pointer hover:bg-muted/30 hover:shadow-md hover:shadow-violet-500/5 transition-all group"
              >
                {/* Status icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all ${
                  isDone ? "brand-gradient shadow-violet-500/25" : "bg-primary/10"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <TypeIcon className="w-4.5 h-4.5 text-primary" />
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
            );
          })
        )}
      </div>

      {/* Lesson viewer modal */}
      <AnimatePresence>
        {activeLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setActiveLesson(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="brand-gradient p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 mb-2 inline-block`}>
                      {TYPE_STYLES[activeLesson.type]?.label}
                    </span>
                    <h3 className="text-lg font-bold leading-snug">{activeLesson.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-white/70 text-xs">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activeLesson.duration}</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-300" />+{activeLesson.xpReward} XP</span>
                    </div>
                  </div>
                  <button onClick={() => setActiveLesson(null)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Simulated content area */}
                <div className="bg-muted/40 rounded-2xl p-6 mb-5 text-center min-h-[140px] flex flex-col items-center justify-center border border-border">
                  {activeLesson.type === "VIDEO" ? (
                    <>
                      <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-violet-500/25">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Video Lesson</p>
                      <p className="text-xs text-muted-foreground mt-1">{activeLesson.title}</p>
                    </>
                  ) : activeLesson.type === "INTERACTIVE" ? (
                    <>
                      <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-violet-500/25">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Interactive Activity</p>
                      <p className="text-xs text-muted-foreground mt-1">Hands-on learning experience</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-violet-500/25">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Reading Material</p>
                      <p className="text-xs text-muted-foreground mt-1">Detailed text-based content</p>
                    </>
                  )}
                </div>

                {/* Progress bar */}
                {watching && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{lessonProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${lessonProgress}%` }}
                        className="h-full brand-gradient rounded-full"
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                )}

                {completed.includes(activeLesson.id) ? (
                  <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold text-sm">Lesson Completed!</span>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={startLesson}
                    disabled={watching}
                    className="w-full brand-gradient text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {watching ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Learning in progress...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        {activeLesson.type === "VIDEO" ? "Watch Lesson" : activeLesson.type === "INTERACTIVE" ? "Start Activity" : "Read Lesson"}
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
