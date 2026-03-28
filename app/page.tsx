"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Orbit, BookOpen, Trophy, BarChart3, Zap, ArrowRight, Star, Users } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { icon: BookOpen, title: "IT Training", desc: "Cloud, AI, DevOps, Full Stack, Data Science — crafted for future-ready professionals.", color: "from-pink-500 to-rose-600" },
  { icon: Trophy, title: "Gamified Learning", desc: "Earn XP, level up, collect achievements and compete on the leaderboard.", color: "from-blue-500 to-cyan-500" },
  { icon: Zap, title: "Interactive Quizzes", desc: "Timed quizzes with instant feedback, explanations, and XP rewards.", color: "from-rose-500 to-pink-500" },
  { icon: BarChart3, title: "Smart Analytics", desc: "Detailed dashboards for students, teachers, and admins.", color: "from-cyan-400 to-blue-500" },
  { icon: Orbit, title: "AI Recommendations", desc: "Personalised course suggestions based on your learning patterns.", color: "from-pink-400 to-blue-500" },
  { icon: Users, title: "Multi-Role Platform", desc: "Dedicated experiences for Students, Teachers, and Administrators.", color: "from-blue-400 to-indigo-500" },
];

const DEMO_ACCOUNTS = [
  { role: "Student", email: "student@demo.com", icon: Orbit, color: "from-pink-500 to-blue-500" },
  { role: "Teacher", email: "teacher@demo.com", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
  { role: "Admin", email: "admin@demo.com", icon: Orbit, color: "from-rose-500 to-pink-500" },
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 sm:px-8 h-16 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-md shadow-pink-500/30">
            <Orbit className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold">
            <span className="brand-gradient-text">SKILL</span>
            <span className="text-foreground">SYNC</span>
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
              className="brand-gradient text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-pink-500/20">
              Get Started
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4 text-center">
        {/* Background blobs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent)" }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--color-accent), transparent)" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-wider uppercase"
          >
            <Zap className="w-3.5 h-3.5" />
            AI-Powered · Gamified · Tamil Nadu Edition
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-extrabold leading-[1.1] tracking-tight text-balance mb-8"
          >
            Learn Smarter.<br />
            <span className="brand-gradient-text">Achieve More.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            SKILLSYNC is a premium AI-powered IT Training platform for future-ready professionals — with high-quality content, smart quizzes, and personalised milestones.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                className="brand-gradient text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-pink-500/25 flex items-center gap-3 text-lg transition-all">
                Start Learning Free <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/signin">
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                className="bg-card border border-border text-foreground font-bold px-10 py-4 rounded-2xl hover:bg-muted transition-all text-lg shadow-sm">
                Sign In
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-10 sm:gap-16 mt-16"
          >
            {[
              { value: "1,284+", label: "Learners" },
              { value: "48+", label: "Premium Courses" },
              { value: "6,820+", label: "Success Stories" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black brand-gradient-text mb-1">{s.value}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-muted/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl font-black text-foreground mb-4">Everything you need to excel</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">A complete learning ecosystem designed for modern IT Training.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-pink-500/10 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 italic">0{i + 1}. {f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="brand-gradient rounded-[2.5rem] p-10 sm:p-14 text-white text-center shadow-2xl shadow-pink-500/30 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Orbit className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">Try the Demo</h2>
              <p className="text-white/80 text-lg mb-10 max-w-md mx-auto">Explore all three roles instantly with our pre-configured demo environment.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {DEMO_ACCOUNTS.map((acc) => (
                  <Link key={acc.role} href={`/signin`}>
                    <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center cursor-pointer transition-all shadow-lg hover:shadow-white/10">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center mx-auto mb-4 shadow-inner`}>
                        <acc.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-lg font-black tracking-tight">{acc.role}</p>
                      <p className="text-[10px] text-white/60 mt-1 font-mono uppercase">{acc.email}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
              <p className="text-sm font-medium text-white/70 bg-black/10 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
                Password for all demo accounts: <span className="font-mono font-bold text-white underline decoration-pink-400">demo123</span>
              </p>
            </div>
            <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/5" />
            <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-white/5" />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 brand-gradient rounded-lg flex items-center justify-center shadow-sm">
            <Orbit className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm brand-gradient-text">SKILLSYNC</span>
        </div>
        <p className="text-xs text-muted-foreground">AI-Powered IT Training Platform</p>
      </footer>
    </div>
  );
}
