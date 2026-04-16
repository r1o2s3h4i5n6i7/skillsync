import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { advanceLevelAndStreak } from "@/lib/progression";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { CourseListItem, CreateCoursePayload } from "@/types/course";

/**
 * GET /api/courses — List all published courses with computed fields.
 * Optional query: ?subject=&search=
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");

    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");
    const limit = limitParam ? parseInt(limitParam) : null;
    const page = pageParam ? parseInt(pageParam) : 1;
    const skip = limit ? (page - 1) * limit : 0;

    const session = await getSession();

    const where: any = {
      isPublished: true,
      ...(subject ? { subject } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    };

    const runQuery = async () => {
      if (limit) {
        return Promise.all([
          prisma.course.findMany({
            where,
            include: {
              instructor: { select: { id: true, name: true } },
              tags: { select: { name: true } },
              _count: { select: { lessons: true, enrollments: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
          }),
          prisma.course.count({ where })
        ]);
      } else {
        const cors = await prisma.course.findMany({
          where,
          include: {
            instructor: { select: { id: true, name: true } },
            tags: { select: { name: true } },
            _count: { select: { lessons: true, enrollments: true } },
          },
          orderBy: { createdAt: "desc" }
        });
        return [cors, cors.length] as const;
      }
    };

    const [courses, total] = await runQuery();

    // If user is logged in and is a student, get their enrollment data
    const enrollmentMap: Map<number, { progress: number; status: string }> = new Map();
    if (session?.role === "STUDENT") {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: session.id },
        select: { courseId: true, progress: true, status: true },
      });
      enrollments.forEach((e) =>
        enrollmentMap.set(e.courseId, { progress: e.progress, status: e.status })
      );
    }

    const courseList: CourseListItem[] = courses.map((c) => {
      const enrollment = enrollmentMap.get(c.id);
      return {
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
        tags: c.tags.map((t) => t.name),
        progress: enrollment?.progress ?? 0,
        status: (enrollment?.status ?? "NOT_STARTED") as CourseListItem["status"],
      };
    });

    if (limit) {
      return NextResponse.json({ 
        courses: courseList,
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }, { status: 200 });
    }

    return NextResponse.json({ courses: courseList }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Courses GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/courses — Create a new course with nested resources.
 * Auth: TEACHER only.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateCoursePayload = await request.json();
    const {
      title,
      description,
      subject,
      difficulty,
      duration,
      image,
      tags,
      lessons,
      quizzes,
      assignments,
    } = body;

    if (!title || !description || !subject) {
      return NextResponse.json(
        { error: "Title, description, and subject are required." },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        subject,
        difficulty: difficulty || "EASY",
        duration: duration || "10 hours",
        image: image || "/images/default-course.png",
        instructorId: session.id,
        tags: tags?.length
          ? { create: tags.map((t) => ({ name: t })) }
          : undefined,
        lessons: lessons?.length
          ? {
              create: lessons.map((l, i) => ({
                title: l.title,
                duration: l.duration || "10m",
                type: l.type || "INTERACTIVE",
                xpReward: l.xpReward || 50,
                orderIndex: l.orderIndex ?? i + 1,
                content: l.content ? (l.content as unknown as Prisma.InputJsonValue) : undefined,
              })),
            }
          : undefined,
        quizzes: quizzes?.length
          ? {
              create: quizzes.map((q) => ({
                title: q.title,
                difficulty: q.difficulty || "EASY",
                timeLimit: q.timeLimit || 600,
                xpReward: q.xpReward || 200,
                questions: {
                  create: q.questions.map((qn, idx) => ({
                    text: qn.text,
                    options: JSON.stringify(qn.options),
                    correctIndex: qn.correctIndex,
                    explanation: qn.explanation,
                    orderIndex: idx + 1,
                  })),
                },
              })),
            }
          : undefined,
        assignments: assignments?.length
          ? {
              create: assignments.map((a) => ({
                title: a.title,
                description: a.description,
                dueDate: new Date(a.dueDate),
                maxScore: a.maxScore || 10,
                xpReward: a.xpReward || 150,
              })),
            }
          : undefined,
      },
    });

    // Refetch with includes to get computed fields
    const fullCourse = await prisma.course.findUniqueOrThrow({
      where: { id: course.id },
      include: {
        instructor: { select: { name: true } },
        tags: { select: { name: true } },
        _count: { select: { lessons: true, enrollments: true } },
      },
    });

    const courseItem: CourseListItem = {
      id: fullCourse.id,
      title: fullCourse.title,
      description: fullCourse.description,
      subject: fullCourse.subject,
      difficulty: fullCourse.difficulty,
      duration: fullCourse.duration,
      image: fullCourse.image,
      rating: fullCourse.rating,
      instructor: fullCourse.instructor.name,
      instructorId: fullCourse.instructorId,
      enrolled: fullCourse._count.enrollments,
      lessons: fullCourse._count.lessons,
      tags: fullCourse.tags.map((t) => t.name),
      progress: 0,
      status: "NOT_STARTED",
    };

    // Teacher earns XP for creating a course
    await advanceLevelAndStreak(session.id, 50);

    // Notify ALL Students & Admins
    const targetUsers = await prisma.user.findMany({
      where: { role: { in: ["STUDENT", "ADMIN"] } },
      select: { id: true }
    });
    
    if (targetUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetUsers.map(u => ({
          userId: u.id,
          type: "COURSE_PUBLISHED",
          title: "New Course Available!",
          message: `Check out the new course: ${fullCourse.title}`,
          icon: "BookOpen"
        }))
      });
    }

    return NextResponse.json({ course: courseItem }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Course POST error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
