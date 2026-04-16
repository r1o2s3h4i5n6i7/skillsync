"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCourses } from "@/lib/course-context";
import LessonContentEngine from "@/components/lesson-content-engine";
import {
  ArrowLeft, CheckCircle2, Zap, Clock, Lock, BookOpen, ChevronRight, Flame,
} from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/Loader";

export default function LessonDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const { 
    getCourse, getCourseLessons, enrolledIds, completedLessonIds, 
    completeLesson, isLoading, courseDetailsLoading, fetchCourseDetail 
  } = useCourses();

  const courseId = Number(params.courseId);
  const lessonId = Number(params.lessonId);

  useEffect(() => {
    const loadData = async () => {
      if (courseId) {
        await fetchCourseDetail(courseId);
        setHasAttemptedFetch(true);
      }
    };
    loadData();
  }, [courseId, fetchCourseDetail]);

  if (!user) return null;
  
  const course = getCourse(courseId);
  const lessons = getCourseLessons(courseId);
  const lesson = lessons.find((l) => l.id === lessonId);

  if (!lesson) return null;

  const isEnrolled = user.role === "STUDENT" ? enrolledIds.includes(courseId) : true;
  const isDone = completedLessonIds.includes(lessonId);
  const completedCount = lessons.filter(l => completedLessonIds.includes(l.id)).length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const currentIndex = lessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  if (isLoading || (courseDetailsLoading && lessons.length === 0) || (!hasAttemptedFetch && lessons.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader size="lg" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Synchronizing your progress...</p>
      </div>
    );
  }

  if (!course || (!lesson && hasAttemptedFetch)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-2">
          <BookOpen className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Lesson not found.</h2>
        <p className="text-muted-foreground text-sm max-w-xs text-center">We couldn't locate this lesson. It might have been moved or deleted.</p>
        <Link href={`/courses/${courseId}`}>
          <motion.button whileHover={{ scale: 1.05 }} className="brand-gradient text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-pink-500/20">
            Back to Course
          </motion.button>
        </Link>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-center">Enroll in this course to access lessons.</p>
        <Link href={`/courses/${courseId}`}>
          <motion.button whileHover={{ scale: 1.02 }} className="brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
            Go to Course
          </motion.button>
        </Link>
      </div>
    );
  }

  const handleComplete = async () => {
    if (isDone || isSubmitting) return;
    setIsSubmitting(true);
    const result = await completeLesson(lessonId);
    
    if (result) {
      toast.success(`+${lesson.xpReward} XP Earned! 🎉`, {
        description: `"${lesson.title}" marked as complete.`,
      });
      
      if (result.showStreakAnimation) {
        setShowStreak(true);
        setTimeout(() => setShowStreak(false), 4000);
      }

      // Auto-navigation after 1.5s
      setTimeout(() => {
        if (nextLesson) {
          router.push(`/courses/${courseId}/lessons/${nextLesson.id}`);
        } else {
          toast.success("Congratulations! You've finished all lessons in this course.");
          router.push(`/courses/${courseId}`);
        }
      }, 1500);
    }
    
    setIsSubmitting(false);
  };

  return (
    <>
      <AnimatePresence>
        {showStreak && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50, rotate: -10 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.5, y: -50, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="flex flex-col items-center justify-center"
            >
               <div className="relative">
                 <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-50 rounded-full" />
                 <Flame className="w-48 h-48 text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.8)] relative z-10" />
               </div>
               <motion.h2 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
                 className="text-4xl font-extrabold text-white mt-6 drop-shadow-lg"
               >
                 Daily Streak Started! 🔥
               </motion.h2>
               <motion.p 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.8 }}
                 className="text-xl text-orange-100 font-medium mt-2"
               >
                 Keep learning every day to maintain it.
               </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Back navigation */}
      <Link href={`/courses/${courseId}/lessons`}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to lessons
      </Link>

      {/* Course progress header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="brand-gradient rounded-2xl p-5 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-white/70 text-xs uppercase tracking-wide mb-0.5">{course.subject} · {course.title}</p>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white/90">
              Lesson {currentIndex + 1} of {lessons.length}
            </p>
            <span className="text-sm font-bold">{progressPct}% done</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-white rounded-full" />
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
      </motion.div>

      {/* Lesson title card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-foreground leading-tight">{lesson.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration}</span>
              <span className="flex items-center gap-1 text-primary font-bold"><Zap className="w-3 h-3" />+{lesson.xpReward} XP</span>
              <span className="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 px-2 py-0.5 rounded-full font-semibold">{lesson.type}</span>
            </div>
          </div>
          {isDone && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold">Completed</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* AI Content Engine */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        {lesson.content ? (
          <LessonContentEngine
            content={lesson.content}
            lessonId={lessonId}
            lessonTitle={lesson.title}
          />
        ) : (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-semibold text-foreground">Content coming soon</p>
            <p className="text-sm text-muted-foreground mt-1">This lesson is being prepared by your instructor.</p>
          </div>
        )}
      </motion.div>

      {/* Complete / Already Done button */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        {isDone ? (
          <div className="flex items-center justify-center gap-2 py-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">Lesson Completed! Well done 🎉</span>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleComplete}
            disabled={isSubmitting}
            className="w-full brand-gradient text-white font-bold py-4 rounded-2xl shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? "Processing..." : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Mark as Complete · Earn {lesson.xpReward} XP
              </>
            )}
          </motion.button>
        )}
      </motion.div>

      {/* Prev / Next navigation */}
      <div className="grid grid-cols-2 gap-3">
        {prevLesson ? (
          <Link href={`/courses/${courseId}/lessons/${prevLesson.id}`}>
            <motion.div whileHover={{ x: -3 }}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:bg-muted/30 transition-all cursor-pointer group">
              <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Previous</p>
                <p className="text-xs font-semibold text-foreground truncate">{prevLesson.title}</p>
              </div>
            </motion.div>
          </Link>
        ) : <div />}

        {nextLesson ? (
          <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
            <motion.div whileHover={{ x: 3 }}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:bg-muted/30 transition-all cursor-pointer group text-right justify-end">
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Next</p>
                <p className="text-xs font-semibold text-foreground truncate">{nextLesson.title}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
            </motion.div>
          </Link>
        ) : (
          <Link href={`/courses/${courseId}`}>
            <motion.div whileHover={{ x: 3 }}
              className="flex items-center gap-3 p-4 brand-gradient rounded-2xl shadow-md shadow-pink-500/20 cursor-pointer justify-end text-right">
              <div className="min-w-0">
                <p className="text-[10px] text-white/70 uppercase font-semibold">Finished!</p>
                <p className="text-xs font-bold text-white">Back to Course</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white shrink-0" />
            </motion.div>
          </Link>
        )}
      </div>
    </div>
    </>
  );
}
