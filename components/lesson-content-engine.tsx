"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Play, BookOpen, ChevronRight, ArrowRight, Sparkles, Zap, Layers, Cpu, Radio, Hash } from "lucide-react";

interface Paragraph {
  content: string;
  reference_web?: string;
  animation?: string;
}

interface LessonContentData {
  text: Paragraph[];
  youtubeLinks?: string[];
  referenceLinks?: string[];
  animation?: string;
}

interface Props {
  content: LessonContentData;
  lessonId: number;
  lessonTitle: string;
}

// ── Shared Animation Variants ──────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

// ── Helpers ────────────────────────────────────────────────────────
function domain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 0 — NEBULA (space odyssey / floating particles)
// ═══════════════════════════════════════════════════════════════════════════════
function Nebula({ content }: { content: LessonContentData }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="bg-[#080820] rounded-3xl overflow-hidden border border-violet-500/25 shadow-2xl relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div key={i}
            animate={{ 
              y: [0, -40, 0], 
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.2, 1] 
            }}
            transition={{ duration: 3 + i % 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
            className="absolute w-1 h-1 bg-violet-400 rounded-full"
            style={{ top: `${(i * 13) % 100}%`, left: `${(i * 23) % 100}%` }}
          />
        ))}
      </div>

      <div className="relative h-16 bg-gradient-to-r from-indigo-950 via-violet-950 to-indigo-950 flex items-center px-6 gap-3 border-b border-violet-500/10">
        <Cpu className="w-4 h-4 text-violet-400 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-300">Nebula Quantum Core</span>
      </div>

      <div className="p-6 flex flex-col gap-6 relative z-10">
        {content.text.map((para, i) => (
          <motion.div key={i} variants={itemVariants} 
            className="relative group">
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.2, duration: 0.8 }}
              className="absolute -left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="bg-violet-900/10 p-4 rounded-xl border border-transparent group-hover:border-violet-500/20 group-hover:bg-violet-900/20 transition-all duration-300">
              <p className="text-[15px] leading-relaxed text-violet-100/90 group-hover:text-white transition-colors">{para.content}</p>
              {para.reference_web && (
                <motion.a whileHover={{ scale: 1.05 }} href={para.reference_web} target="_blank" rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-xs text-violet-400 hover:text-white bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
                  <ExternalLink className="w-3 h-3" /> {domain(para.reference_web)}
                </motion.a>
              )}
            </div>
          </motion.div>
        ))}
        
        {content.youtubeLinks && content.youtubeLinks.length > 0 && (
          <motion.div variants={itemVariants} className="mt-2 p-5 bg-indigo-950/40 rounded-2xl border border-indigo-500/20">
            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Play className="w-3 h-3" /> Visual Memory Stream
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {content.youtubeLinks.map((url, i) => (
                <motion.a whileHover={{ x: 5 }} key={i} href={url} target="_blank" className="flex items-center gap-3 p-3 bg-indigo-900/30 rounded-xl border border-indigo-500/10 hover:border-indigo-500/40 group">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/40 transition-all">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                  <span className="text-sm font-semibold text-indigo-200">Lecture Stream {i + 1}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 1 — AMBER FORGE (mechanical / tech stack)
// ═══════════════════════════════════════════════════════════════════════════════
function AmberForge({ content }: { content: LessonContentData }) {
  const [active, setActive] = useState(0);
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="bg-[#120a00] rounded-3xl border border-amber-900/50 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Cpu className="w-48 h-48 text-amber-500 stroke-[1]" />
      </div>
      
      <div className="bg-amber-500 h-1 w-full" />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
           <Zap className="w-4 h-4 text-amber-500" />
           <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Forge Protocol Active</span>
        </div>

        <div className="flex flex-col gap-3">
          {content.text.map((para, i) => (
            <motion.div key={i} variants={itemVariants} 
              layout transition={{ type: "spring", stiffness: 200, damping: 30 }}
              className={`rounded-2xl border transition-all duration-500 overflow-hidden ${active === i ? "bg-amber-950/40 border-amber-500/50 shadow-xl shadow-amber-900/20" : "bg-black/20 border-white/5 hover:border-white/10"}`}>
              <button 
                onClick={() => setActive(i)}
                className="w-full text-left p-5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className={`text-xl font-black ${active === i ? "text-amber-500" : "text-amber-900"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <p className={`text-[15px] font-bold ${active === i ? "text-amber-100" : "text-amber-800"}`}>{para.content.substring(0, 40)}...</p>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform duration-500 ${active === i ? "rotate-90 text-amber-500" : "text-amber-900 group-hover:text-amber-700"}`} />
              </button>
              
              <AnimatePresence>
                {active === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
                    <p className="text-[15px] leading-relaxed text-amber-100/80 border-t border-amber-500/10 pt-4">{para.content}</p>
                    {para.reference_web && (
                       <a href={para.reference_web} target="_blank" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-amber-400">
                         <Layers className="w-3.5 h-3.5" /> Documentation Entry
                       </a>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 2 — FOREST (nature / growth / organic)
// ═══════════════════════════════════════════════════════════════════════════════
function Forest({ content }: { content: LessonContentData }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="bg-[#051109] rounded-3xl border border-emerald-900/30 overflow-hidden shadow-2xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-emerald-100 uppercase tracking-tighter">Organic Growth Module</h3>
          <p className="text-[10px] text-emerald-500/60 uppercase font-black tracking-widest">Natural Intelligence Engine</p>
        </div>
      </div>

      <div className="flex flex-col gap-12 relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-emerald-900/30" />
        
        {content.text.map((para, i) => (
          <motion.div key={i} variants={itemVariants} className="flex gap-6 relative group">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#051109] border-2 border-emerald-900 group-hover:border-emerald-500 transition-colors duration-500 flex items-center justify-center shadow-lg">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${i === 0 ? "bg-emerald-500" : "bg-emerald-900 group-hover:bg-emerald-500/50"}`} />
              </div>
            </div>
            <div className="flex-1 pt-1">
              <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}
                className="bg-emerald-900/5 p-6 rounded-2xl border border-emerald-900/20 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5 transition-all duration-500">
                <p className="text-[16px] leading-relaxed text-emerald-100/90 tracking-tight">{para.content}</p>
                {para.reference_web && (
                   <a href={para.reference_web} target="_blank" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300">
                     <BookOpen className="w-3.5 h-3.5" /> Reference Node
                   </a>
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}

        {content.referenceLinks && (
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2 ml-16 mt-4">
            {content.referenceLinks.map((url, i) => (
              <motion.a whileHover={{ y: -2 }} key={i} href={url} target="_blank" 
                className="text-[10px] uppercase font-black tracking-widest bg-emerald-500/5 border border-emerald-500/10 px-4 py-2 rounded-full text-emerald-500 hover:text-emerald-300 hover:border-emerald-500/30 transition-all">
                {domain(url)}
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 3 — CRYSTAL (glassmorphism / refraction)
// ═══════════════════════════════════════════════════════════════════════════════
function Crystal({ content }: { content: LessonContentData }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="p-1 rounded-[2.5rem] bg-gradient-to-br from-white/20 to-transparent border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-slate-950 opacity-90 backdrop-blur-3xl -z-10" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
             <Layers className="w-5 h-5 text-slate-800 dark:text-white" />
             <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Crystalline Prism</span>
           </div>
           <div className="text-[10px] font-black uppercase text-slate-400">Refraction v4.2</div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {content.text.map((para, i) => (
            <motion.div key={i} variants={itemVariants}
              whileHover={{ scale: 1.01, y: -4 }}
              className="bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl relative group">
              <div className="absolute top-4 right-6 text-4xl font-black text-black/5 dark:text-white/5 select-none">{i + 1}</div>
              <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 font-medium tracking-tight relative z-10 pr-8">{para.content}</p>
              {para.reference_web && (
                <div className="mt-4 flex gap-2">
                   <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mt-2" />
                   <a href={para.reference_web} className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 font-bold underline decoration-slate-200 dark:decoration-slate-800">{domain(para.reference_web)}</a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 4 — OCEAN (liquid / wave movements)
// ═══════════════════════════════════════════════════════════════════════════════
function Ocean({ content }: { content: LessonContentData }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="bg-[#010a13] rounded-3xl border border-cyan-900/30 overflow-hidden shadow-2xl">
      <div className="h-32 bg-gradient-to-b from-cyan-900/40 to-transparent relative overflow-hidden">
        <motion.div 
          animate={{ x: [-100, 100], y: [0, 10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center opacity-10">
          <Hash className="w-96 h-96 text-cyan-400" />
        </motion.div>
        <div className="absolute bottom-6 left-8">
           <div className="flex items-center gap-2 mb-1">
             <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
             <span className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.4em]">Subsurface Link</span>
           </div>
           <h3 className="text-2xl font-black text-white pr-4">Deep Content Stream</h3>
        </div>
      </div>

      <div className="px-8 pb-8 flex flex-col gap-8">
        {content.text.map((para, i) => (
          <motion.div key={i} variants={itemVariants} className="flex gap-6 group">
            <div className="w-1.5 rounded-full bg-cyan-900 group-hover:bg-cyan-500 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-700" />
            <div className="flex-1">
               <p className="text-[17px] leading-relaxed text-cyan-100/80 group-hover:text-cyan-50 transition-colors duration-500">{para.content}</p>
               {para.reference_web && (
                <motion.a whileHover={{ x: 5 }} href={para.reference_web} className="mt-4 inline-flex items-center gap-2 text-xs font-black text-cyan-600 hover:text-cyan-400 uppercase tracking-widest">
                  Discovery Node <ChevronRight className="w-3 h-3" />
                </motion.a>
               )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 5 — EMBER (heat / flicker / vertical slices)
// ═══════════════════════════════════════════════════════════════════════════════
function Ember({ content }: { content: LessonContentData }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="bg-[#0f0404] rounded-[2rem] border border-rose-950 p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-rose-600/5 rounded-full blur-3xl" />
      
      <div className="flex items-center gap-2 mb-8 border-b border-rose-900/20 pb-4">
        <Sparkles className="w-4 h-4 text-rose-600" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-600/80">Ember Core Processing</span>
      </div>

      <div className="flex flex-col gap-4">
        {content.text.map((para, i) => (
          <motion.div key={i} variants={itemVariants}
            className="grid grid-cols-[1fr_auto] gap-6 group">
            <div className="bg-gradient-to-r from-rose-950/10 to-transparent p-6 rounded-2xl border-l-[3px] border-rose-900/30 group-hover:border-rose-500 transition-all duration-700">
               <p className="text-[15px] leading-relaxed text-rose-100/80 group-hover:text-rose-50 transition-colors">{para.content}</p>
               {para.reference_web && (
                 <a href={para.reference_web} className="mt-4 inline-block text-[10px] font-black text-rose-800 hover:text-rose-500 uppercase tracking-widest">{domain(para.reference_web)}</a>
               )}
            </div>
            <div className="flex flex-col items-center justify-center opacity-20 group-hover:opacity-100 transition-all">
              <div className="w-8 h-8 rounded-lg bg-rose-950 flex items-center justify-center text-[10px] font-black text-rose-500 border border-rose-900">{i + 1}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 6 — MINT (minimal / grid focus)
// ═══════════════════════════════════════════════════════════════════════════════
function Mint({ content }: { content: LessonContentData }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="bg-white dark:bg-[#080d0b] rounded-3xl border border-emerald-100 dark:border-emerald-900/30 shadow-xl p-8 overflow-hidden group">
      <div className="flex items-center justify-between mb-10">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase">Live Feed</span>
         </div>
         <div className="w-12 h-px bg-emerald-100 dark:bg-emerald-900/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-50 dark:bg-emerald-900/10 -translate-y-1/2 hidden md:block" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-50 dark:bg-emerald-900/10 -translate-x-1/2 hidden md:block" />
        
        {content.text.map((para, i) => (
          <motion.div key={i} variants={itemVariants}
            whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.03)' }}
            className="p-6 rounded-2xl transition-all duration-500 relative">
            <div className="text-[10px] font-black text-emerald-300 dark:text-emerald-800 mb-3 tracking-widest">CHAPTER_{i + 1}</div>
            <p className="text-[16px] leading-relaxed text-slate-600 dark:text-emerald-100/90 font-medium">{para.content}</p>
            {para.reference_web && (
               <a href={para.reference_web} className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-400">
                 Source <ChevronRight className="w-3 h-3" />
               </a>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 7 — GRAPHITE (monochrome / code / terminal)
// ═══════════════════════════════════════════════════════════════════════════════
function Graphite({ content }: { content: LessonContentData }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-2xl font-mono p-6 relative">
      <div className="absolute top-0 left-0 right-0 h-8 bg-neutral-900 rounded-t-2xl flex items-center px-4 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          <div className="flex-1" />
          <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest pr-2">Secure Terminal Access</span>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {content.text.map((para, i) => (
          <motion.div key={i} variants={itemVariants} className="group">
             <div className="flex gap-4 items-start">
               <span className="text-neutral-700 font-bold text-sm mt-1">[{i}]</span>
               <div className="flex-1">
                  <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }}
                    className="text-[14px] leading-relaxed text-neutral-400 group-hover:text-green-500 transition-colors duration-500">
                    <span className="text-neutral-600 mr-2">$</span>{para.content}
                  </motion.p>
                  {para.reference_web && (
                    <a href={para.reference_web} className="mt-4 inline-block text-[10px] text-neutral-600 hover:text-neutral-400 underline decoration-neutral-800">fetch --url="{domain(para.reference_web)}"</a>
                  )}
               </div>
             </div>
          </motion.div>
        ))}

        <div className="mt-4 pt-6 border-t border-neutral-900">
           <div className="flex items-center gap-2 text-neutral-600 text-xs mb-4">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span>Connected to high_level_concepts_db</span>
           </div>
           {content.youtubeLinks && (
             <div className="flex flex-col gap-2">
               {content.youtubeLinks.map((url, i) => (
                 <a key={i} href={url} className="text-[11px] text-neutral-500 hover:text-green-400 transition-colors">
                   &gt; play_media --stream="{url.substring(0, 30)}..."
                 </a>
               ))}
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 8 — SUNSET (warm / gradients / float)
// ═══════════════════════════════════════════════════════════════════════════════
function Sunset({ content }: { content: LessonContentData }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="bg-[#1a0510] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
      <motion.div animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/10 via-rose-500/10 to-transparent -z-10" />
      
      <div className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-2 mb-4">
           <div className="w-16 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full" />
           <span className="text-[10px] font-black uppercase text-orange-400 tracking-[0.5em]">Chromatic Learning</span>
        </div>

        {content.text.map((para, i) => (
          <motion.div key={i} variants={itemVariants}
            whileHover={{ y: -5 }}
            className="text-center max-w-xl mx-auto group">
            <h5 className="text-[9px] font-black text-rose-500/60 uppercase tracking-[0.4em] mb-4">SEGMENT_{i + 1}</h5>
            <p className="text-[18px] sm:text-[20px] leading-relaxed text-orange-100/90 font-medium tracking-tight group-hover:text-white transition-colors duration-500">{para.content}</p>
            {para.reference_web && (
              <a href={para.reference_web} className="mt-6 inline-flex items-center gap-2 text-xs font-black text-orange-500 hover:text-orange-300">
                <Sparkles className="w-3.5 h-3.5" /> Read More
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 9 — ARCTIC (minimal / sleek / cold blue)
// ═══════════════════════════════════════════════════════════════════════════════
function Arctic({ content }: { content: LessonContentData }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="bg-white dark:bg-[#020508] rounded-3xl border border-sky-100 dark:border-sky-900/30 overflow-hidden shadow-2xl flex flex-col md:flex-row">
      <div className="w-full md:w-32 bg-sky-50 dark:bg-sky-950/20 border-b md:border-b-0 md:border-r border-sky-100 dark:border-sky-900/30 flex items-center justify-center p-6 shrink-0">
         <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            <Cpu className="w-10 h-10 text-sky-400 animate-pulse" />
         </motion.div>
      </div>

      <div className="flex-1 p-8 md:p-12 flex flex-col gap-10">
        {content.text.map((para, i) => (
          <motion.div key={i} variants={itemVariants} className="relative group">
            <div className={`absolute -top-6 -left-2 text-[64px] font-black pointer-events-none select-none ${i % 2 === 0 ? "text-sky-50 dark:text-sky-900/5" : "text-blue-50 dark:text-blue-900/5"}`}>0{i + 1}</div>
            <p className="text-[17px] leading-relaxed text-sky-950 dark:text-sky-100/80 relative z-10 font-bold tracking-tight">{para.content}</p>
            {para.reference_web && (
              <a href={para.reference_web} className="mt-4 relative z-10 inline-flex items-center gap-2 text-xs font-black text-sky-600 dark:text-sky-400 group-hover:text-blue-500">
                Explore Logic <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
const STYLES = [Nebula, AmberForge, Forest, Crystal, Ocean, Ember, Mint, Graphite, Sunset, Arctic];
const STYLE_NAMES = ["Nebula", "Amber Forge", "Forest", "Crystal", "Ocean", "Ember", "Mint", "Graphite", "Sunset", "Arctic"];
const STYLE_ICONS = [Cpu, Zap, Sparkles, Layers, Radio, Sparkles, Cpu, Radio, Sparkles, Cpu];
const STYLE_COLORS = [
  "text-violet-400", "text-amber-500", "text-emerald-400", "text-slate-800 dark:text-slate-300",
  "text-cyan-400", "text-rose-500", "text-emerald-500",
  "text-green-500", "text-orange-500", "text-sky-500"
];

export default function LessonContentEngine({ content, lessonId, lessonTitle }: Props) {
  const [styleIndex, setStyleIndex] = useState<number | null>(null);

  useEffect(() => {
    // Pick a random style on mount as requested
    const randomIndex = Math.floor(Math.random() * STYLES.length);
    setStyleIndex(randomIndex);
  }, []);

  if (styleIndex === null) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 bg-muted/20 border border-border rounded-3xl animate-pulse">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">AI Generating Layout...</p>
      </div>
    );
  }

  const Component = STYLES[styleIndex];
  const styleName = STYLE_NAMES[styleIndex];
  const styleColor = STYLE_COLORS[styleIndex];
  const Icon = STYLE_ICONS[styleIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* AI indicator badge */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-2xl w-fit shadow-sm overflow-hidden relative">
        <motion.div 
            animate={{ x: [-100, 200] }} 
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent skew-x-12" 
        />
        <div className={`w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center ${styleColor}`}>
          <Icon className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">AI Content Engine</span>
          </div>
          <p className={`text-xs font-black ${styleColor}`}>{styleName} Rendering</p>
        </div>
        <div className="h-6 w-px bg-border mx-1" />
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">SEED_RAND_{Math.floor(Math.random() * 9999)}</span>
      </motion.div>

      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Component content={content} />
      </motion.div>
    </div>
  );
}
