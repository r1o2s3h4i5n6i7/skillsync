import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const courseTitle = searchParams.get("course") || "ALL";

  const skip = (page - 1) * limit;

  try {
    // 1. Get user's enrolled course IDs
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.id },
      select: { courseId: true }
    });
    const courseIds = enrollments.map(e => e.courseId);

    // 2. Build where clause
    const where: any = {
      courseId: { in: courseIds },
      OR: [
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    };

    if (courseTitle !== "ALL") {
      where.course = { title: courseTitle };
    }

    // Status filter is tricky because status is in Submission model
    // But we want to return Assignments
    // So we'll fetch assignments and then check submissions for this user
    
    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          course: { select: { title: true } },
          submissions: {
            where: { userId: session.id },
            select: { status: true, score: true, fileUrl: true }
          }
        },
        orderBy: { dueDate: "asc" },
        skip,
        take: limit
      }),
      prisma.assignment.count({ where })
    ]);

    const formattedAssignments = assignments.map(a => {
      const submission = a.submissions[0];
      let status = submission?.status || "PENDING";
      const score = submission?.score ?? undefined;
      
      // Effective status logic for consistency
      if (score !== undefined && status === "SUBMITTED") {
        status = "GRADED";
      }

      return {
        id: a.id,
        courseId: a.courseId,
        courseTitle: a.course.title,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate.toISOString(),
        maxScore: a.maxScore,
        xpReward: a.xpReward,
        status,
        score,
        fileUrl: submission?.fileUrl || null
      };
    });

    // Post-filter by status if requested
    let finalAssignments = formattedAssignments;
    if (status !== "ALL") {
      if (status === "EXPIRED") {
        finalAssignments = formattedAssignments.filter(a => a.status === "PENDING" && new Date(a.dueDate) < new Date());
      } else if (status === "PENDING") {
        finalAssignments = formattedAssignments.filter(a => a.status === "PENDING" && new Date(a.dueDate) >= new Date());
      } else {
        finalAssignments = formattedAssignments.filter(a => a.status === status);
      }
    }

    return NextResponse.json({
      assignments: finalAssignments,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Failed to fetch student assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}
