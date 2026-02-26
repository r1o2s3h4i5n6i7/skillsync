"use client";

import { motion } from "framer-motion";
export const dynamic = "force-dynamic";
import { useAuth } from "@/lib/auth-context";
import { DEMO_ACHIEVEMENTS } from "@/lib/demo-data";
import { Lock, Star, Trophy, Flame, Award, Zap, Medal, FlaskConical } from "lucide-react";

const ICONS: Record<string, React.ElementType> = { Star, Trophy, Flame, Award, Zap, Medal, FlaskConical };

export default function AchievementsPage() {
  const { user } = useAuth();
  if (!user) return null;
  const earned = DEMO_ACHIEVEMENTS.filter((a) => a.earned);

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold mb-1">Achievements</h1>
          <p className="text-white/80 text-sm">You&apos;ve earned {earned.length} of {DEMO_ACHIEVEMENTS.length} badges</p>
          <div className="mt-4 flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-extrabold">{earned.length}</p>
              <p className="text-xs text-white/70">Earned</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-extrabold">{DEMO_ACHIEVEMENTS.length - earned.length}</p>
              <p className="text-xs text-white/70">Remaining</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-extrabold">
                {earned.reduce((s, a) => s + a.xpBonus, 0)}
              </p>
              <p className="text-xs text-white/70">Bonus XP</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-8 w-28 h-28 rounded-full bg-white/5" />
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {DEMO_ACHIEVEMENTS.map((a, i) => {
          const Icon = ICONS[a.icon] || Star;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={a.earned ? { y: -4, scale: 1.02 } : {}}
              className={`bg-card border rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all ${
                a.earned
                  ? "border-violet-200 shadow-md hover:shadow-lg hover:shadow-violet-500/10"
                  : "border-border opacity-50 grayscale"
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                a.earned ? "brand-gradient shadow-violet-500/25" : "bg-muted"
              }`}>
                {a.earned ? (
                  <Icon className="w-8 h-8 text-white" />
                ) : (
                  <Lock className="w-7 h-7 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.description}</p>
              </div>
              {a.earned ? (
                <div className="brand-gradient text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                  +{a.xpBonus} XP
                </div>
              ) : (
                <div className="bg-muted text-muted-foreground text-[10px] font-semibold px-3 py-1 rounded-full">
                  Locked
                </div>
              )}
              {a.earnedAt && (
                <p className="text-[10px] text-muted-foreground">{new Date(a.earnedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
