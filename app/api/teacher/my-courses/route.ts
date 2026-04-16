import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "ALL";
    const sort = searchParams.get("sort") || "NEWEST";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    const where: any = {
      instructorId: session.id,
    };
    
    if (category !== "ALL") {
      where.subject = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subject: { contains: search } },
      ];
    }
    
    let orderBy: any = { createdAt: "desc" };
    if (sort === "ENROLLMENTS") orderBy = { enrollments: { _count: "desc" } };
    if (sort === "RATING") orderBy = { rating: "desc" };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          subject: true,
          rating: true,
          image: true,
          _count: { select: { enrollments: true, lessons: true } },
          enrollments: {
            select: { progress: true }
          }
        }
      }),
      prisma.course.count({ where }),
    ]);

    const formattedCourses = courses.map(c => {
      const avgProgress = c.enrollments.length > 0 
        ? Math.round(c.enrollments.reduce((s, e) => s + e.progress, 0) / c.enrollments.length)
        : 0;
        
      return {
        id: c.id,
        title: c.title,
        subject: c.subject,
        rating: c.rating,
        enrolledCount: c._count.enrollments,
        lessonCount: c._count.lessons,
        image: c.image,
        avgProgress
      }
    });

    return NextResponse.json({
      courses: formattedCourses,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    }, { status: 200 });
  } catch (error: any) {
    console.error("Teacher Courses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
