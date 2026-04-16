"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCourses } from "@/lib/course-context";
import { useAuth } from "@/lib/auth-context";
import { 
  BookOpen, Star, Clock, Globe, 
  Orbit, CheckCircle2, Play, Users, Sparkles,
  Award, BarChart3, ChevronRight, ClipboardList, Lock, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/Loader";

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { getCourse, getCourseLessons, getCourseQuizzes, getCourseAssignments, enrolledIds, enrollCourse, fetchCourseDetail, isLoading } = useCourses();
  const { user } = useAuth();
  const courseId = Number(params.courseId);
  const course = getCourse(courseId);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [issubmitting, setIsSubmitting] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
      }
    } finally {
      setReviewsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetail(courseId);
    fetchReviews();
  }, [courseId, fetchCourseDetail, fetchReviews]);

  const handleSubmitReview = async () => {
    if (!newComment.trim()) return toast.error("Please enter a comment.");
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });
      if (res.ok) {
        toast.success("Review submitted!");
        setNewComment("");
        fetchReviews();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to submit review.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const isInstructor = user?.role === "TEACHER" && course?.instructorId === user?.id;
  const isAdmin = user?.role === "ADMIN";
  const shouldHideStudentActions = isAdmin || isInstructor;

  const lessons = getCourseLessons(courseId);
  const quizzes = getCourseQuizzes(courseId);
  const assignments = getCourseAssignments(courseId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader size="lg" />
        <p className="text-sm text-muted-foreground font-medium">Loading course details...</p>
      </div>
    );
  }

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

  const isEnrolled = enrolledIds.includes(courseId);
  const completedLessons = lessons.filter((l) => l.completed).length;

  const handleEnroll = () => {
    enrollCourse(courseId);
    toast.success(`Enrolled in "${course.title}"!`, { description: "Start learning and earn XP." });
  };

  const DIFF_COLORS = { EASY: "from-emerald-400 to-green-500", MEDIUM: "from-amber-400 to-orange-400", HARD: "from-rose-400 to-red-500" };

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link href="/courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to courses
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="brand-gradient rounded-[2rem] p-6 sm:p-10 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${DIFF_COLORS[course.difficulty]} text-white`}>{course.difficulty}</span>
              <span className="text-[10px] font-semibold bg-white/20 px-2.5 py-1 rounded-full">{course.subject}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2">{course.title}</h1>
            <p className="text-white/80 text-sm leading-relaxed mb-4">{course.description}</p>
            <p className="text-sm font-medium text-white/90">By <span className="font-bold">{course.instructor}</span></p>
            <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{course.lessons} lessons</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" />{course.enrolled} students</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-300 text-amber-300" />{course.rating}</span>
            </div>
          </div>
          {!shouldHideStudentActions && (
            <div className="sm:w-56 shrink-0">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5">
                {isEnrolled ? (
                  <>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-white/70">Progress</span>
                        <span className="font-bold">{course.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-white rounded-full" />
                      </div>
                      <p className="text-xs text-white/70 mt-1">{completedLessons}/{lessons.length} lessons done</p>
                    </div>
                    <Link href={`/courses/${courseId}/lessons`}>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                        className="w-full bg-white text-pink-600 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl">
                        <Play className="w-4 h-4" />
                        {course.progress === 0 ? "Start Course" : "Continue Learning"}
                      </motion.button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-white text-sm font-semibold mb-3 text-center">Join {course.enrolled}+ learners</p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={handleEnroll}
                      className="w-full bg-white text-pink-600 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl">
                      <CheckCircle2 className="w-4 h-4" /> Enroll Free
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full bg-white/5" />
      </motion.div>

      {/* Quick nav */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Lessons", count: lessons.length, icon: BookOpen, href: `/courses/${courseId}/lessons`, color: "from-pink-500 to-rose-500" },
          { label: "Quizzes", count: quizzes.length, icon: Sparkles, href: `/courses/${courseId}/quizzes`, color: "from-blue-500 to-cyan-500" },
          { label: "Assignments", count: assignments.length, icon: ClipboardList, href: `/courses/${courseId}/assignments`, color: "from-rose-500 to-pink-500" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <motion.div whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}
              className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 text-center cursor-pointer shadow-sm hover:shadow-xl hover:shadow-pink-500/5 transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                <Orbit className="w-5 h-5 text-white" />
              </div>
              <p className="text-lg font-extrabold text-foreground">{item.count}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Lessons preview */}
      {lessons.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">Course Content</h2>
            <Link href={`/courses/${courseId}/lessons`} className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="flex flex-col gap-2">
            {lessons.slice(0, 5).map((lesson, i) => (
              <motion.div key={lesson.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-4 bg-card border border-border rounded-xl ${isEnrolled || shouldHideStudentActions ? "hover:bg-muted/40 cursor-pointer" : "opacity-60"} transition-colors`}
                onClick={() => (isEnrolled || shouldHideStudentActions) ? router.push(`/courses/${courseId}/lessons`) : toast.error("Enroll in the course first!")}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${lesson.completed ? "brand-gradient" : isEnrolled ? "bg-primary/10" : "bg-muted"}`}>
                  {lesson.completed ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                  ) : isEnrolled ? (
                    <Play className="w-4 h-4 text-primary" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lesson.type === "INTERACTIVE" ? "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" :
                      lesson.type === "TEXT" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-muted text-muted-foreground"
                    }`}>{lesson.type}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">+{lesson.xpReward} XP</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {/* Community Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 pb-10">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm h-full flex flex-col">
            <h3 className="text-xl font-black text-foreground mb-4">Leave a Review</h3>
            {isEnrolled ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">How was your learning experience?</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button key={star} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setNewRating(star)} className="focus:outline-none">
                      <Star className={`w-6 h-6 ${newRating >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </motion.button>
                  ))}
                </div>
                <textarea
                  placeholder="Share your feedback with the community..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full h-32 bg-muted/40 border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitReview}
                  disabled={issubmitting}
                  className="w-full brand-gradient text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-pink-500/20 disabled:opacity-50"
                >
                  {issubmitting ? "Submitting..." : "Post Review"}
                </motion.button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Star className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Enroll in this course to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-foreground">Community Feedback</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary">{reviews.length} Reviews</span>
              </div>
            </div>

            {reviewsLoading ? (
              <div className="flex-1 flex justify-center items-center py-12"><Loader /></div>
            ) : reviews.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12 opacity-60">
                 <ClipboardList className="w-12 h-12 text-muted-foreground" />
                 <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((review, i) => (
                  <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex gap-4 p-5 bg-muted/20 rounded-2xl border border-border/50 relative group">
                    <img src={review.user.avatar || "/images/default-avatar.png"} alt={review.user.name} 
                         className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-black text-foreground">{review.user.name}</p>
                        <span className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${review.rating >= s ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
