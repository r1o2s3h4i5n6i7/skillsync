"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
export const dynamic = "force-dynamic";
import { useAuth } from "@/lib/auth-context";
import { useCourses } from "@/lib/course-context";
import { Loader } from "@/components/Loader";
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Upload, XCircle, ChevronLeft, ChevronRight, Filter, Search, FileText } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

interface AssignmentItem {
  id: number;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  xpReward: number;
  status: "PENDING" | "SUBMITTED" | "GRADED";
  score?: number;
  courseTitle?: string;
  fileUrl?: string | null;
}

const STATUS_STYLES: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  GRADED: { color: "from-emerald-400 to-green-500", label: "Graded", icon: CheckCircle2 },
  SUBMITTED: { color: "from-blue-400 to-indigo-500", label: "Submitted", icon: Clock },
  PENDING: { color: "from-amber-400 to-orange-500", label: "Pending", icon: AlertCircle },
  EXPIRED: { color: "from-rose-400 to-red-600", label: "Expired", icon: XCircle },
};

export default function AssignmentsPage() {
  const { user } = useAuth();
  const { courses, enrolledIds, isLoading: coursesLoading } = useCourses();

  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters and Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(6);
  
  const uniqueCourses = Array.from(new Set(assignments.map(a => a.courseTitle || "Unknown")));

  // Fetch assignments using the new paginated API
  const fetchAssignmentsCount = useCallback(async () => {
    try {
      const res = await fetch("/api/student/assignments?limit=1000"); // for totals and course list
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments);
      }
    } catch {}
  }, []);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery,
        status: statusFilter,
        course: courseFilter
      });
      const res = await fetch(`/api/student/assignments?${query}`);
      if (res.ok) {
        const data = await res.json();
        // Since we are using server-side pagination for the main view
        // we'll update the assignments state which visibleAssignments uses
        // But wait, visibleAssignments currently slices the assignments array
        // I should just use the assignments returned from server directly.
        setAssignments(data.assignments);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, courseFilter, itemsPerPage]);

  useEffect(() => {
    if (user && !coursesLoading) {
      if (user.role === "ADMIN") {
         setIsLoading(false);
         return;
      }
      fetchAssignments();
    }
  }, [user, coursesLoading, fetchAssignments]);

  // For the unique course list
  useEffect(() => {
    if (user) fetchAssignmentsCount();
  }, [user, fetchAssignmentsCount]);

  const handleSubmit = async (assignmentId: number) => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    setSubmitting(assignmentId);
    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", "assignments");
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload file");

      // 2. Submit assignment
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: uploadData.url })
      });
      
      if (!res.ok) throw new Error("Failed to submit assignment");
      
      toast.success("Assignment submitted!", { description: "Your instructor will grade it soon." });
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, status: "SUBMITTED" } : a))
      );
      setShowUpload(null);
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to sumbit assignment");
    } finally {
      setSubmitting(null);
    }
  };

  if (!user) return null;

  if (isLoading || coursesLoading) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader size="lg" />
          <p className="text-sm text-muted-foreground font-medium">Loading assignments...</p>
        </div>
      </ProtectedRoute>
    );
  }

  const visibleAssignments = assignments;
  const expired = assignments.filter((a) => a.status === "PENDING" && new Date(a.dueDate) < new Date());
  const pending = assignments.filter((a) => a.status === "PENDING" && new Date(a.dueDate) >= new Date());
  const submitted = assignments.filter((a) => a.status === "SUBMITTED");
  const graded = assignments.filter((a) => a.status === "GRADED");

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="flex flex-col gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-extrabold mb-1">Assignments</h1>
            <p className="text-white/80 text-sm">Track and submit your assignments</p>
            <div className="mt-4 grid grid-cols-4 gap-2 md:gap-4">
              {[
                { label: "Pending", count: pending.length, color: "text-amber-200" },
                { label: "Expired", count: expired.length, color: "text-rose-200" },
                { label: "Submitted", count: submitted.length, color: "text-blue-200" },
                { label: "Graded", count: graded.length, color: "text-emerald-200" },
              ].map((s) => (
                <div key={s.label} className="bg-white/15 rounded-xl p-2 md:p-3 text-center">
                  <p className={`text-xl md:text-2xl font-extrabold ${s.color}`}>{s.count}</p>
                  <p className="text-[10px] text-white/70 uppercase font-black">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
        </motion.div>

        {/* Filters Menu */}
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search assignments or courses..." 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
            <select 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none min-w-[120px]"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="EXPIRED">Expired</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="GRADED">Graded</option>
            </select>
            <select 
              value={courseFilter} 
              onChange={e => { setCourseFilter(e.target.value); setCurrentPage(1); }}
              className="bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none min-w-[140px]"
            >
              <option value="ALL">All Courses</option>
              {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {visibleAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-card border border-border rounded-3xl text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No assignments matched your filters.</p>
            </div>
          ) : (
            visibleAssignments.map((assignment, i) => {
              const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === "PENDING";
              // If it has a score but status is still SUBMITTED, treat as GRADED for UI consistency
              const effectiveStatus = (assignment.score !== undefined && assignment.status === "SUBMITTED") ? "GRADED" : assignment.status;
              const displayStatus = isOverdue ? "EXPIRED" : effectiveStatus;
              const s = STATUS_STYLES[displayStatus];
              const StatusIcon = s.icon;

              return (
                <motion.div key={assignment.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className={`h-1 bg-gradient-to-r ${s.color}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-sm">{assignment.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{assignment.description}</p>
                      </div>
                      <span className={`shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${s.color} text-white`}>
                        <StatusIcon className="w-3 h-3" /> {s.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive font-semibold" : ""}`}>
                        <Clock className="w-3.5 h-3.5" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {isOverdue && " (Overdue)"}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-3.5 h-3.5" />
                        Max: {assignment.maxScore} marks
                      </span>
                      {assignment.score !== undefined && (
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          Score: {assignment.score}/{assignment.maxScore}
                        </span>
                      )}
                    </div>

                      {assignment.status === "PENDING" && !isOverdue ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setShowUpload(assignment.id)}
                          className="mt-4 w-full brand-gradient text-white text-xs font-semibold py-2.5 rounded-xl shadow-md shadow-pink-500/20 flex items-center justify-center gap-2">
                          <Upload className="w-3.5 h-3.5" /> Submit Assignment
                        </motion.button>
                      ) : (
                        <div className="mt-4 flex flex-col gap-2">
                          <div className="p-3 rounded-xl bg-muted/30 border border-border text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">
                              {assignment.status !== "PENDING" ? "Submission Completed" : "Deadline Expired"}
                            </p>
                          </div>
                          {assignment.fileUrl && (
                            <Link href={assignment.fileUrl} target="_blank" className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-primary/20">
                              <FileText className="w-3.5 h-3.5" /> View My Submission
                            </Link>
                          )}
                        </div>
                      )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-2 mb-8">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <span className="font-bold text-sm px-2">Prev</span>
            </button>
            <span className="text-sm font-semibold text-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <span className="font-bold text-sm px-2">Next</span>
            </button>
          </div>
        )}

        {/* Upload dialog */}
        <AnimatePresence>
          {showUpload !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowUpload(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg text-foreground">Submit Assignment</h3>
                  <button onClick={() => setShowUpload(null)}>
                    <XCircle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>

                <div 
                  className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center mb-5 hover:border-primary/60 transition-colors cursor-pointer bg-primary/5 relative"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                    }}
                  />
                  <Upload className="w-10 h-10 text-primary/40 mx-auto mb-3" />
                  <p className="font-semibold text-sm text-foreground mb-1">
                    {selectedFile ? selectedFile.name : "Drop files here or click to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                </div>

                <div className="bg-muted/30 rounded-xl p-3 mb-5">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Assignment: </span>
                    {assignments.find((a) => a.id === showUpload)?.title}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowUpload(null)}
                    className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    disabled={submitting === showUpload}
                    onClick={() => handleSubmit(showUpload!)}
                    className="flex-1 brand-gradient text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/25 disabled:opacity-70 flex items-center justify-center gap-2">
                    {submitting === showUpload ? (
                      <Loader size="sm" className="text-white border-white" />
                    ) : "Submit"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
