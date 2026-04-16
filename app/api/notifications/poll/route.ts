import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const afterIdParam = searchParams.get("afterId");
    const afterId = afterIdParam ? parseInt(afterIdParam, 10) : 0;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.id,
        id: { gt: afterId },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to poll notifications:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
