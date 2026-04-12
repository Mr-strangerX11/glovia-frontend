"use client";

import { FormEvent, useState, useRef, KeyboardEvent, ClipboardEvent, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/authStore";
import { Mail, CheckCircle2, RefreshCw, ShoppingBag, ArrowRight } from "lucide-react";

function VerifyOtpContent() {
  const router      = useRouter();
  const params      = useSearchParams();
  const { setUser } = useAuthStore();

  const email   = params?.get("email")   || "";
  const purpose = params?.get("purpose") || "verification";

  const [otp,          setOtp]          = useState<string[]>(["","","","","",""]);
  const [error,        setError]        = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [resending,    setResending]    = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [resendMsg,    setResendMsg]    = useState<string | null>(null);
  const [timeLeft,     setTimeLeft]     = useState(120);

  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => (p <= 1 ? (clearInterval(t), 0) : p - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp];
    next[i] = v.slice(-1);
    setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    const next = [...otp];
    digits.split('').forEach((d, idx) => { if (idx < 6) next[idx] = d; });
    setOtp(next);
    refs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter the complete 6-digit code.'); return; }
    setLoading(true);
    try {
      const endpoint = purpose === 'password-reset' ? '/auth/password/verify-otp'
                     : purpose === 'login'          ? '/auth/login/verify-otp'
                     :                               '/auth/verify-email';
      const response = await api.post(endpoint, { email, otp: code });
      setSuccess(true);
      setTimeout(() => {
        if (purpose === 'password-reset') {
          router.push(`/auth/reset-password?email=${email}&otp=${code}`);
        } else if (purpose === 'login') {
          const { accessToken, refreshToken, user } = response.data || {};
          if (accessToken)           Cookies.set('access_token',  accessToken,            { expires: 7 });
          if (refreshToken)          Cookies.set('refresh_token',  refreshToken,           { expires: 30 });
          if (user?.id || user?._id) Cookies.set('user_id', String(user.id || user._id),  { expires: 30 });
          if (user)                  setUser(user);
          router.push('/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 1400);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid code. Please try again.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); setError(null); setResendMsg(null);
    try {
      const endpoint = purpose === 'password-reset' ? '/auth/password/resend-otp'
                     : purpose === 'login'          ? '/auth/login/resend-otp'
                     :                               '/auth/resend-otp';
      await api.post(endpoint, { email });
      setResendMsg('A new code has been sent to your email.');
      setOtp(['','','','','','']);
      setTimeLeft(120);
      refs.current[0]?.focus();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to resend. Please try again.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setResending(false);
    }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50/20 px-4 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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

          {success ? (
            /* ─ Success ─ */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Verified!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting you now…</p>
              <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full w-full origin-left animate-[shrink_1.4s_linear_forwards] rounded-full bg-emerald-500" />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
                  <Mail className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Check your email</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  We sent a 6-digit code to
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {email || 'your email'}
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/15 dark:text-red-400">
                  {error}
                </div>
              )}
              {resendMsg && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/15 dark:text-emerald-400">
                  {resendMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP boxes */}
                <div>
                  <label className="mb-3 block text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Enter verification code
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { refs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        disabled={loading}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKey(i, e)}
                        onPaste={i === 0 ? handlePaste : undefined}
                        className={`h-14 w-11 rounded-xl border-2 bg-gray-50 text-center text-2xl font-bold transition-all focus:outline-none focus:ring-2 dark:bg-gray-800 sm:w-12 ${
                          digit
                            ? 'border-primary-500 bg-primary-50 text-primary-700 focus:ring-primary-500/20 dark:bg-primary-900/20 dark:text-primary-300'
                            : 'border-gray-200 text-gray-900 focus:border-primary-400 focus:ring-primary-400/20 dark:border-gray-700 dark:text-gray-100'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Progress dots */}
                  <div className="mt-3 flex justify-center gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`h-1 w-5 rounded-full transition-all ${i < filled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                </div>

                {/* Timer */}
                <div className="text-center">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Code expires in{' '}
                      <span className="font-bold text-primary-600 dark:text-primary-400 tabular-nums">{fmt(timeLeft)}</span>
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-red-500">Code expired — please request a new one.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || filled < 6 || timeLeft === 0}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <><span>Verify Code</span><ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              {/* Resend */}
              <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || timeLeft > 110}
                    className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:text-primary-400"
                  >
                    {resending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
                </p>
                <p className="mt-3 text-center text-sm text-gray-400 dark:text-gray-500">
                  Need help?{' '}
                  <Link href="/contact" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    Contact support
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
