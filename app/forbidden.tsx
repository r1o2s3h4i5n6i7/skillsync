"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Orbit, ShieldAlert, Home, Lock } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, rotate: -10 }}
        animate={{ opacity: 1, rotate: 0 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 brand-gradient blur-3xl opacity-20 rounded-full" />
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-card border-4 border-primary flex items-center justify-center shadow-2xl">
          <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-2 rounded-xl shadow-lg">
          <ShieldAlert className="w-6 h-6" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl sm:text-5xl font-black text-foreground mb-4 tracking-tight"
      >
        Access <span className="brand-gradient-text">Restricted</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-lg max-w-md mx-auto mb-10 leading-relaxed"
      >
        Your current mission clearance doesn't allow access to this sector. Please check your credentials.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto"
      >
        <Link href="/" className="w-full">
          <button className="w-full brand-gradient text-white px-8 py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2.5 shadow-xl shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Home className="w-5 h-5" /> Back to Safety
          </button>
        </Link>
      </motion.div>

      <div className="mt-12 flex items-center justify-center gap-3 opacity-30">
        <Orbit className="w-6 h-6" />
        <div className="h-4 w-px bg-muted-foreground" />
        <span className="text-sm font-black tracking-widest uppercase">Intellix Security</span>
      </div>
    </div>
  );
}
