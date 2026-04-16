import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const subject = searchParams.get("subject") || "ALL";
    const difficulty = searchParams.get("difficulty") || "ALL";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subject: { contains: search } },
        { instructor: { name: { contains: search } } },
      ];
    }
    
    if (subject !== "ALL") {
      where.subject = subject;
    }
    
    if (difficulty !== "ALL") {
      where.difficulty = difficulty;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          instructor: { select: { name: true } },
          _count: { select: { lessons: true, enrollments: true } }
        }
      }),
      prisma.course.count({ where }),
    ]);

    const formattedCourses = courses.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      subject: c.subject,
      difficulty: c.difficulty,
      duration: c.duration,
      image: c.image,
      rating: c.rating,
      instructor: c.instructor.name,
      instructorId: c.instructorId,
      enrolled: c._count.enrollments,
      lessons: c._count.lessons,
      tags: [],
      progress: 0,
      status: "NOT_STARTED" as const
    }));

    return NextResponse.json({
      courses: formattedCourses,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    }, { status: 200 });
  } catch (error: any) {
    console.error("Admin Courses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
