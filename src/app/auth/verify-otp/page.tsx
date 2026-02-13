"use client";

import { FormEvent, useState, useRef, KeyboardEvent, ClipboardEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const purpose = searchParams.get("purpose") || "verification"; // verification, password-reset, login

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter a complete 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      let endpoint = "/auth/verify-email";
      
      // Different endpoints based on purpose
      if (purpose === "password-reset") {
        endpoint = "/auth/password/verify-otp";
      } else if (purpose === "login") {
        endpoint = "/auth/login/verify-otp";
      }

      const response = await api.post(endpoint, {
        email,
        otp: otpCode,
      });

      setSuccessMessage("OTP verified successfully!");
      
      // Redirect based on purpose
      setTimeout(() => {
        if (purpose === "password-reset") {
          router.push(`/auth/reset-password?email=${email}&otp=${otpCode}`);
        } else if (purpose === "login") {
          // Store token and redirect to dashboard
          if (response.data?.token) {
            localStorage.setItem("token", response.data.token);
          }
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Invalid OTP. Please try again.";
      setError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let endpoint = "/auth/resend-otp";
      
      if (purpose === "password-reset") {
        endpoint = "/auth/password/resend-otp";
      } else if (purpose === "login") {
        endpoint = "/auth/login/resend-otp";
      }

      await api.post(endpoint, { email });
      setSuccessMessage("OTP resent successfully! Check your email.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to resend OTP. Please try again.";
      setError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-lg">
        <div className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Verify Your Email</h1>
          <p className="text-sm text-gray-600">
            We've sent a 6-digit code to
          </p>
          <p className="text-sm font-semibold text-gray-900">{email || "your email"}</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-green-50 text-green-700 px-4 py-3 text-sm">
            {successMessage}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 text-center block">
              Enter OTP
            </label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="space-y-3">
          <p className="text-center text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="text-primary-600 font-semibold hover:text-primary-700 disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend OTP"}
            </button>
          </p>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Need help?{" "}
              <Link href="/contact" className="text-primary-600 font-semibold hover:text-primary-700">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
