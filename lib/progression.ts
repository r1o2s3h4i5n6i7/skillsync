import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { calculateLevelAndProgress } from "@/lib/level-utils";

export async function advanceLevelAndStreak(userId: number, xpGained: number) {
  // 1. Get current user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const currentXp = user.xp + xpGained;
  const { level: newLevel } = calculateLevelAndProgress(currentXp);
  const levelUp = newLevel > user.level;
  
  // Award coins: 10 coins per lesson, plus 50 on level up
  const coinsGained = 10 + (levelUp ? 50 : 0);

  // Streak logic (basic implementation)
  // Check daily activity to see if they were active yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0,0,0,0);
  
  const today = new Date();
  today.setHours(0,0,0,0);

  const yesterdayActivity = await prisma.dailyActivity.findUnique({
    where: { userId_date: { userId, date: yesterday } }
  });

  const todayActivity = await prisma.dailyActivity.findUnique({
    where: { userId_date: { userId, date: today } }
  });

  let newStreak = user.streak;
  // If they weren't active today yet, but were active yesterday, bump streak
  if (!todayActivity) {
    if (yesterdayActivity) {
      newStreak += 1;
    } else {
      newStreak = 1; // broken streak
    }
  }

  // Update User
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: currentXp,
      level: newLevel,
      coins: user.coins + coinsGained,
      streak: newStreak
    }
  });

  // Log Daily Activity
  try {
    await prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, xp: xpGained, lessons: 1 },
      update: { xp: { increment: xpGained }, lessons: { increment: 1 } }
    });
  } catch (err) {
    // If upsert fails due to race condition, try a simple update
    await prisma.dailyActivity.update({
      where: { userId_date: { userId, date: today } },
      data: { xp: { increment: xpGained }, lessons: { increment: 1 } }
    }).catch(() => {}); // ignore if it also fails
  }

  // Evaluate common achievements manually or structurally
  // e.g. Code Ninja (taken a lesson), Streak (7 days)
  const achievements = await prisma.achievement.findMany();
  for (const ac of achievements) {
    let earned = false;
    if (ac.title.includes("Ninja")) earned = true;
    if (ac.title.includes("Streak") && newStreak >= 7) earned = true;
    if (ac.title.includes("Level") && newLevel >= 5) earned = true;

    if (earned) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: ac.id } },
        create: { userId, achievementId: ac.id },
        update: {} // already earned
      });

      await createNotification({
        userId,
        type: "ACHIEVEMENT_EARNED",
        title: "Achievement Unlocked!",
        message: `You earned: ${ac.title} (+${ac.xpBonus} XP)`,
        icon: "Trophy"
      });
    }
  }

  // Also notify level up
  if (levelUp) {
    await createNotification({
      userId,
      type: "ACHIEVEMENT_EARNED",
      title: "Level Up!",
      message: `Congratulations! You reached Level ${newLevel}.`,
      icon: "TrendingUp"
    });
  }

  const showStreakAnimation = newStreak === 1 || newStreak % 7 === 0;

  return { levelUp, coinsGained, newStreak, showStreakAnimation };
}
