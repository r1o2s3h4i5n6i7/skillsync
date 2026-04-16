// ─── Enrollment & Progress Types ─────────────────────

import type { CourseStatus } from "./course";

export interface EnrollmentData {
  id: number;
  userId: number;
  courseId: number;
  status: CourseStatus;
  progress: number;
  enrolledAt: string;
}

export interface LessonProgressData {
  id: number;
  userId: number;
  lessonId: number;
  completed: boolean;
  completedAt: string | null;
}

export interface EnrollmentListResponse {
  enrollments: EnrollmentData[];
}

export interface EnrollCoursePayload {
  courseId: number;
}

export interface CompleteLessonResponse {
  progress: LessonProgressData;
  enrollment: EnrollmentData;
  xpAwarded: number;
}

export interface StudentStats {
  totalEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
}
