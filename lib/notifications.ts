import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export type NotificationTypeInput = 
  | "MODULE_UNLOCKED" 
  | "ACHIEVEMENT_EARNED" 
  | "AI_RECOMMENDATION" 
  | "QUIZ_COMPLETED" 
  | "ENROLLMENT" 
  | "ASSIGNMENT_GRADED" 
  | "ASSIGNMENT_SUBMITTED"
  | "COURSE_PUBLISHED" 
  | "STUDENT_ENROLLED" 
  | "SYSTEM_ALERT" 
  | "MEMBER_JOINED"
  | "NEW_COURSE_REVIEW"
  | "COURSE_UPDATED";

interface CreateNotificationParams {
  userId: number;
  type: NotificationTypeInput;
  title: string;
  message: string;
  icon?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type as NotificationType,
        title: params.title,
        message: params.message,
        icon: params.icon || "Bell",
      }
    });

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}
