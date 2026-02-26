"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, KeyRound } from "lucide-react";
import Link from "next/link";

type Step = "email" | "code" | "reset" | "done";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success("Reset code sent to your email!");
    setStep("code");
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...code];
    updated[index] = value;
    setCode(updated);
    if (value && index < 5) {
      (document.getElementById(`digit-${index + 1}`) as HTMLInputElement)?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      (document.getElementById(`digit-${index - 1}`) as HTMLInputElement)?.focus();
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.join("").length !== 6) { toast.error("Enter the full 6-digit code."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    if (code.join("") === "123456") {
      setStep("reset");
    } else {
      toast.error("Invalid code. For demo, use: 123456");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) { toast.error("Please fill in both fields."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success("Password updated successfully!");
    setStep("done");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #7c3aed44, transparent)" }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #2563eb44, transparent)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-2xl font-extrabold brand-gradient-text">INTELLIX</span>
            <span className="text-2xl font-extrabold text-foreground">LEARN</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl shadow-2xl shadow-violet-500/10 overflow-hidden">
          <div className="brand-gradient p-6 text-white text-center">
            <KeyRound className="w-8 h-8 mx-auto mb-2 opacity-90" />
            <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
            <p className="text-white/80 text-sm">
              {step === "email" && "Enter your email to receive a reset code"}
              {step === "code" && "Enter the 6-digit code (demo: 123456)"}
              {step === "reset" && "Create your new password"}
              {step === "done" && "Your password has been updated"}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 py-4 px-8 bg-muted/30">
            {(["email", "code", "reset", "done"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s ? "brand-gradient text-white shadow-md" :
                  ["email","code","reset","done"].indexOf(step) > i ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {["email","code","reset","done"].indexOf(step) > i ? "✓" : i + 1}
                </div>
                {i < 3 && <div className={`w-6 h-0.5 ${["email","code","reset","done"].indexOf(step) > i ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.form key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full brand-gradient text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 disabled:opacity-70">
                    {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <>Send Reset Code <ArrowRight className="w-4 h-4" /></>}
                  </motion.button>
                  <Link href="/signin" className="text-center text-sm text-primary hover:underline">Back to Sign In</Link>
                </motion.form>
              )}

              {step === "code" && (
                <motion.form key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleCodeSubmit} className="flex flex-col gap-6">
                  <p className="text-sm text-muted-foreground text-center">Code sent to <span className="font-semibold text-foreground">{email}</span></p>
                  <div className="flex gap-2 justify-center">
                    {code.map((digit, i) => (
                      <input key={i} id={`digit-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        className="w-11 h-12 text-center text-xl font-bold bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-all" />
                    ))}
                  </div>
                  <motion.button type="submit" disabled={loading || code.join("").length !== 6} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full brand-gradient text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 disabled:opacity-50">
                    {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <>Verify Code <ArrowRight className="w-4 h-4" /></>}
                  </motion.button>
                </motion.form>
              )}

              {step === "reset" && (
                <motion.form key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleResetSubmit} className="flex flex-col gap-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type={showPass ? "text" : "password"} placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full brand-gradient text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 disabled:opacity-70">
                    {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <>Update Password <ArrowRight className="w-4 h-4" /></>}
                  </motion.button>
                </motion.form>
              )}

              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 py-4">
                  <div className="w-16 h-16 brand-gradient rounded-full flex items-center justify-center shadow-xl shadow-violet-500/30">
                    <CheckCircle2 className="w-9 h-9 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">All Done!</h3>
                    <p className="text-sm text-muted-foreground">Your password has been reset successfully.</p>
                  </div>
                  <motion.button onClick={() => router.push("/signin")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full brand-gradient text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30">
                    Go to Sign In <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
