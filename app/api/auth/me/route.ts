import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import type { SessionUser } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Fetch fresh user data from DB to keep session in sync
    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!dbUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const freshUser: SessionUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatar: dbUser.avatar,
      city: dbUser.city,
      xp: dbUser.xp,
      level: dbUser.level,
      streak: dbUser.streak,
      coins: dbUser.coins,
      joinedAt: dbUser.joinedAt.toISOString(),
    };

    // Refresh session cookie with latest DB data
    await setSession(freshUser);

    return NextResponse.json({ user: freshUser }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Session check error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
