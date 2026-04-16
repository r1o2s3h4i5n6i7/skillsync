import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: { instructorId: user.id },
      select: { id: true, title: true }
    });
    
    const courseIds = courses.map(c => c.id);

    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignment: { courseId: { in: courseIds } },
        status: { in: ["SUBMITTED", "PENDING", "GRADED"] } // Mostly we care about SUBMITTED to grade
      },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        assignment: { select: { title: true, maxScore: true, courseId: true, dueDate: true } }
      },
      orderBy: { submittedAt: "desc" }
    });

    const result = submissions.map(sub => ({
      id: sub.id,
      assignmentTitle: sub.assignment.title,
      courseTitle: courses.find(c => c.id === sub.assignment.courseId)?.title || "Unknown Course",
      studentName: sub.user.name,
      studentAvatar: sub.user.avatar,
      status: sub.status,
      score: sub.score,
      maxScore: sub.assignment.maxScore,
      fileUrl: sub.fileUrl,
      submittedAt: sub.submittedAt || sub.createdAt,
      dueDate: sub.assignment.dueDate
    }));

    return NextResponse.json({ submissions: result }, { status: 200 });

  } catch (error: any) {
    console.error("Teacher assignments GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch" }, { status: 500 });
  }
}
