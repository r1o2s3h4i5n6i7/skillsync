"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useCourses } from "@/lib/course-context";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  Plus, Save, ArrowLeft, BookOpen, Clock, 
  Sparkles, Orbit, Trash2, Edit2, Play, 
  CheckCircle2, AlertCircle, ChevronRight, X,
  Info, ClipboardList, ChevronUp, ChevronDown, ChevronLeft, Check
} from "lucide-react";
import Link from "next/link";
import AIGeneratorModal from "@/components/AIGeneratorModal";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";

const contentSchema = z.object({
  lessonContent: z.object({
    text: z.array(z.object({
      content: z.string(),
      reference_web: z.string(),
      animation: z.string()
    })),
    youtubeLinks: z.array(z.string()).optional(),
    referenceLinks: z.array(z.string()).optional(),
    animation: z.string()
  }).optional(),
  quiz: z.object({
    title: z.string(),
    difficulty: z.string(),
    timeLimit: z.number(),
    xpReward: z.number(),
    questions: z.array(z.object({
      text: z.string(),
      options: z.array(z.string()),
      correctIndex: z.number(),
      explanation: z.string()
    }))
  }).optional(),
  assignment: z.object({
    title: z.string(),
    description: z.string(),
    dueDate: z.string(),
    maxScore: z.number(),
    xpReward: z.number()
  }).optional()
});

