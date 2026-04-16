import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId: cidString } = await params;
    const courseId = parseInt(cidString);
    const { rating, comment } = await request.json();

    if (!rating || !comment) {
      return NextResponse.json({ error: "Rating and comment are required." }, { status: 400 });
    }

    // 1. Check if course exists and student is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.id, courseId } },
      include: { course: true }
    });

    if (!enrollment) {
      return NextResponse.json({ error: "You must be enrolled to review this course." }, { status: 403 });
    }

    // 2. Create the review
    const review = await prisma.courseReview.create({
      data: {
        userId: session.id,
        courseId,
        rating: Math.min(5, Math.max(1, rating)),
        comment,
      },
    });

    // 3. Update course average rating
    const allReviews = await prisma.courseReview.findMany({
      where: { courseId },
      select: { rating: true }
    });
    
    const avgRating = allReviews.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / allReviews.length;
    
    await prisma.course.update({
      where: { id: courseId },
      data: { rating: parseFloat(avgRating.toFixed(1)) }
    });

    // 4. Notify the teacher
    await createNotification({
      userId: enrollment.course.instructorId,
      type: "NEW_COURSE_REVIEW",
      title: "New Course Review",
      message: `${session.name} rated "${enrollment.course.title}" ${rating} stars: "${comment.substring(0, 50)}..."`,
      icon: "Star"
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Course review POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId: cidString } = await params;
    const reviews = await prisma.courseReview.findMany({
      where: { courseId: parseInt(cidString) },
      include: {
        user: {
          select: { name: true, avatar: true, role: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
