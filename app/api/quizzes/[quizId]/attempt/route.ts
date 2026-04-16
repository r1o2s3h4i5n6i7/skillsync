import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { advanceLevelAndStreak } from "@/lib/progression";
import type { QuizAttemptPayload } from "@/types/quiz";

interface RouteParams {
  params: Promise<{ quizId: string }>;
}

/**
 * POST /api/quizzes/:quizId/attempt — Submit quiz answers and get results.
 * Auth: STUDENT only.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { quizId } = await params;
    const qid = Number(quizId);
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: QuizAttemptPayload = await request.json();
    const { answers, timeSpent } = body;

    // Fetch quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: qid },
      include: { questions: { orderBy: { orderIndex: "asc" } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    // Calculate score
    let correct = 0;
    const total = quiz.questions.length;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Create attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.id,
        quizId: qid,
        score,
        answers: JSON.stringify(answers),
        timeSpent,
      },
    });

    // Award XP based on score
    const xpBase = quiz.xpReward;
    const xpAwarded = Math.round(xpBase * (score / 100));
    const progression = await advanceLevelAndStreak(session.id, xpAwarded);

    return NextResponse.json(
      {
        attempt: {
          id: attempt.id,
          score,
          correct,
          total,
          timeSpent,
        },
        xpAwarded,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Quiz attempt error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
