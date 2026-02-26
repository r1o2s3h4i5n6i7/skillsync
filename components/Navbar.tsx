"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  Brain, Bell, LogOut, User, Settings, ChevronDown, X, CheckCircle2,
  Sparkles, BookOpen, Trophy, Unlock, ClipboardCheck
} from "lucide-react";
import Link from "next/link";
import { DEMO_NOTIFICATIONS, type DemoNotification } from "@/lib/demo-data";

const NOTIF_ICONS: Record<string, React.ElementType> = {
  Trophy, CheckCircle2, Sparkles, BookOpen, Unlock, ClipboardCheck,
};

function NotifIcon({ icon }: { icon: string }) {
  const Icon = NOTIF_ICONS[icon] || Bell;
  return <Icon className="w-4 h-4" />;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<DemoNotification[]>(DEMO_NOTIFICATIONS);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully.");
    router.push("/signin");
  };

  const getDashboardLink = () => {
    if (!user) return "/signin";
    if (user.role === "TEACHER") return "/dashboard/teacher";
    if (user.role === "ADMIN") return "/dashboard/admin";
    return "/dashboard/student";
  };

  const notifColors: Record<string, string> = {
    ACHIEVEMENT_EARNED: "from-yellow-400 to-orange-400",
    QUIZ_COMPLETED: "from-green-400 to-emerald-500",
    AI_RECOMMENDATION: "from-violet-400 to-purple-500",
    ENROLLMENT: "from-blue-400 to-indigo-500",
    MODULE_UNLOCKED: "from-cyan-400 to-blue-400",
    ASSIGNMENT_GRADED: "from-pink-400 to-rose-500",
  };

  return (
    <nav className="sticky top-0 z-40 w-full h-16 bg-card/90 backdrop-blur-xl border-b border-border flex items-center px-4 sm:px-6 gap-3 shadow-sm">
      {/* Logo */}
      <Link href={getDashboardLink()} className="flex items-center gap-2.5 shrink-0 select-none">
        <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-md shadow-violet-500/30">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-extrabold hidden sm:block">
          <span className="brand-gradient-text">SKILL</span>
          <span className="text-foreground">SYNC</span>
        </span>
      </Link>

      <div className="flex-1" />

      {user && (
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
              className="relative w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            >
              <Bell className="w-4.5 h-4.5 text-foreground" />
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4.5 h-4.5 brand-gradient rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow"
                >
                  {unread}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl shadow-violet-500/10 overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="font-semibold text-sm">Notifications</span>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                      )}
                      <button onClick={() => setShowNotifs(false)}>
                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        whileHover={{ backgroundColor: "var(--color-muted)" }}
                        onClick={() => setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, isRead: true } : n))}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-border/50 last:border-0 ${!notif.isRead ? "bg-primary/5" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${notifColors[notif.type] || "from-violet-400 to-blue-400"} flex items-center justify-center shrink-0 text-white`}>
                          <NotifIcon icon={notif.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {!notif.isRead && <div className="w-2 h-2 brand-gradient rounded-full shrink-0 mt-1" />}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border hover:bg-muted transition-colors"
            >
              <div className="w-7 h-7 rounded-lg brand-gradient flex items-center justify-center text-white text-xs font-bold shadow">
                {user.avatar}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-foreground leading-tight">{user.name.split(" ")[0]}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-2xl shadow-2xl shadow-violet-500/10 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-semibold text-sm text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full brand-gradient text-white text-[10px] font-semibold">
                      Level {user.level} · {user.xp.toLocaleString()} XP
                    </div>
                  </div>
                  <div className="py-1.5">
                    <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => setShowProfile(false)}>
                      <User className="w-4 h-4 text-muted-foreground" /> My Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => setShowProfile(false)}>
                      <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {!user && (
        <Link href="/signin">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="brand-gradient text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-violet-500/20">
            Sign In
          </motion.button>
        </Link>
      )}
    </nav>
  );
}
