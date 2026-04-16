import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { StudentDashboardData, AchievementData, DailyActivityData } from "@/types/dashboard";
import type { CourseListItem } from "@/types/course";

/**
 * GET /api/dashboard/student — Aggregated student dashboard data.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Enrolled courses with progress
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.id },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            tags: { select: { name: true } },
            _count: { select: { lessons: true, enrollments: true } },
          },
        },
      },
    });

    const enrolledCourses = enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      description: e.course.description,
      subject: e.course.subject,
      difficulty: e.course.difficulty,
      duration: e.course.duration,
      image: e.course.image,
      rating: e.course.rating,
      instructor: e.course.instructor.name,
      instructorId: e.course.instructorId,
      enrolled: e.course._count.enrollments,
      lessons: e.course._count.lessons,
      tags: e.course.tags.map((t) => t.name),
      progress: e.progress,
      status: e.status as CourseListItem["status"],
      enrollmentProgress: e.progress,
      enrollmentStatus: e.status,
    }));

    // 2. Achievements
    const allAchievements = await prisma.achievement.findMany({
      where: { forRole: "STUDENT" },
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

    // 3. Daily activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activities = await prisma.dailyActivity.findMany({
      where: { userId: session.id, date: { gte: sevenDaysAgo } },
      orderBy: { date: "asc" },
    });

    const dailyActivity: DailyActivityData[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const record = activities.find(a => a.date.toISOString().split("T")[0] === dateStr);
      dailyActivity.push({
        date: dateStr,
        xp: record?.xp ?? 0,
        lessons: record?.lessons ?? 0
      });
    }

    // 4. User stats
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    const completedCount = enrollments.filter((e) => e.status === "COMPLETED").length;
    const inProgressCount = enrollments.filter((e) => e.status === "IN_PROGRESS").length;

    const data: StudentDashboardData = {
      enrolledCourses,
      achievements,
      dailyActivity,
      stats: {
        xp: user?.xp ?? 0,
        level: user?.level ?? 1,
        streak: user?.streak ?? 0,
        coins: user?.coins ?? 0,
        totalEnrollments: enrollments.length,
        completedCourses: completedCount,
        inProgressCourses: inProgressCount,
      },
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Student dashboard error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
