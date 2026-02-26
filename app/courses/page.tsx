"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
export const dynamic = "force-dynamic";
import { useAuth } from "@/lib/auth-context";
import { DEMO_COURSES, STUDENT_ENROLLED_IDS } from "@/lib/demo-data";
import { BookOpen, Search, Star, Clock, Users, Play, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";

const SUBJECTS = ["All", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Environmental Science"];
const DIFFICULTY_COLORS = { EASY: "from-emerald-400 to-green-500", MEDIUM: "from-amber-400 to-orange-400", HARD: "from-rose-400 to-red-500" };

export default function CoursesPage() {
  const { user } = useAuth();
  if (!user) return null;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [enrolledIds, setEnrolledIds] = useState<number[]>(STUDENT_ENROLLED_IDS);

  // Get courses based on user role
  let coursesToShow = DEMO_COURSES;
  if (user?.role === "TEACHER") {
    // Teachers see only their courses
    coursesToShow = DEMO_COURSES.filter((c) => c.instructorId === user.id);
  }

  const filtered = coursesToShow.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.subject === filter;
    return matchSearch && matchFilter;
  });

  const handleEnroll = (id: number, title: string) => {
    if (!user) { toast.error("Please sign in to enroll."); return; }
    setEnrolledIds((prev) => [...prev, id]);
    toast.success(`Enrolled in "${title}"!`, { description: "Go to your dashboard to start." });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold mb-1">Course Catalog</h1>
          <p className="text-white/80 text-sm">Explore {DEMO_COURSES.length} STEM courses crafted for Tamil Nadu learners</p>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
      </motion.div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses, instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Subject filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SUBJECTS.map((s) => (
          <motion.button key={s} whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(s)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === s ? "brand-gradient text-white shadow-md shadow-violet-500/20" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}>
            {s}
          </motion.button>
        ))}
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course, i) => {
          const isEnrolled = enrolledIds.includes(course.id);
          return (
            <motion.div key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-violet-500/10 transition-all flex flex-col"
            >
              {/* Top accent */}
              <div className={`h-1.5 bg-gradient-to-r ${DIFFICULTY_COLORS[course.difficulty]}`} />

              {/* Colored header */}
              <div className="brand-gradient-soft p-4 flex items-center gap-3">
                <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{course.instructor}</p>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{course.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {course.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                  ))}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${DIFFICULTY_COLORS[course.difficulty]} text-white`}>
                    {course.difficulty}
                  </span>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessons}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrolled}</span>
                </div>

                <div className="flex items-center gap-1 mt-auto">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-3.5 h-3.5 ${j < Math.floor(course.rating) ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                  ))}
                  <span className="text-xs font-semibold text-foreground ml-1">{course.rating}</span>
                </div>

                {/* Action button */}
                {isEnrolled ? (
                  <Link href={`/courses/${course.id}`}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                      className="w-full brand-gradient text-white text-xs font-semibold py-2.5 rounded-xl shadow-md shadow-violet-500/20 flex items-center justify-center gap-1.5">
                      <Play className="w-3.5 h-3.5" /> Continue Learning
                    </motion.button>
                  </Link>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleEnroll(course.id, course.title)}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-primary/20 transition-all">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enroll Free
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-semibold text-foreground">No courses found</p>
          <p className="text-sm text-muted-foreground">Try a different search or filter</p>
        </div>
      )}
    </div>
  );
}
