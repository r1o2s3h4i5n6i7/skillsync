import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { LessonListItem, LessonContent } from "@/types/course";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/:courseId/lessons — Lessons ordered by index with user progress.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const id = Number(courseId);
    const session = await getSession();

    const lessons = await prisma.lesson.findMany({
      where: { courseId: id },
      orderBy: { orderIndex: "asc" },
    });

    let completedIds: number[] = [];
    if (session) {
      const progress = await prisma.lessonProgress.findMany({
        where: { userId: session.id, lessonId: { in: lessons.map((l) => l.id) } },
        select: { lessonId: true, completed: true },
      });
      completedIds = progress.filter((p) => p.completed).map((p) => p.lessonId);
    }

    const lessonList: LessonListItem[] = lessons.map((l) => ({
      id: l.id,
      courseId: l.courseId,
      title: l.title,
      duration: l.duration,
      type: l.type,
      xpReward: l.xpReward,
      orderIndex: l.orderIndex,
      completed: completedIds.includes(l.id),
      content: l.content as LessonContent | null,
    }));

    return NextResponse.json({ lessons: lessonList }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Lessons GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
