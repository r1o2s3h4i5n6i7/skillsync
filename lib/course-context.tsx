"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  DEMO_COURSES, DEMO_LESSONS, DEMO_QUIZZES, DEMO_ASSIGNMENTS,
  STUDENT_ENROLLED_IDS,
  type DemoCourse, type DemoLesson, type DemoQuiz, type DemoAssignment, type DemoQuestion
} from "@/lib/demo-data";

interface CourseContextType {
  courses: DemoCourse[];
  lessons: DemoLesson[];
  quizzes: DemoQuiz[];
  assignments: DemoAssignment[];
  enrolledIds: number[];
  completedLessonIds: number[];
  enrollCourse: (courseId: number) => void;
  completeLesson: (lessonId: number, courseId: number) => void;
  addCourse: (
    course: Omit<DemoCourse, "id" | "instructor" | "instructorId" | "enrolled" | "rating" | "progress" | "status" | "image" | "lessons"> & { 
      image?: string;
      lessons?: Omit<DemoLesson, "id" | "courseId" | "type" | "completed">[];
      quizzes?: (Omit<DemoQuiz, "id" | "courseId" | "attempted" | "questions"> & {
        questions: Omit<DemoQuestion, "id">[];
      })[];
      assignments?: Omit<DemoAssignment, "id" | "courseId" | "status">[];
    }
  ) => void;
  updateCourse: (
    id: number, 
    course: Partial<DemoCourse> & {
      lessons?: Omit<DemoLesson, "id" | "courseId" | "type" | "completed">[];
      quizzes?: (Omit<DemoQuiz, "id" | "courseId" | "attempted" | "questions"> & {
        questions: Omit<DemoQuestion, "id">[];
      })[];
      assignments?: Omit<DemoAssignment, "id" | "courseId" | "status">[];
    }
  ) => void;
  deleteCourse: (id: number) => void;
  getCourse: (id: number) => DemoCourse | undefined;
  getCourseLessons: (courseId: number) => DemoLesson[];
  getCourseQuizzes: (courseId: number) => DemoQuiz[];
  getCourseAssignments: (courseId: number) => DemoAssignment[];
}

