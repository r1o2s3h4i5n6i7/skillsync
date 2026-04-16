"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Loader } from "@/components/Loader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ClipboardList, CheckCircle2, AlertCircle, FileText, Download, Search, Filter } from "lucide-react";
import Link from "next/link";

interface TeacherSubmission {
  id: number;
  assignmentTitle: string;
  courseTitle: string;
  studentName: string;
  studentAvatar: string;
  status: "PENDING" | "SUBMITTED" | "GRADED";
  score: number | null;
  maxScore: number;
  fileUrl: string | null;
  submittedAt: string | null;
  dueDate: string;
}

export default function EvaluatePage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluatingId, setEvaluatingId] = useState<number | null>(null);
  const [scoreInput, setScoreInput] = useState<Record<number, string>>({});
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [evalPage, setEvalPage] = useState(1);
  const evalsPerPage = 5;
  
  const uniqueCourses = Array.from(new Set(submissions.map(s => s.courseTitle)));

  const filteredSubmissions = submissions.filter(s => {
    const matchSearch = s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       s.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" ? true : s.status === statusFilter;
    const matchCourse = courseFilter === "ALL" ? true : s.courseTitle === courseFilter;
    
    let matchDate = true;
    if ((startDate || endDate) && s.dueDate) {
      const dueTime = new Date(s.dueDate).getTime();
      if (startDate && dueTime < new Date(startDate).getTime()) matchDate = false;
      if (endDate && dueTime > new Date(endDate).setHours(23, 59, 59, 999)) matchDate = false;
    }
    
    return matchSearch && matchStatus && matchCourse && matchDate;
  });

  const totalEvalPages = Math.max(1, Math.ceil(filteredSubmissions.length / evalsPerPage));
  const currentEvalsList = filteredSubmissions.slice((evalPage - 1) * evalsPerPage, evalPage * evalsPerPage);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/assignments");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions.filter((s: TeacherSubmission) => s.status !== "PENDING")); // only show ones student has acted on, usually SUBMITTED or GRADED
      }
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchSubmissions();
  }, [user, fetchSubmissions]);

  const handleEvaluate = async (id: number, maxScore: number) => {
    const inputStr = scoreInput[id];
    if (!inputStr) {
      toast.error("Please enter a score");
      return;
    }
    const score = parseInt(inputStr, 10);
    if (isNaN(score) || score < 0 || score > maxScore) {
      toast.error(`Score must be between 0 and ${maxScore}`);
      return;
    }

    setEvaluatingId(id);
    try {
      const res = await fetch(`/api/submissions/${id}/evaluate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score })
      });

      if (res.ok) {
        toast.success("Assignment evaluated!", { description: "XP has been awarded to both you and the student." });
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: "GRADED", score } : s));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to evaluate");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setEvaluatingId(null);
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute allowedRoles={["TEACHER"]}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Evaluate Assignments</h1>
          <p className="text-muted-foreground text-sm">Review student submissions and award grades. Grading assignments algorithmically boosts your Teacher XP based on course popularity!</p>
        </div>

        {/* Filters Menu */}
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search student or assignment..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none min-w-[120px]"
            >
              <option value="ALL">All Status</option>
              <option value="SUBMITTED">Pending Grade</option>
              <option value="GRADED">Graded</option>
            </select>
            <select 
              value={courseFilter} 
              onChange={e => setCourseFilter(e.target.value)}
              className="bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none min-w-[140px]"
            >
              <option value="ALL">All Courses</option>
              {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input 
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setEvalPage(1); }}
              placeholder="Start Deadline"
              className="bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none w-[130px] sm:w-[140px]"
            />
            <input 
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setEvalPage(1); }}
              placeholder="End Deadline"
              className="bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none w-[130px] sm:w-[140px]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-4">
            <Loader size="lg" />
          </div>
        ) : currentEvalsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 bg-card border border-border rounded-3xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No submissions matched your filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4">
              {currentEvalsList.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       {/* Correct status: if score is set, it's graded */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white flex items-center gap-1 ${sub.status === "GRADED" || sub.score !== null ? "bg-emerald-500" : "bg-blue-500"}`}>
                        {(sub.status === "GRADED" || sub.score !== null) ? <CheckCircle2 className="w-3 h-3"/> : <AlertCircle className="w-3 h-3" />}
                        {(sub.status === "GRADED" || sub.score !== null) ? "GRADED" : sub.status}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">{sub.courseTitle}</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{sub.assignmentTitle}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Submitted by <span className="font-semibold text-foreground">{sub.studentName}</span></p>
                    
                    {sub.fileUrl ? (
                      <Link href={sub.fileUrl} target="_blank" className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4"/> View Submission <Download className="w-3.5 h-3.5 ml-1"/>
                      </Link>
                    ) : (
                      <p className="text-xs text-rose-500 font-bold mt-4 italic flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> No file provided
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-3 bg-muted/40 p-4 rounded-xl border border-border/50 shrink-0 sm:w-64">
                    {(sub.status === "GRADED" || sub.score !== null) ? (
                      <div className="text-center sm:text-right w-full">
                        <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wide">Score Awarded</p>
                        <p className="text-2xl font-black text-emerald-500">{sub.score} <span className="text-base text-muted-foreground font-medium">/ {sub.maxScore}</span></p>
                      </div>
                    ) : (
                      <div className="flex flex-col w-full gap-2">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Grade Submission (Max: {sub.maxScore})</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={sub.maxScore}
                            value={scoreInput[sub.id] || ""}
                            onChange={(e) => setScoreInput({ ...scoreInput, [sub.id]: e.target.value })}
                            placeholder="Score"
                            className="w-20 bg-background border border-input rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleEvaluate(sub.id, sub.maxScore)}
                            disabled={evaluatingId === sub.id}
                            className="flex-1 brand-gradient text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-pink-500/20 disabled:opacity-70"
                          >
                            {evaluatingId === sub.id ? "Saving..." : "Evaluate"}
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalEvalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4 mb-8">
                <button 
                  onClick={() => setEvalPage(p => Math.max(1, p - 1))}
                  disabled={evalPage === 1}
                  className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  <span className="font-bold text-sm px-2">Prev</span>
                </button>
                <span className="text-sm font-semibold text-foreground">
                  Page {evalPage} of {totalEvalPages}
                </span>
                <button 
                  onClick={() => setEvalPage(p => Math.min(totalEvalPages, p + 1))}
                  disabled={evalPage === totalEvalPages}
                  className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  <span className="font-bold text-sm px-2">Next</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
