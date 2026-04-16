import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { AssignmentListItem } from "@/types/course";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/:courseId/assignments — Assignments with user submission status.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const id = Number(courseId);
    const session = await getSession();

    const assignments = await prisma.assignment.findMany({
      where: { courseId: id },
      orderBy: { dueDate: "asc" },
    });

    const submissionMap: Map<number, { status: string; score: number | null }> = new Map();
    if (session) {
      const submissions = await prisma.assignmentSubmission.findMany({
        where: { userId: session.id, assignmentId: { in: assignments.map((a) => a.id) } },
      });
      submissions.forEach((s) =>
        submissionMap.set(s.assignmentId, { status: s.status, score: s.score })
      );
    }

    const assignmentList: AssignmentListItem[] = assignments.map((a) => {
      const sub = submissionMap.get(a.id);
      return {
        id: a.id,
        courseId: a.courseId,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate.toISOString(),
        maxScore: a.maxScore,
        xpReward: a.xpReward,
        status: (sub?.status ?? "PENDING") as AssignmentListItem["status"],
        score: sub?.score ?? null,
      };
    });

    return NextResponse.json({ assignments: assignmentList }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Assignments GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
