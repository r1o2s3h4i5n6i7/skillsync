import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { AchievementData } from "@/types/dashboard";

/**
 * GET /api/achievements — All achievements for user's role with earned status.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allAchievements = await prisma.achievement.findMany({
      where: { forRole: session.role },
      orderBy: { id: "asc" },
    });

    const earnedAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.id },
      select: { achievementId: true, earnedAt: true },
    });

    const earnedMap = new Map(
      earnedAchievements.map((a) => [a.achievementId, a.earnedAt.toISOString()])
    );

    const achievements: AchievementData[] = allAchievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      xpBonus: a.xpBonus,
      earned: earnedMap.has(a.id),
      earnedAt: earnedMap.get(a.id) ?? null,
    }));

    return NextResponse.json({ achievements }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Achievements error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