const CourseContext = createContext<CourseContextType>({
  courses: [],
  lessons: [],
  quizzes: [],
  assignments: [],
  addCourse: () => {},
  updateCourse: () => {},
  deleteCourse: () => {},
  getCourse: () => undefined,
  getCourseLessons: () => [],
  getCourseQuizzes: () => [],
  getCourseAssignments: () => [],
  enrolledIds: [],
  completedLessonIds: [],
  enrollCourse: () => {},
  completeLesson: () => {},
});

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<DemoCourse[]>([]);
  const [lessons, setLessons] = useState<DemoLesson[]>([]);
  const [quizzes, setQuizzes] = useState<DemoQuiz[]>([]);
  const [assignments, setAssignments] = useState<DemoAssignment[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage or DEMO data
  useEffect(() => {
    const storedCourses = localStorage.getItem("intellixlearn_course_data");
    const storedLessons = localStorage.getItem("intellixlearn_lesson_data");
    const storedQuizzes = localStorage.getItem("intellixlearn_quiz_data");
    const storedAssignments = localStorage.getItem("intellixlearn_assignment_data");
    const storedEnrolled = localStorage.getItem("intellixlearn_user_enrollments");
    const storedCompleted = localStorage.getItem("intellixlearn_user_progress");
    
    if (storedCourses) setCourses(JSON.parse(storedCourses));
    else setCourses(DEMO_COURSES);

    if (storedLessons) setLessons(JSON.parse(storedLessons));
    else setLessons(DEMO_LESSONS);

    if (storedQuizzes) setQuizzes(JSON.parse(storedQuizzes));
    else setQuizzes(DEMO_QUIZZES);

    if (storedAssignments) setAssignments(JSON.parse(storedAssignments));
    else setAssignments(DEMO_ASSIGNMENTS);

    if (storedEnrolled) setEnrolledIds(JSON.parse(storedEnrolled));
    else setEnrolledIds(STUDENT_ENROLLED_IDS);

    if (storedCompleted) {
      setCompletedLessonIds(JSON.parse(storedCompleted));
    } else {
      // Seed with already-completed lessons from demo data
      const defaultCompleted = DEMO_LESSONS.filter(l => l.completed).map(l => l.id);
      setCompletedLessonIds(defaultCompleted);
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("intellixlearn_course_data", JSON.stringify(courses));
      localStorage.setItem("intellixlearn_lesson_data", JSON.stringify(lessons));
      localStorage.setItem("intellixlearn_quiz_data", JSON.stringify(quizzes));
      localStorage.setItem("intellixlearn_assignment_data", JSON.stringify(assignments));
      localStorage.setItem("intellixlearn_user_enrollments", JSON.stringify(enrolledIds));
    }
  }, [courses, lessons, quizzes, assignments, enrolledIds, isLoaded]);

  const enrollCourse = (courseId: number) => {
    if (!enrolledIds.includes(courseId)) {
      const newEnrolled = [...enrolledIds, courseId];
      setEnrolledIds(newEnrolled);
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, enrolled: c.enrolled + 1 } : c
      ));
    }
  };

  const completeLesson = (lessonId: number, courseId: number) => {
    setCompletedLessonIds(prev => {
      if (prev.includes(lessonId)) return prev;
      const next = [...prev, lessonId];
      localStorage.setItem("intellixlearn_user_progress", JSON.stringify(next));
      return next;
    });

    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const courseLessons = lessons.filter(l => l.courseId === courseId);
        // Use the updated completedLessonIds for progress calculation
        const relatedCompleted = lessons.filter(l => l.courseId === courseId && [...completedLessonIds, lessonId].includes(l.id)).length;
        const progress = Math.round((relatedCompleted / courseLessons.length) * 100);
        return {
          ...c,
          progress,
          status: progress === 100 ? "COMPLETED" : "IN_PROGRESS"
        };
      }
      return c;
    }));
  };

  const isLessonCompleted = (lessonId: number) => completedLessonIds.includes(lessonId);

  const getCourseLessons = (courseId: number) => {
    return lessons.filter(l => l.courseId === courseId).map(l => ({
      ...l,
      completed: isLessonCompleted(l.id)
    }));
  };

  const addCourse = (data: any) => {
    const userStored = localStorage.getItem("intellixlearn_user");
    const user = userStored ? JSON.parse(userStored) : null;
    if (!user || user.role !== "TEACHER") return;

    const newCourseId = Math.max(0, ...courses.map((c) => c.id)) + 1;
    
    // Extract nested data
    const { lessons: newLessons = [], quizzes: newQuizzes = [], assignments: newAssignments = [], ...courseInfo } = data;

    const newCourse: DemoCourse = {
      ...courseInfo,
      id: newCourseId,
      instructor: user.name,
      instructorId: user.id,
      enrolled: 0,
      rating: 5.0,
      progress: 0,
      status: "NOT_STARTED",
      image: courseInfo.image || "/images/course-default.jpg",
    };

    // Add nested resources
    if (newLessons.length > 0) {
      const lessonBaseId = Math.max(0, ...lessons.map((l) => l.id)) + 1;
      const processedLessons = newLessons.map((l: any, i: number) => ({
        ...l,
        id: lessonBaseId + i,
        courseId: newCourseId,
        completed: false,
        type: "INTERACTIVE", // Always interactive as requested
      }));
      setLessons((prev) => [...prev, ...processedLessons]);
    }

    if (newQuizzes.length > 0) {
      const quizBaseId = Math.max(0, ...quizzes.map((q) => q.id)) + 1;
      const processedQuizzes = newQuizzes.map((q: any, i: number) => {
        const quizId = quizBaseId + i;
        return {
          ...q,
          id: quizId,
          courseId: newCourseId,
          attempted: false,
          questions: q.questions.map((question: any, qIdx: number) => ({
            ...question,
            id: qIdx + 1 // Simple ID for questions within a quiz
          }))
        };
      });
      setQuizzes((prev) => [...prev, ...processedQuizzes]);
    }

    if (newAssignments.length > 0) {
      const assignmentBaseId = Math.max(0, ...assignments.map((a) => a.id)) + 1;
      const processedAssignments = newAssignments.map((a: any, i: number) => ({
        ...a,
        id: assignmentBaseId + i,
        courseId: newCourseId,
        status: "PENDING",
      }));
      setAssignments((prev) => [...prev, ...processedAssignments]);
    }

    setCourses((prev) => [newCourse, ...prev]);
  };

  const updateCourse = (id: number, data: any) => {
    const { lessons: newLessons, quizzes: newQuizzes, assignments: newAssignments, ...courseInfo } = data;

    // Update course info
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...courseInfo } : c)));

    // Update lessons if provided
    if (newLessons) {
      const lessonBaseId = Math.max(0, ...lessons.map((l) => l.id)) + 1;
      const processedLessons = newLessons.map((l: any, i: number) => ({
        ...l,
        id: l.id || (lessonBaseId + i),
        courseId: id,
        completed: l.completed ?? false,
        type: l.type || "INTERACTIVE",
      }));
      setLessons((prev) => [
        ...prev.filter((l) => l.courseId !== id),
        ...processedLessons
      ]);
    }

    // Update quizzes if provided
    if (newQuizzes) {
      const quizBaseId = Math.max(0, ...quizzes.map((q) => q.id)) + 1;
      const processedQuizzes = newQuizzes.map((q: any, i: number) => {
        const quizId = q.id || (quizBaseId + i);
        return {
          ...q,
          id: quizId,
          courseId: id,
          attempted: q.attempted ?? false,
          questions: q.questions.map((question: any, qIdx: number) => ({
            ...question,
            id: question.id || (qIdx + 1)
          }))
        };
      });
      setQuizzes((prev) => [
        ...prev.filter((q) => q.courseId !== id),
        ...processedQuizzes
      ]);
    }

    // Update assignments if provided
    if (newAssignments) {
      const assignmentBaseId = Math.max(0, ...assignments.map((a) => a.id)) + 1;
      const processedAssignments = newAssignments.map((a: any, i: number) => ({
        ...a,
        id: a.id || (assignmentBaseId + i),
        courseId: id,
        status: a.status || "PENDING",
      }));
      setAssignments((prev) => [
        ...prev.filter((a) => a.courseId !== id),
        ...processedAssignments
      ]);
    }
  };

  const deleteCourse = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setLessons((prev) => prev.filter((l) => l.courseId !== id));
    setQuizzes((prev) => prev.filter((q) => q.courseId !== id));
    setAssignments((prev) => prev.filter((a) => a.courseId !== id));
  };

  const getCourse = (id: number) => courses.find((c) => c.id === id);
  const getCourseQuizzes = (courseId: number) => quizzes.filter((q) => q.courseId === courseId);
  const getCourseAssignments = (courseId: number) => assignments.filter((a) => a.courseId === courseId);

  return (
    <CourseContext.Provider value={{ 
      courses, lessons, quizzes, assignments, enrolledIds, completedLessonIds,
      enrollCourse, completeLesson, addCourse, updateCourse, deleteCourse, getCourse,
      getCourseLessons, getCourseQuizzes, getCourseAssignments
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourses must be used within a CourseProvider");
  return context;
}
