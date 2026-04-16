import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { AdminDashboardData, LeaderboardEntry } from "@/types/dashboard";
import type { CourseListItem } from "@/types/course";

/**
 * GET /api/dashboard/admin — Aggregated admin dashboard data.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Aggregate counts
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      totalEnrollments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.course.count(),
      prisma.enrollment.count(),
    ]);

    // Average enrollment progress
    const progressAgg = await prisma.enrollment.aggregate({
      _avg: { progress: true },
    });
    const courseCompletionRate = Math.round(progressAgg._avg.progress ?? 0);

    // Average quiz score
    const quizAgg = await prisma.quizAttempt.aggregate({
      _avg: { score: true },
    });
    const avgQuizScore = Math.round(quizAgg._avg.score ?? 0);

    // Recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        avatar: true,
        city: true,
        xp: true,
        level: true,
        streak: true,
        role: true,
      },
    });

    const recentUsersList: LeaderboardEntry[] = recentUsers.map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      city: u.city,
      xp: u.xp,
      level: u.level,
      streak: u.streak,
      role: u.role,
    }));

    // Recent courses (last 10)
    const recentCourses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        instructor: { select: { name: true } },
        tags: { select: { name: true } },
        _count: { select: { lessons: true, enrollments: true } },
      },
    });

    const recentCoursesList: CourseListItem[] = recentCourses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      subject: c.subject,
      difficulty: c.difficulty,
      duration: c.duration,
      image: c.image,
      rating: c.rating,
      instructor: c.instructor.name,
      instructorId: c.instructorId,
      enrolled: c._count.enrollments,
      lessons: c._count.lessons,
      tags: c.tags.map((t) => t.name),
      progress: 0,
      status: "NOT_STARTED",
    }));

    // 1. Daily Enrollments (last 14 days for trend)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const enrollmentsTrend = await prisma.enrollment.findMany({
      where: { enrolledAt: { gte: fourteenDaysAgo } },
      select: { enrolledAt: true }
    });

    const dailyMap = new Map<string, number>();
    for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyMap.set(d.toISOString().split("T")[0], 0);
    }

    enrollmentsTrend.forEach(e => {
        const date = e.enrolledAt.toISOString().split("T")[0];
        if (dailyMap.has(date)) {
            dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
        }
    });

    const dailyEnrollments = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count })).reverse();

    // 2. Category Distribution
    const categories = await prisma.course.groupBy({
      by: ["subject"],
      _count: { _all: true }
    });
    
    const categoryDistribution = categories.map(c => ({
      subject: c.subject,
      count: c._count._all
    }));

    // 3. Top Courses
    const topCoursesRaw = await prisma.course.findMany({
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
      select: {
          id: true,
          title: true,
          rating: true,
          _count: { select: { enrollments: true } }
      }
    });

    const topCourses = topCoursesRaw.map(c => ({
        id: c.id,
        title: c.title,
        rating: c.rating,
        enrolled: c._count.enrollments
    }));

    const data: AdminDashboardData = {
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalCourses,
        totalEnrollments,
        courseCompletionRate,
        avgQuizScore,
      },
      recentUsers: recentUsersList,
      recentCourses: recentCoursesList,
      dailyEnrollments,
      categoryDistribution,
      topCourses
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Admin dashboard error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
