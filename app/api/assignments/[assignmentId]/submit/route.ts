import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createNotification } from "@/lib/notifications";

interface RouteParams {
  params: Promise<{ assignmentId: string }>;
}

/**
 * POST /api/assignments/:assignmentId/submit — Submit an assignment.
 * Auth: STUDENT only.
 */
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { assignmentId } = await params;
    const aid = Number(assignmentId);
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bodyText = await _request.text();
    let fileUrl: string | null = null;
    if (bodyText) {
      try {
        const payload = JSON.parse(bodyText);
        fileUrl = payload.fileUrl || null;
      } catch {}
    }

    const assignment = await prisma.assignment.findUnique({ 
      where: { id: aid },
      include: { course: true }
    });
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
    }

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_userId: { assignmentId: aid, userId: session.id },
      },
      create: {
        assignmentId: aid,
        userId: session.id,
        status: "SUBMITTED",
        fileUrl: fileUrl,
        submittedAt: new Date(),
      },
      update: {
        status: "SUBMITTED",
        fileUrl: fileUrl ?? undefined,
        submittedAt: new Date(),
      },
    });

    // Notify the teacher
    await createNotification({
      userId: assignment.course.instructorId,
      type: "ASSIGNMENT_SUBMITTED",
      title: "New Submission",
      message: `${session.name} submitted assignment: ${assignment.title}`,
      icon: "FileUpload"
    });

    return NextResponse.json(
      {
        submission: {
          id: submission.id,
          assignmentId: submission.assignmentId,
          userId: submission.userId,
          status: submission.status,
          score: submission.score,
          submittedAt: submission.submittedAt?.toISOString() ?? null,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Assignment submit error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
