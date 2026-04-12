"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Eye, EyeOff, Mail, KeyRound, Lock, ArrowRight, ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";

type Step = "email" | "otp" | "password";

const STEPS: { id: Step; label: string }[] = [
  { id: "email",    label: "Email" },
  { id: "otp",      label: "Verify" },
  { id: "password", label: "Reset" },
];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep]                     = useState<Step>("email");
  const [email, setEmail]                   = useState("");
  const [otp, setOtp]                       = useState("");
  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [loading, setLoading]               = useState(false);
  const [success, setSuccess]               = useState(false);

  const currentIdx = STEPS.findIndex((s) => s.id === step);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/password/forgot", { email });
      setStep("otp");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send OTP. Please try again.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length !== 6) { setError("Please enter a valid 6-digit OTP"); return; }
    setStep("password");
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!strong.test(newPassword)) {
      setError("Password must be 8+ characters with uppercase, lowercase, number, and special character.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/password/reset", { email, otp, newPassword });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to reset password. Please try again.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 flex items-center justify-center px-4 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 shadow-colored-sm">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-xl font-black text-transparent">
              Glovia
            </span>
          </Link>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-elevation-3 dark:border-gray-800 dark:bg-gray-900">

          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {STEPS.map((s, i) => {
              const done    = i < currentIdx;
              const current = i === currentIdx;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    done    ? 'bg-emerald-500 text-white' :
                    current ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/40' :
                              'bg-gray-100 text-gray-400 dark:bg-gray-800'
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${
                    current ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
                  }`}>{s.label}</span>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-1 h-px w-8 transition-colors ${done ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Success state */}
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Password Reset!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your password has been updated. Redirecting to login…
              </p>
              <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full animate-[shrink_2.5s_linear_forwards] rounded-full bg-emerald-500" />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
                  {step === 'email'    && <Mail      className="h-7 w-7 text-primary-600 dark:text-primary-400" />}
                  {step === 'otp'      && <KeyRound  className="h-7 w-7 text-primary-600 dark:text-primary-400" />}
                  {step === 'password' && <Lock      className="h-7 w-7 text-primary-600 dark:text-primary-400" />}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {step === 'email'    && 'Forgot Password'}
                  {step === 'otp'      && 'Check Your Email'}
                  {step === 'password' && 'New Password'}
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                  {step === 'email'    && "We'll send a reset code to your email."}
                  {step === 'otp'      && `Enter the 6-digit code sent to ${email}`}
                  {step === 'password' && 'Create a strong new password.'}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/15 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Step 1 — Email */}
              {step === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="label" htmlFor="fp-email">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        id="fp-email"
                        type="email"
                        required
                        className="input pl-10"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3 justify-center">
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <><span>Send Reset Code</span><ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2 — OTP */}
              {step === 'otp' && (
                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <div>
                    <label className="label text-center block" htmlFor="fp-otp">Verification Code</label>
                    <input
                      id="fp-otp"
                      type="text"
                      required
                      inputMode="numeric"
                      className="input text-center text-3xl font-bold tracking-[0.5em] py-4 mt-1"
                      placeholder="······"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                    <p className="mt-2 text-center text-xs text-gray-400">6-digit code sent to {email}</p>
                  </div>
                  <button type="submit" disabled={loading || otp.length < 6}
                    className="btn-primary w-full py-3 justify-center disabled:opacity-50">
                    <span>Verify Code</span><ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(null); }}
                    className="flex w-full items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                </form>
              )}

              {/* Step 3 — New password */}
              {step === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="label" htmlFor="fp-newpw">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        id="fp-newpw"
                        type={showNew ? 'text' : 'password'}
                        required
                        className="input pl-10 pr-11"
                        placeholder="Create a strong password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                        {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">8+ chars · uppercase · lowercase · number · special char</p>
                  </div>
                  <div>
                    <label className="label" htmlFor="fp-confirmpw">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        id="fp-confirmpw"
                        type={showConfirm ? 'text' : 'password'}
                        required
                        className={`input pl-10 pr-11 ${
                          confirmPassword && confirmPassword !== newPassword ? 'border-red-400' :
                          confirmPassword && confirmPassword === newPassword ? 'border-emerald-400' : ''
                        }`}
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                        {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                    )}
                    {confirmPassword && confirmPassword === newPassword && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                      </p>
                    )}
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3 justify-center">
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <><span>Reset Password</span><ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Remember your password?{' '}
          <Link href="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
