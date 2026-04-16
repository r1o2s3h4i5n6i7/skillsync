// ─── Dashboard Types ─────────────────────────────────

import type { CourseListItem } from "./course";

export interface DailyActivityData {
  date: string;
  xp: number;
  lessons: number;
}

export interface AchievementData {
  id: number;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
  earned: boolean;
  earnedAt: string | null;
}

export interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  icon: string;
  isRead: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  city: string;
  xp: number;
  level: number;
  streak: number;
  role: string;
}

// ─── Dashboard Responses ─────────────────────────────

export interface StudentDashboardData {
  enrolledCourses: (CourseListItem & { enrollmentProgress: number; enrollmentStatus: string })[];
  achievements: AchievementData[];
  dailyActivity: DailyActivityData[];
  stats: {
    xp: number;
    level: number;
    streak: number;
    coins: number;
    totalEnrollments: number;
    completedCourses: number;
    inProgressCourses: number;
  };
}

export interface TeacherCourseStats {
  id: number;
  title: string;
  subject: string;
  enrolledCount: number;
  lessonCount: number;
  avgProgress: number;
  rating: number;
}

export interface TeacherDashboardData {
  courses: TeacherCourseStats[];
  totalStudents: number;
  totalEnrollments: number;
  achievements: AchievementData[];
  dailyActivity: DailyActivityData[];
  stats: {
    xp: number;
    level: number;
    streak: number;
    coins: number;
  };
}

export interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    totalEnrollments: number;
    courseCompletionRate: number;
    avgQuizScore: number;
  };
  recentUsers: LeaderboardEntry[];
  recentCourses: CourseListItem[];
  dailyEnrollments: { date: string; count: number }[];
  categoryDistribution: { subject: string; count: number }[];
  topCourses: { id: number; title: string; enrolled: number; rating: number }[];
}
