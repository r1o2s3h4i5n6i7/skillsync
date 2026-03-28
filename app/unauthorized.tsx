"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Orbit, UserX, LogIn, Home } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full" />
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-card border-4 border-blue-500 flex items-center justify-center shadow-2xl">
          <UserX className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl sm:text-5xl font-black text-foreground mb-4 tracking-tight"
      >
        Identity <span className="text-blue-500">Unverified</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-lg max-w-md mx-auto mb-10 leading-relaxed"
      >
        We couldn't confirm your identity. Please sign in to access your learning portal.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto"
      >
        <Link href="/signin" className="w-full">
          <button className="w-full brand-gradient text-white px-8 py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2.5 shadow-xl shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <LogIn className="w-5 h-5" /> Sign In Now
          </button>
        </Link>
        <Link href="/" className="w-full">
          <button className="w-full bg-card border border-border text-foreground px-8 py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2.5 hover:bg-muted/50 transition-all">
            <Home className="w-5 h-5" /> Home Page
          </button>
        </Link>
      </motion.div>

      <div className="mt-12 flex items-center justify-center gap-2 border border-border/50 px-4 py-2 rounded-2xl bg-muted/5">
        <Orbit className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Authentication Protocol Required</span>
      </div>
    </div>
  );
}
