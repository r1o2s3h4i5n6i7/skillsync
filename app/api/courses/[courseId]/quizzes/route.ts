import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { QuizListItem, QuestionData } from "@/types/course";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/:courseId/quizzes — Quizzes with questions and user attempt data.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const id = Number(courseId);
    const session = await getSession();

    const quizzes = await prisma.quiz.findMany({
      where: { courseId: id },
      include: { questions: { orderBy: { orderIndex: "asc" } } },
    });

    const attemptMap: Map<number, number> = new Map();
    if (session) {
      const attempts = await prisma.quizAttempt.findMany({
        where: { userId: session.id, quizId: { in: quizzes.map((q) => q.id) } },
        orderBy: { createdAt: "desc" },
        select: { quizId: true, score: true },
      });
      attempts.forEach((a) => {
        if (!attemptMap.has(a.quizId)) attemptMap.set(a.quizId, a.score);
      });
    }

    const quizList: QuizListItem[] = quizzes.map((q) => ({
      id: q.id,
      courseId: q.courseId,
      title: q.title,
      difficulty: q.difficulty,
      timeLimit: q.timeLimit,
      xpReward: q.xpReward,
      questions: q.questions.map((qn): QuestionData => ({
        id: qn.id,
        text: qn.text,
        options: typeof qn.options === "string" ? JSON.parse(qn.options) : qn.options as string[],
        correctIndex: qn.correctIndex,
        explanation: qn.explanation,
      })),
      attempted: attemptMap.has(q.id),
      lastScore: attemptMap.get(q.id) ?? null,
    }));

    return NextResponse.json({ quizzes: quizList }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Quizzes GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
