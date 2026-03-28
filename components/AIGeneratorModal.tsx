"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {X, Orbit, BookOpen, CheckCircle2, AlertCircle, Loader2, Plus, Trash2, Edit, Save, Brain, ClipboardList, Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: any[];
  subject: string;
  onStartGeneration: (lessonIdx: number, config: { generateLesson: boolean, generateQuiz: boolean, generateAssignment: boolean, customPrompt: string }) => void;
}

export default function AIGeneratorModal({
  isOpen,
  onClose,
  lessons,
  subject,
  onStartGeneration
}: AIGeneratorModalProps) {
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [generateLesson, setGenerateLesson] = useState(true);
  const [generateQuiz, setGenerateQuiz] = useState(true);
  const [generateAssignment, setGenerateAssignment] = useState(true);
  const [customPrompt, setCustomPrompt] = useState("");

  const handleGenerate = () => {
    if (lessons.length === 0) {
      toast.error("Please create at least one lesson first to attach content to.");
      return;
    }
    if (!generateLesson && !generateQuiz && !generateAssignment) {
      toast.error("Please select at least one content type to generate.");
      return;
    } onStartGeneration(selectedLessonIdx, {
      generateLesson,
      generateQuiz,
      generateAssignment,
      customPrompt
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="brand-gradient p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Orbit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Course Generator</h2>
                <p className="text-sm text-white/80 font-medium">Powered by Google Gemini</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">

            {/* API Key Instructions */}
            {/* <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400">API Key Configuration</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Make sure you have added your Gemini API key in your <code className="bg-black/5 px-1 py-0.5 rounded">.env.local</code> file as <code className="bg-black/5 px-1 py-0.5 rounded text-blue-600 font-bold">GEMINI_API_KEY=your_key_here</code>. You can get a free key from Google AI Studio.
                </p>
              </div>
            </div> */}

            {/* Lesson Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Target Lesson
              </label>
              {lessons.length === 0 ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                  Please create at least one lesson first.
                </div>
              ) : (
                <select
                  value={selectedLessonIdx}
                  onChange={(e) => setSelectedLessonIdx(Number(e.target.value))}
                  className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                >
                  {lessons.map((lesson, idx) => (
                    <option key={idx} value={idx}>
                      {idx + 1}. {lesson.title || "Untitled Lesson"}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Content Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Generate Content Types
              </label>
              <div className="grid grid-cols-1 gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <label className={`relative flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all overflow-hidden ${generateLesson ? "bg-violet-500/5 border-violet-500/50 shadow-[0_4px_24px_-4px_rgba(139,92,246,0.2)]" : "bg-card border-border hover:bg-muted/50 hover:border-muted-foreground/30"}`}>
                    <input type="checkbox" className="hidden" checked={generateLesson} onChange={(e) => setGenerateLesson(e.target.checked)} />
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${generateLesson ? "brand-gradient text-white shadow-lg shadow-violet-500/30" : "bg-muted text-muted-foreground"}`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold transition-colors ${generateLesson ? "text-violet-600" : "text-foreground"}`}>Lesson Reading Content</span>
                      <span className="text-[11px] text-muted-foreground font-medium mt-0.5">Generate animated definitions and descriptive paragraphs</span>
                    </div>
                    {generateLesson && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-violet-500 rounded-l-full" />
                    )}
                  </label>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <label className={`relative flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all overflow-hidden ${generateQuiz ? "bg-blue-500/5 border-blue-500/50 shadow-[0_4px_24px_-4px_rgba(59,130,246,0.2)]" : "bg-card border-border hover:bg-muted/50 hover:border-muted-foreground/30"}`}>
                    <input type="checkbox" className="hidden" checked={generateQuiz} onChange={(e) => setGenerateQuiz(e.target.checked)} />
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${generateQuiz ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-muted text-muted-foreground"}`}>
                      <Orbit className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold transition-colors ${generateQuiz ? "text-blue-600" : "text-foreground"}`}>Interactive Quiz</span>
                      <span className="text-[11px] text-muted-foreground font-medium mt-0.5">Generate 3-5 multiple-choice questions with answers</span>
                    </div>
                    {generateQuiz && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-blue-500 rounded-l-full" />
                    )}
                  </label>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <label className={`relative flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all overflow-hidden ${generateAssignment ? "bg-amber-500/5 border-amber-500/50 shadow-[0_4px_24px_-4px_rgba(245,158,11,0.2)]" : "bg-card border-border hover:bg-muted/50 hover:border-muted-foreground/30"}`}>
                    <input type="checkbox" className="hidden" checked={generateAssignment} onChange={(e) => setGenerateAssignment(e.target.checked)} />
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${generateAssignment ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30" : "bg-muted text-muted-foreground"}`}>
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold transition-colors ${generateAssignment ? "text-amber-600" : "text-foreground"}`}>Project Assignment</span>
                      <span className="text-[11px] text-muted-foreground font-medium mt-0.5">Generate creative offline tasks and submissions</span>
                    </div>
                    {generateAssignment && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-amber-500 rounded-l-full" />
                    )}
                  </label>
                </motion.div>
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Custom Instructions (Optional)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Ensure the assignment is due next Friday and the quiz questions focus on real-world practical applications..."
                rows={2}
                className="w-full p-4 bg-muted/30 border border-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-border mt-2">
              <button
                onClick={handleGenerate}
                disabled={lessons.length === 0}
                className="brand-gradient text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Orbit className="w-5 h-5" /> Generate Magic
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
