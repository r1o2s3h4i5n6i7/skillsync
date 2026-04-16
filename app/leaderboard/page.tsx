"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Loader } from "@/components/Loader";
import Image from "next/image";
import { getAvatarPath } from "@/types/auth";
import type { LeaderboardEntry } from "@/types/dashboard";
import { Trophy, Flame, Zap, Star, Crown, Medal, Award } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export const dynamic = "force-dynamic";

const RANK_STYLES = [
  { icon: Crown, color: "from-amber-400 to-yellow-500", textColor: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-700/40" },
  { icon: Medal, color: "from-slate-400 to-slate-500", textColor: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/40" },
  { icon: Award, color: "from-orange-400 to-amber-500", textColor: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/15 border-orange-200 dark:border-orange-700/40" },
];

function LeaderboardContent() {
  const { user } = useAuth();
  const [students, setStudents] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data: { students: LeaderboardEntry[] } = await res.json();
        setStudents(data.students);
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader size="lg" />
        <p className="text-sm text-muted-foreground font-medium">Loading leaderboard...</p>
      </div>
    );
  }

  const myRank = students.findIndex((u) => u.id === user.id) + 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold mb-1">Leaderboard</h1>
          <p className="text-white/80 text-sm">Top learners ranked by XP earned</p>
          {myRank > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-bold">Your Rank: #{myRank}</span>
            </div>
          )}
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
      </motion.div>

      {/* Top 3 podium */}
      {students.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {/* 2nd */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className={`flex-1 max-w-[120px] border-2 rounded-2xl p-4 text-center ${RANK_STYLES[1].bg}`}>
            <Image src={getAvatarPath("STUDENT")} alt="2nd place" width={48} height={48}
              className="w-12 h-12 rounded-2xl object-cover mx-auto mb-2 shadow-md" />
            <Medal className={`w-5 h-5 mx-auto mb-1 ${RANK_STYLES[1].textColor}`} />
            <p className="font-bold text-xs text-foreground truncate">{students[1].name.split(" ")[0]}</p>
            <p className="text-[10px] text-muted-foreground">{students[1].xp.toLocaleString()} XP</p>
            <p className="text-lg font-extrabold text-muted-foreground mt-1">#2</p>
          </motion.div>
          {/* 1st */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className={`flex-1 max-w-[140px] border-2 rounded-2xl p-4 text-center -mb-4 shadow-lg ${RANK_STYLES[0].bg}`}>
            <Image src={getAvatarPath("STUDENT")} alt="1st place" width={56} height={56}
              className="w-14 h-14 rounded-2xl object-cover mx-auto mb-2 shadow-lg" />
            <Crown className={`w-6 h-6 mx-auto mb-1 ${RANK_STYLES[0].textColor}`} />
            <p className="font-bold text-sm text-foreground truncate">{students[0].name.split(" ")[0]}</p>
            <p className="text-[10px] text-muted-foreground">{students[0].xp.toLocaleString()} XP</p>
            <p className="text-2xl font-extrabold text-amber-500 mt-1">#1</p>
          </motion.div>
          {/* 3rd */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className={`flex-1 max-w-[120px] border-2 rounded-2xl p-4 text-center ${RANK_STYLES[2].bg}`}>
            <Image src={getAvatarPath("STUDENT")} alt="3rd place" width={48} height={48}
              className="w-12 h-12 rounded-2xl object-cover mx-auto mb-2 shadow-md" />
            <Award className={`w-5 h-5 mx-auto mb-1 ${RANK_STYLES[2].textColor}`} />
            <p className="font-bold text-xs text-foreground truncate">{students[2].name.split(" ")[0]}</p>
            <p className="text-[10px] text-muted-foreground">{students[2].xp.toLocaleString()} XP</p>
            <p className="text-lg font-extrabold text-orange-500 mt-1">#3</p>
          </motion.div>
        </div>
      )}

      {/* Full list */}
      <div className="flex flex-col gap-2">
        {students.map((student, i) => {
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
                  ? "bg-pink-50/50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800 shadow-xl shadow-pink-500/15"
                  : "bg-card border-border hover:bg-pink-50/20 dark:hover:bg-pink-900/5 hover:border-pink-200/50 dark:hover:border-pink-800/50"
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
              <Image
                src={getAvatarPath("STUDENT")}
                alt={`${student.name} avatar`}
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover shadow-md shadow-pink-500/20"
              />

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

export default function LeaderboardPage() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}
