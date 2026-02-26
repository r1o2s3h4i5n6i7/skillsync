"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { DEMO_ASSIGNMENTS, DEMO_COURSES, STUDENT_ENROLLED_IDS } from "@/lib/demo-data";
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Upload, XCircle } from "lucide-react";

const STATUS_STYLES: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  GRADED: { color: "from-emerald-400 to-green-500", label: "Graded", icon: CheckCircle2 },
  SUBMITTED: { color: "from-blue-400 to-indigo-500", label: "Submitted", icon: Clock },
  PENDING: { color: "from-amber-400 to-orange-500", label: "Pending", icon: AlertCircle },
};

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState(DEMO_ASSIGNMENTS);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState<number | null>(null);

  // Filter assignments based on user role
  let visibleAssignments = assignments;
  if (user?.role === "STUDENT") {
    // Students see only assignments for their enrolled courses
    const enrolledCourseIds = DEMO_COURSES.filter((c) => STUDENT_ENROLLED_IDS.includes(c.id)).map((c) => c.id);
    visibleAssignments = assignments.filter((a) => enrolledCourseIds.includes(a.courseId));
  } else if (user?.role === "TEACHER") {
    // Teachers see assignments for their courses
    const teacherCourseIds = DEMO_COURSES.filter((c) => c.instructorId === user.id).map((c) => c.id);
    visibleAssignments = assignments.filter((a) => teacherCourseIds.includes(a.courseId));
  }

  const handleSubmit = async (id: number) => {
    setSubmitting(id);
    await new Promise((r) => setTimeout(r, 1200));
    setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, status: "SUBMITTED" as const } : a));
    setSubmitting(null);
    setShowUpload(null);
    toast.success("Assignment submitted successfully!", { description: "Your instructor will review it soon." });
  };

  const pending = visibleAssignments.filter((a) => a.status === "PENDING");
  const submitted = visibleAssignments.filter((a) => a.status === "SUBMITTED");
  const graded = visibleAssignments.filter((a) => a.status === "GRADED");

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold mb-1">Assignments</h1>
          <p className="text-white/80 text-sm">Track and submit your assignments</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              { label: "Pending", count: pending.length, color: "text-amber-200" },
              { label: "Submitted", count: submitted.length, color: "text-blue-200" },
              { label: "Graded", count: graded.length, color: "text-emerald-200" },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
      </motion.div>

      <div className="flex flex-col gap-3">
        {visibleAssignments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No assignments found.</p>
          </div>
        ) : (
          visibleAssignments.map((assignment, i) => {
          const s = STATUS_STYLES[assignment.status];
          const StatusIcon = s.icon;
          const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === "PENDING";

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

                {assignment.status === "PENDING" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowUpload(assignment.id)}
                    className="mt-4 w-full brand-gradient text-white text-xs font-semibold py-2.5 rounded-xl shadow-md shadow-violet-500/20 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" /> Submit Assignment
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
          })
        )}
      </div>

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

              <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center mb-5 hover:border-primary/60 transition-colors cursor-pointer bg-primary/5">
                <Upload className="w-10 h-10 text-primary/40 mx-auto mb-3" />
                <p className="font-semibold text-sm text-foreground mb-1">Drop files here or click to upload</p>
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
                  className="flex-1 brand-gradient text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-violet-500/25 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting === showUpload ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  ) : "Submit"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
