"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
export const dynamic = "force-dynamic";
import { DEMO_USERS } from "@/lib/demo-data";
import { Trophy, Flame, Zap, Star, Crown, Medal, Award } from "lucide-react";
import Link from "next/link";

const SORTED_STUDENTS = [...DEMO_USERS]
  .filter((u) => u.role === "STUDENT")
  .sort((a, b) => b.xp - a.xp);

const RANK_STYLES = [
  { icon: Crown, color: "from-amber-400 to-yellow-500", textColor: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-700/40" },
  { icon: Medal, color: "from-slate-400 to-slate-500", textColor: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/40" },
  { icon: Award, color: "from-orange-400 to-amber-500", textColor: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/15 border-orange-200 dark:border-orange-700/40" },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  const myRank = user ? SORTED_STUDENTS.findIndex((u) => u.id === user.id) + 1 : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold mb-1">Leaderboard</h1>
          <p className="text-white/80 text-sm">Top learners ranked by XP earned</p>
          {myRank && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-bold">Your Rank: #{myRank}</span>
            </div>
          )}
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
      </motion.div>

      {/* Top 3 podium */}
      {SORTED_STUDENTS.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {/* 2nd */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className={`flex-1 max-w-[120px] border-2 rounded-2xl p-4 text-center ${RANK_STYLES[1].bg}`}>
            <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center text-white font-bold mx-auto mb-2 shadow-md shadow-violet-500/25">
              {SORTED_STUDENTS[1].avatar}
            </div>
            <Medal className={`w-5 h-5 mx-auto mb-1 ${RANK_STYLES[1].textColor}`} />
            <p className="font-bold text-xs text-foreground truncate">{SORTED_STUDENTS[1].name.split(" ")[0]}</p>
            <p className="text-[10px] text-muted-foreground">{SORTED_STUDENTS[1].xp.toLocaleString()} XP</p>
            <p className="text-lg font-extrabold text-muted-foreground mt-1">#2</p>
          </motion.div>
          {/* 1st */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className={`flex-1 max-w-[140px] border-2 rounded-2xl p-4 text-center -mb-4 shadow-lg ${RANK_STYLES[0].bg}`}>
            <div className="w-14 h-14 brand-gradient rounded-2xl flex items-center justify-center text-white font-bold mx-auto mb-2 shadow-lg shadow-violet-500/30 text-lg">
              {SORTED_STUDENTS[0].avatar}
            </div>
            <Crown className={`w-6 h-6 mx-auto mb-1 ${RANK_STYLES[0].textColor}`} />
            <p className="font-bold text-sm text-foreground truncate">{SORTED_STUDENTS[0].name.split(" ")[0]}</p>
            <p className="text-[10px] text-muted-foreground">{SORTED_STUDENTS[0].xp.toLocaleString()} XP</p>
            <p className="text-2xl font-extrabold text-amber-500 mt-1">#1</p>
          </motion.div>
          {/* 3rd */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className={`flex-1 max-w-[120px] border-2 rounded-2xl p-4 text-center ${RANK_STYLES[2].bg}`}>
            <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center text-white font-bold mx-auto mb-2 shadow-md shadow-violet-500/25">
              {SORTED_STUDENTS[2].avatar}
            </div>
            <Award className={`w-5 h-5 mx-auto mb-1 ${RANK_STYLES[2].textColor}`} />
            <p className="font-bold text-xs text-foreground truncate">{SORTED_STUDENTS[2].name.split(" ")[0]}</p>
            <p className="text-[10px] text-muted-foreground">{SORTED_STUDENTS[2].xp.toLocaleString()} XP</p>
            <p className="text-lg font-extrabold text-orange-500 mt-1">#3</p>
          </motion.div>
        </div>
      )}

      {/* Full list */}
      <div className="flex flex-col gap-2">
        {SORTED_STUDENTS.map((student, i) => {
          const isMe = user?.id === student.id;
          const rankStyle = RANK_STYLES[i] || null;
          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 3 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                isMe
                  ? "bg-primary/5 border-primary/30 shadow-md shadow-violet-500/10"
                  : "bg-card border-border hover:bg-muted/30"
              }`}
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                rankStyle
                  ? `bg-gradient-to-br ${rankStyle.color} text-white shadow-sm`
                  : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-violet-500/20">
                {student.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold text-sm truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                    {student.name} {isMe && <span className="text-[10px] font-bold text-primary">(You)</span>}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{student.city} · Level {student.level}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0 text-right">
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />{student.streak}d
                </div>
                <div>
                  <p className="text-sm font-extrabold text-foreground flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    {student.xp.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground text-right">XP</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
