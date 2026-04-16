import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { LeaderboardEntry } from "@/types/dashboard";

/**
 * GET /api/leaderboard — Top 50 students ranked by XP.
 */
export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { xp: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        avatar: true,
        city: true,
        xp: true,
        level: true,
        streak: true,
        role: true,
      },
    });

    const leaderboard: LeaderboardEntry[] = students.map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      city: u.city,
      xp: u.xp,
      level: u.level,
      streak: u.streak,
      role: u.role,
    }));

    return NextResponse.json({ students: leaderboard }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Leaderboard error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
