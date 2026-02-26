"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Brain, BookOpen, Trophy, BarChart3, Zap, ArrowRight, Star, Users, GraduationCap } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { icon: BookOpen, title: "STEM Courses", desc: "Algebra, Physics, Chemistry, Biology, CS — crafted for Tamil Nadu learners.", color: "from-violet-500 to-purple-600" },
  { icon: Trophy, title: "Gamified Learning", desc: "Earn XP, level up, collect achievements and compete on the leaderboard.", color: "from-blue-500 to-cyan-500" },
  { icon: Zap, title: "Interactive Quizzes", desc: "Timed quizzes with instant feedback, explanations, and XP rewards.", color: "from-fuchsia-500 to-violet-500" },
  { icon: BarChart3, title: "Smart Analytics", desc: "Detailed dashboards for students, teachers, and admins.", color: "from-emerald-400 to-green-500" },
  { icon: Brain, title: "AI Recommendations", desc: "Personalised course suggestions based on your learning patterns.", color: "from-amber-400 to-orange-500" },
  { icon: Users, title: "Multi-Role Platform", desc: "Dedicated experiences for Students, Teachers, and Administrators.", color: "from-rose-400 to-red-500" },
];

const DEMO_ACCOUNTS = [
  { role: "Student", email: "student@demo.com", icon: GraduationCap, color: "from-violet-500 to-blue-500" },
  { role: "Teacher", email: "teacher@demo.com", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
  { role: "Admin", email: "admin@demo.com", icon: Brain, color: "from-fuchsia-500 to-violet-500" },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "TEACHER") router.replace("/dashboard/teacher");
      else if (user.role === "ADMIN") router.replace("/dashboard/admin");
      else router.replace("/dashboard/student");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 sm:px-8 h-16 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-md shadow-violet-500/30">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold">
            <span className="brand-gradient-text">INTELLIX</span>
            <span className="text-foreground">LEARN</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Sign In
            </motion.button>
          </Link>
          <Link href="/signup">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="brand-gradient text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-violet-500/20">
              Get Started
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4 text-center">
        {/* Background blobs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #7c3aed55, transparent)" }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #2563eb55, transparent)" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-6"
          >
            <Zap className="w-3.5 h-3.5" />
            AI-Powered · Gamified · Tamil Nadu Edition
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold leading-tight text-balance mb-6"
          >
            Learn Smarter.<br />
            <span className="brand-gradient-text">Achieve More.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl mx-auto"
          >
            INTELLIXLEARN is an AI-powered STEM learning platform built for Tamil Nadu students — with gamification, smart quizzes, and personalised pathways.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/signup">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="brand-gradient text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-violet-500/30 flex items-center gap-2">
                Start Learning Free <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/signin">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="bg-card border border-border text-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-muted transition-colors">
                Sign In
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-8 mt-12"
          >
            {[
              { value: "1,284", label: "Learners" },
              { value: "48", label: "Courses" },
              { value: "6,820", label: "Enrollments" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold brand-gradient-text">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-3">Everything you need to excel</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">A complete learning ecosystem designed for modern STEM education.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-violet-500/10 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-md mb-4`}>
                  <f.icon className="w-5.5 h-5.5 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="brand-gradient rounded-3xl p-8 text-white text-center shadow-2xl shadow-violet-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-extrabold mb-2">Try the Demo</h2>
              <p className="text-white/80 text-sm mb-6">Explore all three roles instantly — no sign-up needed.</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {DEMO_ACCOUNTS.map((acc) => (
                  <Link key={acc.role} href={`/signin`}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-2xl p-4 text-center cursor-pointer transition-colors">
                      <acc.icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-bold">{acc.role}</p>
                      <p className="text-[10px] text-white/70 mt-0.5">{acc.email}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
              <p className="text-xs text-white/60">Password for all demo accounts: <span className="font-mono font-bold text-white">demo123</span></p>
            </div>
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full bg-white/5" />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 brand-gradient rounded-lg flex items-center justify-center shadow-sm">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm brand-gradient-text">INTELLIXLEARN</span>
        </div>
        <p className="text-xs text-muted-foreground">AI-Powered STEM Learning Platform · Tamil Nadu, India</p>
      </footer>
    </div>
  );
}
