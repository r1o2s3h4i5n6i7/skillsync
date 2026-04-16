"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import type {
  CourseListItem,
  LessonListItem,
  QuizListItem,
  AssignmentListItem,
  CreateCoursePayload,
  UpdateCoursePayload,
  CoursesListResponse,
} from "@/types/course";
import type { EnrollmentData } from "@/types/progress";

interface CourseContextType {
  courses: CourseListItem[];
  lessons: LessonListItem[];
  quizzes: QuizListItem[];
  assignments: AssignmentListItem[];
  enrolledIds: number[];
  completedLessonIds: number[];
  isLoading: boolean;
  enrollCourse: (courseId: number) => Promise<void>;
  completeLesson: (lessonId: number) => Promise<any>;
  courseDetailsLoading: boolean;
  addCourse: (data: CreateCoursePayload) => Promise<void>;
  updateCourse: (id: number, data: UpdateCoursePayload) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
  getCourse: (id: number) => CourseListItem | undefined;
  getCourseLessons: (courseId: number) => LessonListItem[];
  getCourseQuizzes: (courseId: number) => QuizListItem[];
  getCourseAssignments: (courseId: number) => AssignmentListItem[];
  refreshCourses: () => Promise<void>;
  fetchCourseDetail: (courseId: number) => Promise<void>;
}

const CourseContext = createContext<CourseContextType>({
  courses: [],
  lessons: [],
  quizzes: [],
  assignments: [],
  enrolledIds: [],
  completedLessonIds: [],
  isLoading: true,
  enrollCourse: async () => {},
  completeLesson: async () => undefined,
  courseDetailsLoading: false,
  addCourse: async () => {},
  updateCourse: async () => {},
  deleteCourse: async () => {},
  getCourse: () => undefined,
  getCourseLessons: () => [],
  getCourseQuizzes: () => [],
  getCourseAssignments: () => [],
  refreshCourses: async () => {},
  fetchCourseDetail: async () => {},
});

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseDetailsLoading, setCourseDetailsLoading] = useState(false);

  // Fetch courses list from API
  const refreshCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data: CoursesListResponse = await res.json();
        setCourses(data.courses);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  }, []);

  // Fetch enrolled course IDs
  const fetchEnrollments = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/enrollments?userId=${user.id}`);
      if (res.ok) {
        const data: { enrollments: EnrollmentData[] } = await res.json();
        setEnrolledIds(data.enrollments.map((e) => e.courseId));
      }
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
    }
  }, [user]);

  // Initialize on mount / user change
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await refreshCourses();
      if (user) {
        await fetchEnrollments();
      }
      setIsLoading(false);
    };
    init();
  }, [user, refreshCourses, fetchEnrollments]);

  // Fetch full course detail (lessons, quizzes, assignments)
  const fetchCourseDetail = useCallback(async (courseId: number) => {
    setCourseDetailsLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data: {
          lessons: LessonListItem[];
          quizzes: QuizListItem[];
          assignments: AssignmentListItem[];
        } = await res.json();

        setLessons((prev) => {
          const filtered = prev.filter((l) => l.courseId !== courseId);
          return [...filtered, ...data.lessons];
        });
        setQuizzes((prev) => {
          const filtered = prev.filter((q) => q.courseId !== courseId);
          return [...filtered, ...data.quizzes];
        });
        setAssignments((prev) => {
          const filtered = prev.filter((a) => a.courseId !== courseId);
          return [...filtered, ...data.assignments];
        });
        setCompletedLessonIds((prev) => {
          const newIds = data.lessons.filter((l) => l.completed).map((l) => l.id);
          const otherIds = prev.filter(
            (id) => !data.lessons.some((l) => l.id === id)
          );
          return [...otherIds, ...newIds];
        });
      }
    } catch (err) {
      console.error("Failed to fetch course detail:", err);
      toast.error("Failed to load course details.");
    } finally {
      setCourseDetailsLoading(false);
    }
  }, []);

  const enrollCourse = async (courseId: number) => {
    if (enrolledIds.includes(courseId)) return;
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        setEnrolledIds((prev) => [...prev, courseId]);
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId ? { ...c, enrolled: c.enrolled + 1 } : c
          )
        );
        toast.success("Successfully enrolled!");
      } else {
        toast.error("Failed to enroll.");
      }
    } catch (err) {
      console.error("Failed to enroll:", err);
      toast.error("An error occurred during enrollment.");
    }
  };

  const completeLesson = async (lessonId: number) => {
    if (completedLessonIds.includes(lessonId)) return;
    try {
      const res = await fetch(`/api/progress/lessons/${lessonId}/complete`, {
        method: "POST",
      });
      if (res.ok) {
        const data: {
          progress: { lessonId: number };
          enrollment: { courseId: number; progress: number; status: string };
          xpAwarded: number;
          showStreakAnimation?: boolean;
        } = await res.json();

        setCompletedLessonIds((prev) => [...prev, lessonId]);
        setLessons((prev) =>
          prev.map((l) =>
            l.id === lessonId ? { ...l, completed: true } : l
          )
        );
        setCourses((prev) =>
          prev.map((c) =>
            c.id === data.enrollment.courseId
              ? {
                  ...c,
                  progress: data.enrollment.progress,
                  status: data.enrollment.status as CourseListItem["status"],
                }
              : c
          )
        );
        
        // Refresh session to update XP/Level/Streak in UI
        await refreshUser();
        
        return data;
      } else {
        toast.error("Failed to complete lesson.");
      }
    } catch (err) {
      console.error("Failed to complete lesson:", err);
      toast.error("An error occurred.");
    }
    return null;
  };

  const addCourse = async (data: CreateCoursePayload) => {
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result: { course: CourseListItem } = await res.json();
        setCourses((prev) => [result.course, ...prev]);
      }
    } catch (err) {
      console.error("Failed to create course:", err);
    }
  };

  const updateCourse = async (id: number, data: UpdateCoursePayload) => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        // Refresh the course list to get updated data
        await refreshCourses();
        await fetchCourseDetail(id);
      }
    } catch (err) {
      console.error("Failed to update course:", err);
    }
  };

  const deleteCourse = async (id: number) => {
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        setLessons((prev) => prev.filter((l) => l.courseId !== id));
        setQuizzes((prev) => prev.filter((q) => q.courseId !== id));
        setAssignments((prev) => prev.filter((a) => a.courseId !== id));
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  const getCourse = (id: number) => courses.find((c) => c.id === id);

  const getCourseLessons = (courseId: number) => {
    return lessons
      .filter((l) => l.courseId === courseId)
      .map((l) => ({
        ...l,
        completed: completedLessonIds.includes(l.id),
      }));
  };

  const getCourseQuizzes = (courseId: number) =>
    quizzes.filter((q) => q.courseId === courseId);

  const getCourseAssignments = (courseId: number) =>
    assignments.filter((a) => a.courseId === courseId);

  return (
    <CourseContext.Provider
      value={{
        courses,
        lessons,
        quizzes,
        assignments,
        enrolledIds,
        completedLessonIds,
        isLoading,
        courseDetailsLoading,
        enrollCourse,
        completeLesson,
        addCourse,
        updateCourse,
        deleteCourse,
        getCourse,
        getCourseLessons,
        getCourseQuizzes,
        getCourseAssignments,
        refreshCourses,
        fetchCourseDetail,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourses must be used within a CourseProvider");
  return context;
}
