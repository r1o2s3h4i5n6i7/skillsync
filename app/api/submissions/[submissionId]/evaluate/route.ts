import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { advanceLevelAndStreak } from "@/lib/progression";
import { createNotification } from "@/lib/notifications";

interface RouteParams {
  params: Promise<{ submissionId: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId: sid } = await params;
    const submissionId = Number(sid);
    const body = await req.json();
    const { score } = body;

    if (score === undefined || score === null) {
      return NextResponse.json({ error: "Score is required" }, { status: 400 });
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.assignment.course.instructorId !== user.id) {
      return NextResponse.json({ error: "Not your course" }, { status: 403 });
    }

    // Update the submission
    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: Number(score),
        status: "GRADED",
        gradedAt: new Date()
      }
    });

    // Award XP to the student who submitted
    if (submission.status !== "GRADED") {
      const studentXpReward = Math.round((Number(score) / submission.assignment.maxScore) * submission.assignment.xpReward);
      if (studentXpReward > 0) {
         await advanceLevelAndStreak(submission.userId, studentXpReward);
      }

      await createNotification({
        userId: submission.userId,
        type: "ASSIGNMENT_GRADED",
        title: "Assignment Graded!",
        message: `Your work on "${submission.assignment.title}" has been graded: ${score}/${submission.assignment.maxScore}`,
        icon: "FileCheck"
      });
    }

    // COMPLEX FORMULA TO ALLOCATE TEACHER XP
    // "based on the average of marks on assignments and quizzes and course enrolled count there should be a complex formula"
    const courseStats = await prisma.course.findUnique({
      where: { id: submission.assignment.courseId },
      include: {
        enrollments: true,
        assignments: { include: { submissions: true } },
        quizzes: { include: { attempts: true } }
      }
    });

    if (courseStats) {
      const enrolledCount = courseStats.enrollments.length;
      
      const allSubmissions = courseStats.assignments.flatMap(a => a.submissions).filter(s => s.status === "GRADED" && s.score !== null);
      let avgAssignMark = 0;
      if (allSubmissions.length > 0) {
        // compute average percentage to normalize
        let totalPct = 0;
        allSubmissions.forEach(sub => {
           const max = courseStats.assignments.find(a => a.id === sub.assignmentId)?.maxScore || 100;
           totalPct += (sub.score! / max) * 100;
        });
        avgAssignMark = totalPct / allSubmissions.length;
      }

      const allAttempts = courseStats.quizzes.flatMap(q => q.attempts);
      let avgQuizMark = 0;
      if (allAttempts.length > 0) {
         avgQuizMark = allAttempts.reduce((acc, a) => acc + a.score, 0) / allAttempts.length;
      }

      const overallAvg = (avgAssignMark + avgQuizMark) / (avgAssignMark > 0 && avgQuizMark > 0 ? 2 : 1);
      
      // Formula: Base 10 XP + (Average Marks * Enrolled Count) * 0.1
      // e.g. 10 + (85 * 3) * 0.1 = 10 + 25.5 = 35 XP
      const teacherXp = Math.round(10 + (overallAvg * enrolledCount * 0.1));

      if (teacherXp > 0) {
        await advanceLevelAndStreak(user.id, teacherXp);
      }
    }

    return NextResponse.json({ submission: updatedSubmission }, { status: 200 });

  } catch (error: any) {
    console.error("Evaluate submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate" }, { status: 500 });
  }
}
