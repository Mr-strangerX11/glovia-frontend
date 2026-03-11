"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Mail, Lock, ShoppingBag, Star, Shield, Truck, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Unable to login. Please try again.";
      setError(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Glovia Market place</span>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Nepal&apos;s finest<br />beauty marketplace
            </h2>
            <p className="text-pink-100 text-lg leading-relaxed">
              Shop premium beauty, skincare & wellness products delivered right to your door.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Star, text: "10,000+ curated beauty products" },
              { icon: Shield, text: "100% authentic, verified brands" },
              { icon: Truck, text: "Fast delivery across Nepal" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <p className="text-white/90 text-sm italic leading-relaxed">
            &ldquo;Best beauty shopping experience in Nepal. Genuine products, fast delivery!&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Priya Sharma</p>
              <p className="text-white/60 text-xs">Verified Customer</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-300 fill-yellow-300" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg">Glovia Market place</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1.5">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 w-[18px] h-[18px]" />
                <input
                  id="email"
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700" htmlFor="password">Password</label>
                <Link href="/auth/forgot-password" className="text-sm font-semibold text-rose-500 hover:text-rose-600">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input pl-10 pr-11"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-gray-400 font-medium">New to Glovia?</span>
            </div>
          </div>

          <Link
            href="/auth/register"
            className="w-full py-3 px-6 border-2 border-gray-200 hover:border-rose-300 text-gray-700 hover:text-rose-600 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Create a free account
          </Link>

          <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
