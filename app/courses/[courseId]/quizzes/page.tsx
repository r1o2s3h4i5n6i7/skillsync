"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCourses } from "@/lib/course-context";
import { STUDENT_ENROLLED_IDS } from "@/lib/demo-data";
import { 
  ArrowLeft, Orbit, Clock, Trophy, CheckCircle2, XCircle, GraduationCap,
  ChevronRight, Zap, RotateCcw, Star, Lock, X, Eye, BookOpen, TrendingUp, Plus, AlertCircle, Shield, Target
} from "lucide-react";
import Link from "next/link";

const DIFF_STYLES = {
  EASY: "from-emerald-400 to-green-500",
  MEDIUM: "from-amber-400 to-orange-400",
  HARD: "from-rose-400 to-red-500",
};

export default function QuizzesPage() {
  const { user } = useAuth();
  const { getCourse, getCourseQuizzes, enrolledIds } = useCourses();
  const params = useParams();
  
  if (!user) return null;
  
  const courseId = Number(params.courseId);
  const course = getCourse(courseId);
  const quizzes = getCourseQuizzes(courseId);
  
  // Check enrollment for students
  const isEnrolled = user?.role === "STUDENT" ? enrolledIds.includes(courseId) : true;
  const canAccess = user?.role !== "STUDENT" || isEnrolled;

  const isInstructor = user?.role === "TEACHER" && course?.instructorId === user?.id;
  const isAdmin = user?.role === "ADMIN";
  const shouldHideStudentActions = isAdmin || isInstructor;

  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, { score: number, timeSpent: number, answers: (number|null)[] }>>({});

  useEffect(() => {
    if (!activeQuiz || showResult || isReviewing) return;
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz?.id, showResult, isReviewing]);

  const startQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowResult(false);
    setIsReviewing(false);
    setTimeSpent(0);
    setShowExplanation(false);
  };

  const reviewQuiz = (quiz: any) => {
    const result = quizResults[quiz.id];
    if (!result) return;
    setActiveQuiz(quiz);
    setAnswers(result.answers);
    setShowResult(true);
    setIsReviewing(true);
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setShowExplanation(false);

    if (currentQ + 1 >= activeQuiz.questions.length) {
      // calc score
      const correct = newAnswers.filter(
        (a, i) => a === activeQuiz.questions[i].correctIndex
      ).length;
      const pct = Math.round((correct / activeQuiz.questions.length) * 100);
      setQuizResults((prev) => ({ 
        ...prev, 
        [activeQuiz.id]: { score: pct, timeSpent, answers: newAnswers } 
      }));
      setShowResult(true);
      if (pct >= 80) {
        toast.success(`Quiz completed! Score: ${pct}% +${activeQuiz.xpReward} XP`, { description: "Excellent work!" });
      } else if (pct >= 50) {
        toast.info(`Quiz completed! Score: ${pct}%`, { description: "Good effort. Try again to improve!" });
      } else {
        toast.warning(`Quiz completed! Score: ${pct}%`, { description: "Review the material and try again." });
      }
    } else {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Course not found.</p>
        <Link href="/courses"><motion.button whileHover={{ scale: 1.02 }} className="brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Back</motion.button></Link>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-center">You must enroll in this course to access quizzes.</p>
        <Link href={`/courses/${courseId}`}><motion.button whileHover={{ scale: 1.02 }} className="brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Go to Course</motion.button></Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/courses/${courseId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to course
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold mb-1">Quizzes</h1>
          <p className="text-white/80 text-sm">{course.title} — Test your knowledge and earn XP</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="bg-white/15 rounded-xl px-3 py-1.5">
              <p className="text-xs text-white/70">{quizzes.length} quizzes available</p>
            </div>
            {!shouldHideStudentActions && (
              <div className="bg-white/15 rounded-xl px-3 py-1.5">
                <p className="text-xs text-white/70">{quizzes.filter((q) => quizResults[q.id] !== undefined).length} attempted</p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
      </motion.div>

      {/* Quiz list */}
      <div className="flex flex-col gap-3">
        {quizzes.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Orbit className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="font-semibold text-foreground">No quizzes yet</p>
            <p className="text-sm text-muted-foreground">Check back soon!</p>
          </div>
        ) : (
          quizzes.map((quiz, i) => {
            const result = quizResults[quiz.id];
            const attempted = !!result;
            const score = result?.score;
            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:shadow-pink-500/5 transition-all"
              >
                <div className={`h-1 bg-gradient-to-r ${DIFF_STYLES[quiz.difficulty]}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm">{quiz.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className={`font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${DIFF_STYLES[quiz.difficulty]} text-white text-[10px]`}>
                          {quiz.difficulty}
                        </span>
                        <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{quiz.questions.length} questions</span>
                        <span className="flex items-center gap-1 text-primary font-semibold"><Zap className="w-3.5 h-3.5" />+{quiz.xpReward} XP</span>
                      </div>
                    </div>
                    {attempted && (
                      <div className="text-center shrink-0">
                        <div className={`text-2xl font-extrabold ${score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500"}`}>
                          {score}%
                        </div>
                        <p className="text-[10px] text-muted-foreground">Best score</p>
                      </div>
                    )}
                  </div>

                  {!shouldHideStudentActions && (
                    <div className="flex gap-2 mt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => startQuiz(quiz)}
                        className="flex-1 brand-gradient text-white text-xs font-semibold py-2.5 rounded-xl shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5"
                      >
                        {attempted ? <><RotateCcw className="w-3.5 h-3.5" /> Retake</> : <><GraduationCap className="w-3.5 h-3.5" /> Start Quiz</>}
                      </motion.button>
                      {attempted && (
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => reviewQuiz(quiz)}
                          className="flex-1 bg-primary/10 text-primary text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {activeQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
            >
              {showResult ? (
                // Results screen
                <ResultsScreen
                  quiz={activeQuiz}
                  result={quizResults[activeQuiz.id] || { score: 0, timeSpent: 0, answers: [] }}
                  isReview={isReviewing}
                  onRetake={() => startQuiz(activeQuiz)}
                  onClose={() => setActiveQuiz(null)}
                />
              ) : (
                // Question screen
                <>
                  {/* Quiz header */}
                  <div className="brand-gradient p-4 text-white shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-white/70 font-medium">{activeQuiz.title}</p>
                        <p className="text-sm font-bold">Question {currentQ + 1} of {activeQuiz.questions.length}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-xl text-sm font-bold">
                          <Orbit className="w-4 h-4" />
                          {formatTime(timeSpent)}
                        </div>
                        <button 
                          onClick={() => setActiveQuiz(null)}
                          className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Progress dots */}
                    <div className="flex gap-1">
                      {(activeQuiz.questions || []).map((_: any, i: number) => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < currentQ ? "bg-white" : i === currentQ ? "bg-white/70" : "bg-white/25"}`} />
                      ))}
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 p-5">
                    <QuestionView
                      question={activeQuiz.questions[currentQ]}
                      selected={selected}
                      onSelect={handleSelect}
                      showExplanation={showExplanation}
                    />
                  </div>

                  <div className="p-4 border-t border-border shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={nextQuestion}
                      disabled={selected === null}
                      className="w-full brand-gradient text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/25 disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {currentQ + 1 >= activeQuiz.questions.length ? "Finish Quiz" : "Next Question"}
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionView({
  question, selected, onSelect, showExplanation
}: {
  question: any;
  selected: number | null;
  onSelect: (i: number) => void;
  showExplanation: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-semibold text-foreground leading-relaxed">{question.text}</p>
      <div className="flex flex-col gap-2.5">
        {(question.options || []).map((opt: string, i: number) => {
          const isSelected = selected === i;
          const isCorrect = selected !== null && i === question.correctIndex;
          const isWrong = isSelected && i !== question.correctIndex;
          return (
            <motion.button
              key={i}
              whileHover={selected === null ? { scale: 1.01 } : {}}
              whileTap={selected === null ? { scale: 0.99 } : {}}
              onClick={() => onSelect(i)}
              className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-3 ${
                isCorrect
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                  : isWrong
                  ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300"
                  : isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : selected !== null
                  ? "border-border bg-card text-muted-foreground"
                  : "border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-foreground"
              }`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                isCorrect ? "bg-emerald-400 text-white" :
                isWrong ? "bg-rose-400 text-white" :
                isSelected ? "brand-gradient text-white" :
                "bg-muted text-muted-foreground"
              }`}>
                {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : isWrong ? <XCircle className="w-4 h-4" /> : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-700/40 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                      <Orbit className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Explanation</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{question.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultsScreen({
  quiz, result, isReview, onRetake, onClose
}: {
  quiz: any;
  result: { score: number, timeSpent: number, answers: (number | null)[] };
  isReview: boolean;
  onRetake: () => void;
  onClose: () => void;
}) {
  const { score, timeSpent, answers } = result;
  const correct = answers.filter((a, i) => a === quiz.questions[i]?.correctIndex).length;
  const grade = score >= 80 ? { label: "Excellent!", color: "text-emerald-500", icon: Trophy } :
                score >= 60 ? { label: "Good Job!", color: "text-amber-500", icon: Star } :
                { label: "Keep Trying!", color: "text-rose-500", icon: RotateCcw };
  const GradeIcon = grade.icon;
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${((s || 0) % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col h-full">
      <div className="brand-gradient p-6 text-white text-center relative">
        {!isReview && <GradeIcon className="w-12 h-12 mx-auto mb-2 opacity-90" />}
        {isReview && <Eye className="w-12 h-12 mx-auto mb-2 opacity-90" />}
        <h3 className="text-2xl font-extrabold mb-1">{isReview ? "Quiz Review" : grade.label}</h3>
        <p className="text-white/80 text-sm">{quiz.title}</p>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex justify-around mb-6">
          <div className="text-center">
            <p className={`text-3xl font-extrabold ${grade.color}`}>{score}%</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Score</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-extrabold text-foreground">{correct}/{quiz.questions.length}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Correct</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-extrabold text-primary">{formatTime(timeSpent)}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Time</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {quiz.questions.map((q: any, i: number) => {
            const isCorrect = answers[i] === q.correctIndex;
            return (
              <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl border ${isCorrect ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10" : "border-rose-200 bg-rose-50 dark:bg-rose-900/10"}`}>
                {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground line-clamp-1">{q.text}</p>
                  {!isCorrect && <p className="text-[10px] text-muted-foreground mt-0.5">Correct: {q.options[q.correctIndex]}</p>}
                </div>
              </div>
            );
          })}
        </div>
        
        {!isReview && (
          <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-foreground">XP Gained</span>
            </div>
            <span className="text-lg font-extrabold text-primary">
              +{score >= 50 ? quiz.xpReward : Math.floor(quiz.xpReward * 0.3)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border flex gap-3 shrink-0">
        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
          Close
        </button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onRetake}
          className="flex-1 brand-gradient text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" /> Retake
        </motion.button>
      </div>
    </div>
  );
}

