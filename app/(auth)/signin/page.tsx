"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Orbit } from "lucide-react";
import Link from "next/link";

const DEMO_ACCOUNTS = [
  { label: "Student", email: "student@demo.com", color: "from-pink-500 to-rose-500" },
  { label: "Teacher", email: "teacher@demo.com", color: "from-blue-500 to-cyan-500" },
  { label: "Admin", email: "admin@demo.com", color: "from-rose-500 to-pink-500" },
];

export default function SignIn() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      toast.success("Welcome back! Redirecting…");
      const storedUser = JSON.parse(localStorage.getItem("intellixlearn_user") || "{}");
      if (storedUser.role === "TEACHER") router.push("/dashboard/teacher");
      else if (storedUser.role === "ADMIN") router.push("/dashboard/admin");
      else router.push("/dashboard/student");
    } else {
      toast.error("Invalid email or password. Try a demo account below.");
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo123");
    toast.info("Demo credentials filled. Click Sign In!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #ec489944, transparent)" }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #2563eb44, transparent)" }}
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #ec489933, transparent)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Orbit className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-2xl font-extrabold brand-gradient-text">INTELLIX</span>
            <span className="text-2xl font-extrabold text-foreground">LEARN</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl shadow-2xl shadow-pink-500/10 overflow-hidden">
          <div className="brand-gradient p-6 text-white text-center">
            <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
            <p className="text-white/80 text-sm">Sign in to continue your learning journey</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end">
                <Link href="/reset-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full brand-gradient text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 disabled:opacity-70 transition-all"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => toast.success("AI Logic: Redirecting to forgot password flow...")} className="flex items-center gap-1.5 text-xs font-bold brand-gradient-text hover:opacity-80 transition-all">
                <Orbit className="w-3.5 h-3.5" /> Quick Demo Loginot Password?
              </button>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <motion.button
                    key={acc.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fillDemo(acc.email)}
                    className={`bg-gradient-to-br ${acc.color} text-white text-xs font-semibold py-2.5 rounded-xl shadow-md`}
                  >
                    {acc.label}
                  </motion.button>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">Password for all demo accounts: <span className="font-mono font-semibold text-foreground">demo123</span></p>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              New here?{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
