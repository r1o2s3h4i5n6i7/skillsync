"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Settings, Bell, Shield, Moon, Sun, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAvatarPath } from "@/types/auth";
import { calculateLevelAndProgress } from "@/lib/level-utils";
import Link from "next/link";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully.");
    router.push("/signin");
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? "brand-gradient" : "bg-muted"}`}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
      />
    </motion.button>
  );

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="brand-gradient rounded-2xl p-6 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold mb-1">Settings</h1>
          <p className="text-white/80 text-sm">Manage your preferences and account</p>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
      </motion.div>

      {/* Profile */}
      {user && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-border bg-muted/20">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Profile
            </p>
          </div>
          <div className="p-5 flex items-center gap-4">
            <Image
              src={getAvatarPath(user.role)}
              alt={`${user.role} avatar`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-xl object-cover shadow-md shadow-pink-500/20"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <p className="text-xs text-primary font-semibold mt-0.5 capitalize">{user.role.toLowerCase()} · Level {calculateLevelAndProgress(user.xp).level}</p>
            </div>
            <Link href="/profile">
              <motion.button whileHover={{ scale: 1.02 }} className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors">
                Edit
              </motion.button>
            </Link>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border bg-muted/20">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" /> Notifications
          </p>
        </div>
        <div className="divide-y divide-border">
          {[
            { label: "Push Notifications", desc: "Get alerts for quizzes, achievements, and more", value: notifications, onChange: () => { setNotifications(!notifications); toast.info(`Notifications ${!notifications ? "enabled" : "disabled"}.`); } },
            { label: "Email Digest", desc: "Weekly summary of your learning progress", value: emailDigest, onChange: () => { setEmailDigest(!emailDigest); toast.info(`Email digest ${!emailDigest ? "enabled" : "disabled"}.`); } },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <Toggle value={item.value} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border bg-muted/20">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            {darkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />} Appearance
          </p>
        </div>
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-semibold text-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark themes</p>
          </div>
          <Toggle value={darkMode} onChange={() => { setDarkMode(!darkMode); toast.info("Theme preference saved."); }} />
        </div>
      </div>

      {/* Security */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border bg-muted/20">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Security
          </p>
        </div>
        <div className="p-5">
          <Link href="/reset-password">
            <motion.button whileHover={{ scale: 1.01 }} className="w-full text-left p-3 bg-muted/30 hover:bg-muted/50 rounded-xl transition-colors">
              <p className="text-sm font-semibold text-foreground">Change Password</p>
              <p className="text-xs text-muted-foreground mt-0.5">Update your account password</p>
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Sign out */}
      <motion.button
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-destructive/10 hover:bg-destructive/15 border border-destructive/30 rounded-2xl text-destructive font-semibold transition-colors"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </motion.button>
    </div>
  );
}
