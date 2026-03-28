"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Orbit, AlertCircle, RefreshCcw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 rounded-full animate-pulse" />
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] bg-card border-4 border-rose-500 flex items-center justify-center shadow-2xl shadow-rose-500/10">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-rose-500" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl sm:text-5xl font-black text-foreground mb-4 tracking-tight"
      >
        Something <span className="text-rose-500">Went Wrong</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-lg max-w-md mx-auto mb-10 leading-relaxed"
      >
        We've encountered an unexpected turbulence in the system. Our engineers are already looking into it.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto"
      >
        <button
          onClick={() => reset()}
          className="w-full brand-gradient text-white px-8 py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2.5 shadow-xl shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <RefreshCcw className="w-5 h-5" /> Try Again
        </button>
        <Link href="/" className="w-full">
          <button className="w-full bg-card border border-border text-foreground px-8 py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2.5 hover:bg-muted/50 transition-all">
            <Home className="w-5 h-5" /> Home Page
          </button>
        </Link>
      </motion.div>

      <div className="mt-12 group cursor-pointer">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
          <Orbit className="w-4 h-4" />
          <span>SKILLSYNC DIAGNOSTICS</span>
        </div>
        <p className="hidden group-hover:block mt-2 text-[10px] text-muted-foreground/60 font-mono">
          DIGEST: {error.digest || "SYSTEM_RUNTIME_ERR_GENERIC"}
        </p>
      </div>
    </div>
  );
}
