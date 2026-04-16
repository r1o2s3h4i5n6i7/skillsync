import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { CourseListItem, LessonListItem, QuizListItem, QuestionData, AssignmentListItem, UpdateCoursePayload, LessonContent } from "@/types/course";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/:courseId — Full course detail with all nested resources.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const id = Number(courseId);
    const session = await getSession();

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, name: true } },
        tags: { select: { name: true } },
        lessons: { orderBy: { orderIndex: "asc" } },
        quizzes: {
          include: { questions: { orderBy: { orderIndex: "asc" } } },
        },
        assignments: true,
        _count: { select: { lessons: true, enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // Get user-specific data
    let enrollmentProgress = 0;
    let enrollmentStatus = "NOT_STARTED";
    let completedLessonIds: number[] = [];
    const quizAttemptMap: Map<number, number> = new Map();
    const submissionMap: Map<number, { status: string; score: number | null; fileUrl: string | null }> = new Map();

    if (session) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.id, courseId: id } },
      });
      if (enrollment) {
        enrollmentProgress = enrollment.progress;
        enrollmentStatus = enrollment.status;
      }

      const progress = await prisma.lessonProgress.findMany({
        where: { userId: session.id, lessonId: { in: course.lessons.map((l) => l.id) } },
        select: { lessonId: true, completed: true },
      });
      completedLessonIds = progress.filter((p) => p.completed).map((p) => p.lessonId);

      const quizAttempts = await prisma.quizAttempt.findMany({
        where: { userId: session.id, quizId: { in: course.quizzes.map((q) => q.id) } },
        select: { quizId: true, score: true },
        orderBy: { createdAt: "desc" },
      });
      quizAttempts.forEach((a) => {
        if (!quizAttemptMap.has(a.quizId)) quizAttemptMap.set(a.quizId, a.score);
      });

      const submissions = await prisma.assignmentSubmission.findMany({
        where: { userId: session.id, assignmentId: { in: course.assignments.map((a) => a.id) } },
      });
      submissions.forEach((s) =>
        submissionMap.set(s.assignmentId, { status: s.status, score: s.score, fileUrl: s.fileUrl })
      );
    }

    const courseItem: CourseListItem = {
      id: course.id,
      title: course.title,
      description: course.description,
      subject: course.subject,
      difficulty: course.difficulty,
      duration: course.duration,
      image: course.image,
      rating: course.rating,
      instructor: course.instructor.name,
      instructorId: course.instructorId,
      enrolled: course._count.enrollments,
      lessons: course._count.lessons,
      tags: course.tags.map((t) => t.name),
      progress: enrollmentProgress,
      status: enrollmentStatus as CourseListItem["status"],
    };

    const lessonList: LessonListItem[] = course.lessons.map((l) => ({
      id: l.id,
      courseId: l.courseId,
      title: l.title,
      duration: l.duration,
      type: l.type,
      xpReward: l.xpReward,
      orderIndex: l.orderIndex,
      completed: completedLessonIds.includes(l.id),
      content: l.content as LessonContent | null,
    }));

    const quizList: QuizListItem[] = course.quizzes.map((q) => ({
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
      attempted: quizAttemptMap.has(q.id),
      lastScore: quizAttemptMap.get(q.id) ?? null,
    }));

    const assignmentList: AssignmentListItem[] = course.assignments.map((a) => {
      const sub = submissionMap.get(a.id);
      return {
        id: a.id,
        courseId: a.courseId,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate.toISOString(),
        maxScore: a.maxScore,
        xpReward: a.xpReward,
        status: (sub?.status ?? "PENDING") as AssignmentListItem["status"],
        score: sub?.score ?? null,
        fileUrl: sub?.fileUrl ?? null,
      };
    });

    return NextResponse.json(
      { course: courseItem, lessons: lessonList, quizzes: quizList, assignments: assignmentList },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Course GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/courses/:courseId — Update course with optional nested content replacement.
 * Auth: Owner TEACHER or ADMIN.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const id = Number(courseId);
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    if (session.role !== "ADMIN" && existing.instructorId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: UpdateCoursePayload = await request.json();
    const { lessons, quizzes, assignments, tags, ...courseInfo } = body;

    // Update course fields
    await prisma.course.update({
      where: { id },
      data: {
        ...(courseInfo.title ? { title: courseInfo.title } : {}),
        ...(courseInfo.description ? { description: courseInfo.description } : {}),
        ...(courseInfo.subject ? { subject: courseInfo.subject } : {}),
        ...(courseInfo.difficulty ? { difficulty: courseInfo.difficulty } : {}),
        ...(courseInfo.duration ? { duration: courseInfo.duration } : {}),
        ...(courseInfo.image ? { image: courseInfo.image } : {}),
      },
    });

    // Replace tags if provided
    if (tags) {
      await prisma.courseTag.deleteMany({ where: { courseId: id } });
      if (tags.length > 0) {
        await prisma.courseTag.createMany({
          data: tags.map((t) => ({ name: t, courseId: id })),
        });
      }
    }

    // Replace lessons if provided
    if (lessons) {
      await prisma.lesson.deleteMany({ where: { courseId: id } });
      if (lessons.length > 0) {
        for (let i = 0; i < lessons.length; i++) {
          const l = lessons[i];
          await prisma.lesson.create({
            data: {
              courseId: id,
              title: l.title,
              duration: l.duration || "10m",
              type: l.type || "INTERACTIVE",
              xpReward: l.xpReward || 50,
              orderIndex: l.orderIndex ?? i + 1,
              content: l.content ? (l.content as unknown as Prisma.InputJsonValue) : undefined,
            },
          });
        }
      }
    }

    // Replace quizzes if provided
    if (quizzes) {
      await prisma.quiz.deleteMany({ where: { courseId: id } });
      if (quizzes.length > 0) {
        for (const q of quizzes) {
          await prisma.quiz.create({
            data: {
              courseId: id,
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
            },
          });
        }
      }
    }

    // Replace assignments if provided
    if (assignments) {
      await prisma.assignment.deleteMany({ where: { courseId: id } });
      if (assignments.length > 0) {
        await prisma.assignment.createMany({
          data: assignments.map((a) => ({
            courseId: id,
            title: a.title,
            description: a.description,
            dueDate: new Date(a.dueDate),
            maxScore: a.maxScore || 10,
            xpReward: a.xpReward || 150,
          })),
        });
      }
    }

    // 5. Notify all enrolled students about the update
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: id },
      select: { userId: true }
    });

    if (enrollments.length > 0) {
      await prisma.notification.createMany({
        data: enrollments.map(e => ({
          userId: e.userId,
          type: "COURSE_UPDATED",
          title: "Course Updated",
          message: `The course "${existing.title}" has new content or updates. Check it out!`,
          icon: "Sparkles"
        }))
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Course PUT error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/courses/:courseId — Delete course (cascade via Prisma).
 * Auth: Owner TEACHER or ADMIN.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const id = Number(courseId);
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    if (session.role !== "ADMIN" && existing.instructorId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Course DELETE error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
