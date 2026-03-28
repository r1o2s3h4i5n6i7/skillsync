"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Orbit, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 brand-gradient blur-3xl opacity-20 rounded-full animate-pulse" />
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] brand-gradient flex items-center justify-center shadow-2xl shadow-pink-500/20">
          <Orbit className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-[spin_10s_linear_infinite]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-4 -right-4 bg-card border border-border px-4 py-2 rounded-2xl shadow-xl whitespace-nowrap"
        >
          <span className="text-2xl font-black brand-gradient-text italic">404</span>
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-4xl sm:text-5xl font-black text-foreground mb-4 tracking-tight"
      >
        Lost in the <span className="brand-gradient-text">Learning Cosmos?</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground text-lg max-w-md mx-auto mb-10 leading-relaxed"
      >
        The coordinates you're looking for don't exist in our galaxy. Let's get you back into range.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto"
      >
        <Link href="/" className="w-full">
          <button className="w-full brand-gradient text-white px-8 py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2.5 shadow-xl shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Home className="w-5 h-5" /> Back to Home
          </button>
        </Link>
        <Link href="/courses" className="w-full">
          <button className="w-full bg-card border border-border text-foreground px-8 py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2.5 hover:bg-muted/50 transition-all">
            <Search className="w-5 h-5" /> Explore Courses
          </button>
        </Link>
      </motion.div>

      {/* Background Decorative Elements */}
      <div className="fixed top-1/4 left-1/4 w-32 h-32 brand-gradient blur-[120px] opacity-10 pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-48 h-48 bg-blue-500 blur-[120px] opacity-10 pointer-events-none" />
    </div>
  );
}