type Tab = "info" | "lessons" | "quizzes" | "assignments";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params.courseId);
  const { getCourse, getCourseLessons, getCourseQuizzes, getCourseAssignments, updateCourse } = useCourses();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAIOpen, setIsAIOpen] = useState(false);
  
  // Expansion State
  const [expandedLessonIdx, setExpandedLessonIdx] = useState<number | null>(null);
  const [expandedQuizIdx, setExpandedQuizIdx] = useState<number | null>(null);
  const [expandedAssignmentIdx, setExpandedAssignmentIdx] = useState<number | null>(null);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<Record<number, number | null>>({});
  
  const generatingLessonIdxRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);
  const [generatingLessonIdx, setGeneratingLessonIdx] = useState<number | null>(null);

  // Auto-scroll ref
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  // AI generation state machine: tracks what was requested and the current streaming phase
  const [genConfig, setGenConfig] = useState<{ generateLesson: boolean; generateQuiz: boolean; generateAssignment: boolean } | null>(null);
  const [streamPhase, setStreamPhase] = useState<'lessons' | 'quizzes' | 'assignments' | null>(null);

  // Form State
  const [courseInfo, setCourseInfo] = useState({
    title: "",
    description: "",
    subject: "Programming",
    difficulty: "EASY" as "EASY" | "MEDIUM" | "HARD",
    duration: "10 hours",
    tags: "",
  });

  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  // Load Initial Data
  useEffect(() => {
    const course = getCourse(courseId);
    if (!course) {
      toast.error("Course not found");
      router.push("/dashboard/teacher?tab=courses");
      return;
    }

    setCourseInfo({
      title: course.title,
      description: course.description,
      subject: course.subject,
      difficulty: course.difficulty,
      duration: course.duration,
      tags: course.tags.join(", "),
    });

    setLessons(getCourseLessons(courseId).map(l => ({ 
      id: l.id, 
      title: l.title, 
      duration: l.duration, 
      xpReward: l.xpReward,
      content: l.content // Ensure content is loaded
    })));
    
    setQuizzes(getCourseQuizzes(courseId).map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty,
      timeLimit: q.timeLimit,
      xpReward: q.xpReward,
      questions: q.questions.map(question => ({
        id: question.id,
        text: question.text,
        options: [...question.options],
        correctIndex: question.correctIndex,
        explanation: question.explanation
      }))
    })));

    setAssignments(getCourseAssignments(courseId).map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate,
      maxScore: a.maxScore,
      xpReward: a.xpReward
    })));

    setIsLoading(false);
  }, [courseId, getCourse, getCourseLessons, getCourseQuizzes, getCourseAssignments, router]);

  // Handlers
  const handleAddLesson = () => {
    setLessons([...lessons, { title: "", duration: "15 min", xpReward: 50 }]);
    setExpandedLessonIdx(lessons.length);
  };
  const handleRemoveLesson = (index: number) => {
    setLessons(lessons.filter((_: any, i: number) => i !== index));
    if (expandedLessonIdx === index) setExpandedLessonIdx(null);
    else if (expandedLessonIdx !== null && expandedLessonIdx > index) setExpandedLessonIdx(expandedLessonIdx - 1);
  };

  const handleAddQuiz = () => {
    setQuizzes([...quizzes, { 
      title: "", 
      difficulty: "MEDIUM", 
      timeLimit: 600, 
      xpReward: 200, 
      questions: [{ text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }] 
    }]);
    setExpandedQuizIdx(quizzes.length);
  };
  const handleRemoveQuiz = (index: number) => {
    setQuizzes(quizzes.filter((_: any, i: number) => i !== index));
    if (expandedQuizIdx === index) setExpandedQuizIdx(null);
    else if (expandedQuizIdx !== null && expandedQuizIdx > index) setExpandedQuizIdx(expandedQuizIdx - 1);
  };

  const handleAddQuestion = (quizIndex: number) => {
    const newQuizzes = [...quizzes];
    newQuizzes[quizIndex].questions.push({ text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" });
    setQuizzes(newQuizzes);
    setExpandedQuestionIdx({ ...expandedQuestionIdx, [quizIndex]: newQuizzes[quizIndex].questions.length - 1 });
  };
  const handleRemoveQuestion = (quizIndex: number, qIndex: number) => {
    const newQuizzes = [...quizzes];
    newQuizzes[quizIndex].questions = newQuizzes[quizIndex].questions.filter((_: any, i: number) => i !== qIndex);
    setQuizzes(newQuizzes);
    if (expandedQuestionIdx[quizIndex] === qIndex) setExpandedQuestionIdx({ ...expandedQuestionIdx, [quizIndex]: null });
  };

  const handleAddAssignment = () => {
    setAssignments([...assignments, { title: "", description: "", dueDate: "", maxScore: 10, xpReward: 100 }]);
    setExpandedAssignmentIdx(assignments.length);
  };
  const handleRemoveAssignment = (index: number) => {
    setAssignments(assignments.filter((_: any, i: number) => i !== index));
    if (expandedAssignmentIdx === index) setExpandedAssignmentIdx(null);
    else if (expandedAssignmentIdx !== null && expandedAssignmentIdx > index) setExpandedAssignmentIdx(expandedAssignmentIdx - 1);
  };

  const { object, submit, isLoading: isGeneratingAI } = useObject({
    api: "/api/generate",
    schema: contentSchema,
    onFinish: ({ object }) => {
      const lessonIdx = generatingLessonIdxRef.current;
      if (lessonIdx === null) return;
      
      isTransitioningRef.current = true;
      const data = object;
      
      // Sequence 1: Lesson Content
      if (data?.lessonContent) {
        setLessons((prev) => {
          const newL = [...prev];
          newL[lessonIdx] = { ...newL[lessonIdx], content: data.lessonContent };
          return newL;
        });
      }

      // Sequence 2: Quiz
      if (data?.quiz) {
        setQuizzes((prev) => {
          const newQ = [...prev, data.quiz as any];
          setExpandedQuizIdx(newQ.length - 1);
          return newQ;
        });
      }

      // Sequence 3: Assignment
      if (data?.assignment) {
        setAssignments((prev) => {
          const newA = [...prev, data.assignment as any];
          setExpandedAssignmentIdx(newA.length - 1);
          return newA;
        });
      }

      // Provide a more descriptive success toast based on what was generated
      const parts = [];
      if (data?.lessonContent) parts.push("Lesson");
      if (data?.quiz) parts.push("Quiz");
      if (data?.assignment) parts.push("Assignment");
      
      const message = parts.length > 0 
        ? `Successfully generated ${parts.join(", ").replace(/, ([^,]*)$/, " & $1")}!`
        : "Successfully generated content!";

      // Use a small delay to ensure React state updates for quizzes/assignments 
      // are rendered before we clear the isGeneratingAI/generatingLessonIdx state
      setTimeout(() => {
        generatingLessonIdxRef.current = null;
        setGeneratingLessonIdx(null);
        isTransitioningRef.current = false;
        toast.success(message);
      }, 300);
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to generate content.");
      generatingLessonIdxRef.current = null;
      setGeneratingLessonIdx(null);
    }
  });

  useEffect(() => {
    if (!isGeneratingAI || !object || !genConfig || !streamPhase) return;

    // Fixed phase order regardless of AI output order: lessons → quizzes → assignments
    // Only advance when the CURRENT phase has started streaming AND next phase data appears.

    if (streamPhase === 'lessons') {
      const lessonStarted = !!object.lessonContent?.text?.length;
      if (genConfig.generateQuiz && lessonStarted && object.quiz) {
        setStreamPhase('quizzes');
        setActiveTab('quizzes');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (!genConfig.generateQuiz && genConfig.generateAssignment && lessonStarted && object.assignment) {
        setStreamPhase('assignments');
        setActiveTab('assignments');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (streamPhase === 'quizzes') {
      const quizStarted = !!(object.quiz?.questions?.length);
      if (genConfig.generateAssignment && quizStarted && object.assignment) {
        setStreamPhase('assignments');
        setActiveTab('assignments');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    // Auto-scroll to follow live streaming content using a dedicated anchor
    if (typeof window !== 'undefined' && isGeneratingAI && object) {
      // Use a small timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        if (scrollAnchorRef.current) {
          scrollAnchorRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end' 
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [object, isGeneratingAI, streamPhase, genConfig]);

  const handleAIGenerate = (lessonIdx: number, config: any) => {
    const targetLesson = lessons[lessonIdx];
    if (!targetLesson) {
      toast.error("Selected lesson not found. Please try again.");
      return;
    }
    const lessonTitle = targetLesson.title || `Lesson ${lessonIdx + 1}`;
    const { generateLesson, generateQuiz, generateAssignment, customPrompt } = config;
    const subject = courseInfo.subject || "General Education";

    // Determine the first tab to show based on what was requested (fixed priority)
    const firstPhase: 'lessons' | 'quizzes' | 'assignments' =
      generateLesson ? 'lessons' : generateQuiz ? 'quizzes' : 'assignments';

    // Clean up default untitled placeholders before AI adds the real content
    if (generateQuiz) {
      setQuizzes((prev) => prev.filter((q: any) => q.title?.trim() !== ''));
    }
    if (generateAssignment) {
      setAssignments((prev) => prev.filter((a: any) => a.title?.trim() !== ''));
    }

    // Store the generation config for the state machine
    setGenConfig({ generateLesson, generateQuiz, generateAssignment });
    setStreamPhase(firstPhase);

    generatingLessonIdxRef.current = lessonIdx;
    setGeneratingLessonIdx(lessonIdx);
    // Start on the first requested tab
    setActiveTab(firstPhase);
    setExpandedLessonIdx(lessonIdx);

    toast.info(`✨ Generating content for "${lessonTitle}"...`, {
      description: [
        generateLesson && 'Lessons',
        generateQuiz && 'Quizzes',
        generateAssignment && 'Assignments',
      ].filter(Boolean).join(' → ') + ' will stream live.',
    });

    submit({
      lessonTitle,
      subject,
      generateLesson,
      generateQuiz,
      generateAssignment,
      customPrompt,
    });
  };

  const handleSubmit = async () => {
    if (!courseInfo.title || !courseInfo.description) {
      toast.error("Please fill in basic course information.");
      setActiveTab("info");
      return;
    }

    setIsSubmitting(true);
    try {
      const { tags: rawTags, ...restInfo } = courseInfo;
      const payload: any = {
        ...restInfo,
        tags: rawTags.split(",").map(t => t.trim()).filter(Boolean),
        lessons,
        quizzes,
        assignments
      };

      updateCourse(courseId, payload);
      toast.success("Course updated successfully!");
      router.push("/dashboard/teacher?tab=courses");
    } catch (error) {
      toast.error("Failed to update course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "info", label: "General Info", icon: Info },
    { id: "lessons", label: "Lessons", icon: BookOpen },
    { id: "quizzes", label: "Quizzes", icon: Orbit },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
  ];

  return (
    <ProtectedRoute allowedRoles={["TEACHER", "ADMIN"]}>
      <div className="max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/teacher">
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Edit Course</h1>
              <p className="text-sm text-muted-foreground">Modify your premium IT learning experience</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="brand-gradient text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-pink-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Update Course"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-muted/50 p-1.5 rounded-2xl overflow-x-auto whitespace-nowrap scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-card text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`} />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm"
        >
          {/* TAB 1: INFO */}
          {activeTab === "info" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Master Cloud Architecture with AWS"
                    value={courseInfo.title}
                    onChange={(e) => setCourseInfo({ ...courseInfo, title: e.target.value })}
                    className="p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">Subject Area</label>
                  <select
                    value={courseInfo.subject}
                    onChange={(e) => setCourseInfo({ ...courseInfo, subject: e.target.value })}
                    className="p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    {["Programming", "Web Development", "Database", "AI", "Cloud", "Security", "DevOps", "Mobile"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">Introduction & Description</label>
                <textarea
                  placeholder="What will students learn in this course?"
                  rows={4}
                  value={courseInfo.description}
                  onChange={(e) => setCourseInfo({ ...courseInfo, description: e.target.value })}
                  className="p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">Difficulty Level</label>
                  <select
                    value={courseInfo.difficulty}
                    onChange={(e) => setCourseInfo({ ...courseInfo, difficulty: e.target.value as any })}
                    className="p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="EASY">Beginner (Easy)</option>
                    <option value="MEDIUM">Intermediate (Medium)</option>
                    <option value="HARD">Advanced (Hard)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">Estimated Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 hours"
                    value={courseInfo.duration}
                    onChange={(e) => setCourseInfo({ ...courseInfo, duration: e.target.value })}
                    className="p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. aws, cloud, infrastructure"
                    value={courseInfo.tags}
                    onChange={(e) => setCourseInfo({ ...courseInfo, tags: e.target.value })}
                    className="p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => setActiveTab("lessons")}
                  className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                >
                  Next: Course Content <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LESSONS */}
          {activeTab === "lessons" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xl text-foreground">Lessons Plan</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAIOpen(true)}
                    className="flex items-center gap-1.5 text-sm font-bold brand-gradient-text hover:opacity-80 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-pink-500" /> Auto-Generate
                  </button>
                  <button
                    onClick={handleAddLesson}
                    className="flex items-center gap-1.5 text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Lesson
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {lessons.map((lesson, idx) => {
                    const isGeneratingThisLesson = isGeneratingAI && generatingLessonIdx === idx;
                    const displayContent = isGeneratingThisLesson && object?.lessonContent ? object.lessonContent : lesson.content;

                    return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-muted/30 border border-border rounded-2xl overflow-hidden transition-all hover:bg-muted/50"
                    >
                      {/* Card Header */}
                      <div 
                        onClick={() => setExpandedLessonIdx(expandedLessonIdx === idx ? null : idx)}
                        className="p-4 flex items-center justify-between cursor-pointer group"
                      >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <span className={`font-bold transition-colors ${expandedLessonIdx === idx ? "text-primary" : "text-foreground"}`}>
                          {lesson.title || `Untitled Lesson ${idx + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveLesson(idx); }}
                          className="p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedLessonIdx === idx ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    <AnimatePresence>
                      {expandedLessonIdx === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 pt-2 border-t border-border/50">
                             <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="md:col-span-6 flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Lesson Title</label>
                                <input
                                  type="text"
                                  placeholder="Enter lesson title..."
                                  value={lesson.title}
                                  onChange={(e) => {
                                    const newLessons = [...lessons];
                                    newLessons[idx].title = e.target.value;
                                    setLessons(newLessons);
                                  }}
                                  className="w-full bg-card border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                />
                                <p className="text-[10px] uppercase tracking-wider font-bold text-primary">Interactive Experience</p>
                              </div>
                              <div className="md:col-span-3 flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Duration</label>
                                <input
                                  type="text"
                                  value={lesson.duration}
                                  onChange={(e) => {
                                    const newLessons = [...lessons];
                                    newLessons[idx].duration = e.target.value;
                                    setLessons(newLessons);
                                  }}
                                  className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                              </div>
                              <div className="md:col-span-3 flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">XP Reward</label>
                                <input
                                  type="number"
                                  value={lesson.xpReward}
                                  onChange={(e) => {
                                    const newLessons = [...lessons];
                                    newLessons[idx].xpReward = Number(e.target.value);
                                    setLessons(newLessons);
                                  }}
                                  className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                              </div>
                            </div>
                            <div className="mt-6 border-t border-border/50 pt-6">
                              <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" /> Lesson Reading Material
                                  </h3>
                                  {!displayContent && (
                                    <button
                                      onClick={() => {
                                        const newLessons = [...lessons];
                                        newLessons[idx].content = { text: [], youtubeLinks: [], referenceLinks: [], animation: "fade-in" };
                                        setLessons(newLessons);
                                      }}
                                      className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                      + Add Material Manually
                                    </button>
                                  )}
                                </div>

                                {displayContent && (
                                    <div className="flex flex-col gap-6 bg-muted/10 p-5 rounded-2xl border border-border/50">
                                      {/* Paragraphs */}
                                    <div className="flex flex-col gap-4">
                                      <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Paragraphs</label>
                                      <button
                                        onClick={() => {
                                          const newLessons = [...lessons];
                                          if (!newLessons[idx].content.text) newLessons[idx].content.text = [];
                                          newLessons[idx].content.text.push({ content: "", reference_web: "", animation: "fade-in" });
                                          setLessons(newLessons);
                                        }}
                                        className="text-xs font-bold text-primary flex items-center gap-1 hover:opacity-80 transition-all"
                                      >
                                        <Plus className="w-3 h-3" /> Add Paragraph
                                      </button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                      <AnimatePresence>
                                        {(displayContent.text || []).map((paragraph: any, pIdx: number) => (
                                          <motion.div
                                            key={`p-${idx}-${pIdx}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 relative group"
                                          >
                                            <button
                                              onClick={() => {
                                                const newLessons = [...lessons];
                                                newLessons[idx].content.text.splice(pIdx, 1);
                                                setLessons(newLessons);
                                              }}
                                              className="absolute top-2 right-2 p-1.5 text-rose-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 rounded-lg"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <textarea
                                              value={paragraph?.content || ""}
                                              onChange={(e) => {
                                                const newLessons = [...lessons];
                                                if (!newLessons[idx].content) newLessons[idx].content = { text: [], youtubeLinks: [], referenceLinks: [], animation: "fade-in" };
                                                newLessons[idx].content.text[pIdx].content = e.target.value;
                                                setLessons(newLessons);
                                              }}
                                              rows={3}
                                              className="w-full bg-transparent text-sm outline-none resize-none font-medium text-foreground placeholder-muted-foreground"
                                              placeholder="Enter lesson text paragraph..."
                                            />
                                            <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                                              <div className="flex-1 flex flex-col gap-1.5">
                                                <label className="text-[9px] font-bold text-muted-foreground uppercase">Reference Link</label>
                                                <input
                                                  type="text"
                                                  value={paragraph?.reference_web || ""}
                                                  onChange={(e) => {
                                                    const newLessons = [...lessons];
                                                    if (!newLessons[idx].content) newLessons[idx].content = { text: [], youtubeLinks: [], referenceLinks: [], animation: "fade-in" };
                                                    newLessons[idx].content.text[pIdx].reference_web = e.target.value;
                                                    setLessons(newLessons);
                                                  }}
                                                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                  placeholder="https://..."
                                                />
                                              </div>
                                            </div>
                                          </motion.div>
                                        ))}
                                      </AnimatePresence>
                                      {(!displayContent.text || displayContent.text.length === 0) && (
                                        <p className="text-xs text-muted-foreground italic text-center py-4 bg-muted/30 rounded-xl border border-dashed border-border">No paragraphs added yet.</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Media Links */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-3">
                                      <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">YouTube Links</label>
                                        <button
                                          onClick={() => {
                                            const newLessons = [...lessons];
                                            if (!newLessons[idx].content.youtubeLinks) newLessons[idx].content.youtubeLinks = [];
                                            newLessons[idx].content.youtubeLinks.push("");
                                            setLessons(newLessons);
                                          }}
                                          className="text-[10px] font-bold text-rose-500 hover:opacity-80 transition-all"
                                        >
                                          + Add Video
                                        </button>
                                      </div>
                                        <div className="flex flex-col gap-2">
                                          {(displayContent.youtubeLinks || []).map((link: string, lIdx: number) => (
                                            <div key={`yt-${idx}-${lIdx}`} className="flex items-center gap-2">
                                            <input
                                              type="text"
                                              value={link || ""}
                                              onChange={(e) => {
                                                const newLessons = [...lessons];
                                                if (!newLessons[idx].content) newLessons[idx].content = { text: [], youtubeLinks: [], referenceLinks: [], animation: "fade-in" };
                                                newLessons[idx].content.youtubeLinks[lIdx] = e.target.value;
                                                setLessons(newLessons);
                                              }}
                                              className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                                              placeholder="https://youtube.com/watch?v=..."
                                            />
                                            <button
                                              onClick={() => {
                                                const newLessons = [...lessons];
                                                newLessons[idx].content.youtubeLinks.splice(lIdx, 1);
                                                setLessons(newLessons);
                                              }}
                                              className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                      <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Resource Links</label>
                                        <button
                                          onClick={() => {
                                            const newLessons = [...lessons];
                                            if (!newLessons[idx].content.referenceLinks) newLessons[idx].content.referenceLinks = [];
                                            newLessons[idx].content.referenceLinks.push("");
                                            setLessons(newLessons);
                                          }}
                                          className="text-[10px] font-bold text-blue-500 hover:opacity-80 transition-all"
                                        >
                                          + Add Link
                                        </button>
                                      </div>
                                        <div className="flex flex-col gap-2">
                                          {(displayContent.referenceLinks || []).map((link: string, lrIdx: number) => (
                                            <div key={`ref-${idx}-${lrIdx}`} className="flex items-center gap-2">
                                            <input
                                              type="text"
                                              value={link || ""}
                                              onChange={(e) => {
                                                const newLessons = [...lessons];
                                                if (!newLessons[idx].content) newLessons[idx].content = { text: [], youtubeLinks: [], referenceLinks: [], animation: "fade-in" };
                                                newLessons[idx].content.referenceLinks[lrIdx] = e.target.value;
                                                setLessons(newLessons);
                                              }}
                                              className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                                              placeholder="https://..."
                                            />
                                            <button
                                              onClick={() => {
                                                const newLessons = [...lessons];
                                                newLessons[idx].content.referenceLinks.splice(lrIdx, 1);
                                                setLessons(newLessons);
                                              }}
                                              className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )})}
                </AnimatePresence>
              </div>

              <div className="flex justify-between mt-4">
                <button 
                  onClick={() => setActiveTab("info")}
                  className="flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button 
                  onClick={() => setActiveTab("quizzes")}
                  className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                >
                  Next: Assessments <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: QUIZZES */}
          {activeTab === "quizzes" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xl text-foreground">Interactive Quizzes</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAIOpen(true)}
                    className="flex items-center gap-1.5 text-sm font-bold brand-gradient-text hover:opacity-80 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-pink-500" /> Auto-Generate
                  </button>
                  <button
                    onClick={handleAddQuiz}
                    className="flex items-center gap-1.5 text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Quiz
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {[...quizzes, ...(isGeneratingAI && !isTransitioningRef.current && object?.quiz ? [{...object.quiz, isStreamed: true}] : [])].map((quiz: any, qIdx) => (
                  <div key={qIdx} className={`border ${quiz.isStreamed ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'} rounded-3xl overflow-hidden bg-muted/20 transition-all hover:bg-muted/30`}>
                    {/* Quiz Header */}
                    <div 
                      onClick={() => !quiz.isStreamed && setExpandedQuizIdx(expandedQuizIdx === qIdx ? null : qIdx)}
                      className="p-5 flex items-center justify-between cursor-pointer group bg-card/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white shrink-0 shadow-sm">
                          <Orbit className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className={`font-bold block transition-colors ${expandedQuizIdx === qIdx ? "text-primary" : "text-foreground"}`}>
                            {quiz.title || `Untitled Quiz ${qIdx + 1}`}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            {(quiz.questions || []).length} Questions • {quiz.xpReward || 0} XP
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         {!quiz.isStreamed && (
                           <button
                             onClick={(e) => { e.stopPropagation(); handleRemoveQuiz(qIdx); }}
                             className="p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         )}
                        {expandedQuizIdx === qIdx || quiz.isStreamed ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {(expandedQuizIdx === qIdx || quiz.isStreamed) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-6 border-t border-border/50 flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Quiz Title</label>
                                <input
                                  type="text"
                                  value={quiz.title || ""}
                                  readOnly={quiz.isStreamed}
                                  onChange={(e) => {
                                    if(quiz.isStreamed) return;
                                    const newQuizzes = [...quizzes];
                                    newQuizzes[qIdx].title = e.target.value;
                                    setQuizzes(newQuizzes);
                                  }}
                                  className="p-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                  placeholder="e.g. Cell Biology Mastery"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Time (s)</label>
                                  <input
                                    type="number"
                                    value={quiz.timeLimit || 0}
                                    readOnly={quiz.isStreamed}
                                    onChange={(e) => {
                                      if(quiz.isStreamed) return;
                                      const newQuizzes = [...quizzes];
                                      newQuizzes[qIdx].timeLimit = Number(e.target.value);
                                      setQuizzes(newQuizzes);
                                    }}
                                    className="p-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                  />
                                </div>
                                <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold text-muted-foreground uppercase ml-1">XP</label>
                                  <input
                                    type="number"
                                    value={quiz.xpReward || 0}
                                    readOnly={quiz.isStreamed}
                                    onChange={(e) => {
                                      if(quiz.isStreamed) return;
                                      const newQuizzes = [...quizzes];
                                      newQuizzes[qIdx].xpReward = Number(e.target.value);
                                      setQuizzes(newQuizzes);
                                    }}
                                    className="p-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                  />
                                </div>
                                <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Diff.</label>
                                  <select
                                    value={quiz.difficulty || "EASY"}
                                    disabled={quiz.isStreamed}
                                    onChange={(e) => {
                                      if(quiz.isStreamed) return;
                                      const newQuizzes = [...quizzes];
                                      newQuizzes[qIdx].difficulty = e.target.value as any;
                                      setQuizzes(newQuizzes);
                                    }}
                                    className="p-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                  >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Med</option>
                                    <option value="HARD">Hard</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                  Questions <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{(quiz.questions || []).length}</span>
                                </p>
                                {!quiz.isStreamed && (
                                  <button
                                    onClick={() => handleAddQuestion(qIdx)}
                                    className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                                  >
                                    <Plus className="w-3 h-3" /> Add Question
                                  </button>
                                )}
                              </div>

                              <div className="flex flex-col gap-3">
                                {(quiz.questions || []).map((q: any, idx: number) => (
                                  <div key={idx} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    {/* Question Header */}
                                    <div 
                                      onClick={() => !quiz.isStreamed && setExpandedQuestionIdx({ ...expandedQuestionIdx, [qIdx]: expandedQuestionIdx[qIdx] === idx ? null : idx })}
                                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                                          Q{idx + 1}
                                        </span>
                                        <span className="text-sm font-medium truncate max-w-[200px] md:max-w-md">
                                          {q.text || "Untitled Question"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {!quiz.isStreamed && (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleRemoveQuestion(qIdx, idx); }}
                                            className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-all"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        {expandedQuestionIdx[qIdx] === idx || quiz.isStreamed ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                      </div>
                                    </div>

                                    <AnimatePresence>
                                      {(expandedQuestionIdx[qIdx] === idx || quiz.isStreamed) && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <div className="p-4 border-t border-border/50 flex flex-col gap-4">
                                            <textarea
                                              value={q.text}
                                              onChange={(e) => {
                                                const newQuizzes = [...quizzes];
                                                newQuizzes[qIdx].questions[idx].text = e.target.value;
                                                setQuizzes(newQuizzes);
                                              }}
                                              rows={2}
                                              className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium"
                                              placeholder="What is the question?"
                                            />
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              {(q.options || []).map((opt: string, optIdx: number) => (
                                                <div key={optIdx} className="flex items-center gap-2 group">
                                                  <button 
                                                    onClick={() => {
                                                      const newQuizzes = [...quizzes];
                                                      newQuizzes[qIdx].questions[idx].correctIndex = optIdx;
                                                      setQuizzes(newQuizzes);
                                                    }}
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                                      q.correctIndex === optIdx ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"
                                                    }`}
                                                  >
                                                    {q.correctIndex === optIdx && <Check className="w-3 h-3 text-white" />}
                                                  </button>
                                                  <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => {
                                                      const newQuizzes = [...quizzes];
                                                      newQuizzes[qIdx].questions[idx].options[optIdx] = e.target.value;
                                                      setQuizzes(newQuizzes);
                                                    }}
                                                    className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs outline-none focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all"
                                                    placeholder={`Option ${optIdx + 1}`}
                                                  />
                                                </div>
                                              ))}
                                            </div>
                                            
                                            <div className="flex flex-col gap-1.5 pt-2 border-t border-border/30">
                                              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Explanation</label>
                                               <input
                                                 type="text"
                                                 value={q.explanation || ""}
                                                 onChange={(e) => {
                                                   if(quiz.isStreamed) return;
                                                   const newQuizzes = [...quizzes];
                                                   newQuizzes[qIdx].questions[idx].explanation = e.target.value;
                                                   setQuizzes(newQuizzes);
                                                 }}
                                                 readOnly={quiz.isStreamed}
                                                 className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                 placeholder="Why is this answer correct?"
                                               />
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-4">
                <button 
                  onClick={() => setActiveTab("lessons")}
                  className="flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button 
                  onClick={() => setActiveTab("assignments")}
                  className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                >
                  Next: Project Work <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ASSIGNMENTS */}
          {activeTab === "assignments" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xl text-foreground">Project-based Assignments</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAIOpen(true)}
                    className="flex items-center gap-1.5 text-sm font-bold brand-gradient-text hover:opacity-80 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-pink-500" /> Auto-Generate
                  </button>
                  <button
                    onClick={handleAddAssignment}
                    className="flex items-center gap-1.5 text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Assignment
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {[...assignments, ...(isGeneratingAI && !isTransitioningRef.current && object?.assignment ? [{...object.assignment, isStreamed: true}] : [])].map((assignment: any, idx) => (
                  <div key={idx} className={`bg-card border ${assignment.isStreamed ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'} rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group`}>
                    {/* Assignment Header */}
                    <div 
                      onClick={() => !assignment.isStreamed && setExpandedAssignmentIdx(expandedAssignmentIdx === idx ? null : idx)}
                      className="p-5 flex items-center justify-between cursor-pointer transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-sm shrink-0">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`font-bold block transition-colors ${expandedAssignmentIdx === idx ? "text-primary" : "text-foreground"}`}>
                            {assignment.title || `Untitled Assignment ${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            Project Work • {assignment.xpReward} XP
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!assignment.isStreamed && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveAssignment(idx); }}
                            className="p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        {expandedAssignmentIdx === idx || assignment.isStreamed ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {(expandedAssignmentIdx === idx || assignment.isStreamed) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-6 border-t border-border/50 flex flex-col gap-6 bg-muted/10">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Assignment Title</label>
                                <input
                                  type="text"
                                  value={assignment.title || ""}
                                  readOnly={assignment.isStreamed}
                                  onChange={(e) => {
                                    if(assignment.isStreamed) return;
                                    const newA = [...assignments];
                                    newA[idx].title = e.target.value;
                                    setAssignments(newA);
                                  }}
                                  className="font-bold text-lg bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                  placeholder="Assignment Title"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Description & Instructions</label>
                              <textarea
                                value={assignment.description || ""}
                                readOnly={assignment.isStreamed}
                                onChange={(e) => {
                                  if(assignment.isStreamed) return;
                                  const newA = [...assignments];
                                  newA[idx].description = e.target.value;
                                  setAssignments(newA);
                                }}
                                rows={3}
                                className="w-full p-4 bg-card border border-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                                placeholder="Detailed instructions for students..."
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Due Date</label>
                                <input
                                  type="date"
                                  value={assignment.dueDate || ""}
                                  readOnly={assignment.isStreamed}
                                  onChange={(e) => {
                                    if(assignment.isStreamed) return;
                                    const newA = [...assignments];
                                    newA[idx].dueDate = e.target.value;
                                    setAssignments(newA);
                                  }}
                                  className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Max Score</label>
                                <input
                                  type="number"
                                  value={assignment.maxScore || 0}
                                  readOnly={assignment.isStreamed}
                                  onChange={(e) => {
                                    if(assignment.isStreamed) return;
                                    const newA = [...assignments];
                                    newA[idx].maxScore = Number(e.target.value);
                                    setAssignments(newA);
                                  }}
                                  className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">XP Reward</label>
                                 <input
                                   type="number"
                                   value={assignment.xpReward || 0}
                                   readOnly={assignment.isStreamed}
                                   onChange={(e) => {
                                     if(assignment.isStreamed) return;
                                     const newA = [...assignments];
                                     newA[idx].xpReward = Number(e.target.value);
                                     setAssignments(newA);
                                   }}
                                   className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                 />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8 pt-4 border-t border-border">
                <button 
                  onClick={() => setActiveTab("quizzes")}
                  className="flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <div className="flex items-center gap-4">
                   <p className="text-xs text-muted-foreground italic hidden sm:block">Ready to update your course?</p>
                   <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="brand-gradient text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-pink-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? "Updating..." : "Finish & Update Course"}
                  </button>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollAnchorRef} className="h-4" />
        </motion.div>
      </div>

      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        lessons={lessons}
        subject={courseInfo.subject || "General Education"}
        onStartGeneration={handleAIGenerate}
      />
    </ProtectedRoute>
  );
}
