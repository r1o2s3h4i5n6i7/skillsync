import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { advanceLevelAndStreak } from "@/lib/progression";
import { createNotification } from "@/lib/notifications";

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

/**
 * POST /api/progress/lessons/:lessonId/complete — Mark a lesson as complete.
 * Auth: STUDENT only.
 * Side-effects: recalculates enrollment progress, awards XP, logs daily activity.
 */
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { lessonId } = await params;
    const lid = Number(lessonId);
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the lesson to find its course
    const lesson = await prisma.lesson.findUnique({ 
      where: { id: lid },
      include: { course: true }
    });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }

    // Upsert lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.id, lessonId: lid } },
      create: { userId: session.id, lessonId: lid, completed: true, completedAt: new Date() },
      update: { completed: true, completedAt: new Date() },
    });

    // Recalculate enrollment progress
    const totalLessons = await prisma.lesson.count({
      where: { courseId: lesson.courseId },
    });

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: session.id,
        completed: true,
        lesson: { courseId: lesson.courseId },
      },
    });

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const newStatus = progressPercentage === 100 ? "COMPLETED" : "IN_PROGRESS";

    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: session.id, courseId: lesson.courseId },
      },
      create: {
        userId: session.id,
        courseId: lesson.courseId,
        status: newStatus,
        progress: progressPercentage,
      },
      update: {
        status: newStatus,
        progress: progressPercentage,
      },
    });

    // Award XP, sequence levels, compute coins, register daily streak, invoke achievements!
    const xpReward = lesson.xpReward;
    const studentProgression = await advanceLevelAndStreak(session.id, xpReward);
    
    // Reward teacher XP
    if (lesson.course?.instructorId) {
      await advanceLevelAndStreak(lesson.course.instructorId, 5); // 5 XP per student lesson complete
    }

    // Dispatch completion notification
    await createNotification({
      userId: session.id,
      type: "MODULE_UNLOCKED",
      title: "Lesson Completed",
      message: `You earned ${xpReward} XP for completing a lesson!`,
      icon: "CheckCircle2"
    });

    return NextResponse.json(
      {
        progress: {
          id: progress.id,
          userId: progress.userId,
          lessonId: progress.lessonId,
          completed: progress.completed,
          completedAt: progress.completedAt?.toISOString() ?? null,
        },
        enrollment: {
          id: enrollment.id,
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt.toISOString(),
        },
        xpAwarded: xpReward,
        showStreakAnimation: studentProgression?.showStreakAnimation ?? false,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Lesson complete error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
