"use client";

import { Orbit, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-background text-foreground selection:bg-pink-500/30 antialiased overflow-x-hidden">
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#050505]">
          <div className="w-20 h-20 rounded-2xl brand-gradient flex items-center justify-center shadow-2xl mb-8">
            <Orbit className="w-10 h-10 text-white animate-spin-slow" />
          </div>

          <h1 className="text-6xl font-black text-white mb-6 tracking-tighter">
            SYSTEM<br />
            <span className="text-rose-500 underline decoration-pink-500/50">FAILURE</span>
          </h1>

          <p className="text-neutral-400 text-sm font-mono max-w-xs mb-10">
            A CRITICAL EXCEPTION HAS OCCURRED IN THE CORE ENGINE. ALL SYSTEMS HALTED.
            <br /><br />
            ERROR_DIGEST: {error.digest || "GLOBAL_FATAL_0x00A"}
          </p>

          <button
            onClick={() => reset()}
            className="flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:invert transition-all active:scale-95"
          >
            <RefreshCcw className="w-5 h-5" /> REBOOT SYSTEM
          </button>

          <div className="mt-16 text-[10px] text-neutral-600 font-bold tracking-[0.3em] uppercase">
            SKILLSYNC BIOS v2.0
          </div>
        </div>
      </body>
    </html>
  );
}
