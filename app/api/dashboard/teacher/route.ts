import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { TeacherDashboardData, TeacherCourseStats, AchievementData, DailyActivityData } from "@/types/dashboard";

/**
 * GET /api/dashboard/teacher — Aggregated teacher dashboard data.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Teacher's courses with enrollment stats
    const courses = await prisma.course.findMany({
      where: { instructorId: session.id },
      include: {
        _count: { select: { lessons: true, enrollments: true } },
        enrollments: { select: { progress: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const courseStats: TeacherCourseStats[] = courses.map((c) => {
      const totalProgress = c.enrollments.reduce((sum, e) => sum + e.progress, 0);
      const avgProgress = c.enrollments.length > 0 ? Math.round(totalProgress / c.enrollments.length) : 0;
      return {
        id: c.id,
        title: c.title,
        subject: c.subject,
        enrolledCount: c._count.enrollments,
        lessonCount: c._count.lessons,
        avgProgress,
        rating: c.rating,
      };
    });

    // 2. Total unique students across all courses
    const totalStudentIds = await prisma.enrollment.findMany({
      where: { course: { instructorId: session.id } },
      select: { userId: true },
      distinct: ["userId"],
    });

    const totalEnrollments = await prisma.enrollment.count({
      where: { course: { instructorId: session.id } },
    });

    // 3. Teacher achievements
    const allAchievements = await prisma.achievement.findMany({
      where: { forRole: "TEACHER" },
    });
    const earnedAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.id },
      select: { achievementId: true, earnedAt: true },
    });
    const earnedMap = new Map(
      earnedAchievements.map((a) => [a.achievementId, a.earnedAt.toISOString()])
    );

    const achievements: AchievementData[] = allAchievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      xpBonus: a.xpBonus,
      earned: earnedMap.has(a.id),
      earnedAt: earnedMap.get(a.id) ?? null,
    }));

    // 4. Daily activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activities = await prisma.dailyActivity.findMany({
      where: { userId: session.id, date: { gte: sevenDaysAgo } },
      orderBy: { date: "asc" },
    });

    const dailyActivity: DailyActivityData[] = activities.map((a) => ({
      date: a.date.toISOString().split("T")[0],
      xp: a.xp,
      lessons: a.lessons,
    }));

    // 5. LIVE STATS CALCULATION (Real-time Teaching Performance)
    const teacherEnrollmentsDetails = await prisma.enrollment.findMany({
      where: { course: { instructorId: session.id } },
      include: { user: { select: { streak: true } } }
    });

    const sumProgress = teacherEnrollmentsDetails.reduce((sum, e) => sum + e.progress, 0);
    const maxStudentStreak = teacherEnrollmentsDetails.length > 0 
      ? Math.max(...teacherEnrollmentsDetails.map(e => e.user.streak))
      : 0;

    const liveXp = (totalEnrollments * 150) + Math.floor(sumProgress * 1.5);
    const liveLevel = Math.floor(liveXp / 800) + 1;
    const liveStreak = teacherEnrollmentsDetails.length > 0 
      ? Math.floor(maxStudentStreak * 0.8) + 12 
      : 0;

    const user = await prisma.user.findUnique({ where: { id: session.id } });

    const data: TeacherDashboardData = {
      courses: courseStats,
      totalStudents: totalStudentIds.length,
      totalEnrollments,
      achievements,
      dailyActivity,
      stats: {
        xp: liveXp, // Use live calculated XP
        level: liveLevel, // Use live calculated Level
        streak: liveStreak, // Use live calculated Streak
        coins: user?.coins ?? 0,
      },
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Teacher dashboard error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
