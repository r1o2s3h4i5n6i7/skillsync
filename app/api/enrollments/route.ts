import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { advanceLevelAndStreak } from "@/lib/progression";
import { createNotification } from "@/lib/notifications";
import type { EnrollmentData, EnrollCoursePayload } from "@/types/progress";

/**
 * GET /api/enrollments — Get enrollments for the current user (or by userId query).
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId")) || session.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: { select: { title: true } } },
      orderBy: { enrolledAt: "desc" },
    });

    const enrollmentList: EnrollmentData[] = enrollments.map((e) => ({
      id: e.id,
      userId: e.userId,
      courseId: e.courseId,
      status: e.status,
      progress: e.progress,
      enrolledAt: e.enrolledAt.toISOString(),
    }));

    return NextResponse.json({ enrollments: enrollmentList }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Enrollments GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/enrollments — Enroll the current user in a course.
 * Auth: STUDENT only.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: EnrollCoursePayload = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required." }, { status: 400 });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.id, courseId } },
    });

    if (existing) {
      return NextResponse.json({ error: "Already enrolled." }, { status: 409 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: true }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId: session.id, courseId, status: "NOT_STARTED", progress: 0 },
    });

    // Reward teacher XP and create notification
    await advanceLevelAndStreak(course.instructorId, 10);
    await createNotification({
      userId: course.instructorId,
      type: "STUDENT_ENROLLED",
      title: "New Student Enrolled!",
      message: `A new student enrolled in your course: ${course.title}`,
      icon: "TrendingUp"
    });

    const enrollmentData: EnrollmentData = {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      status: enrollment.status,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt.toISOString(),
    };

    return NextResponse.json({ enrollment: enrollmentData }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Enrollment POST error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
