"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Mail, Lock, Phone, User, ShoppingBag, Star, Shield, Truck, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.phone.length !== 10 || !/^[0-9]{10}$/.test(form.phone)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!strong.test(form.password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = form;
      await register(registerData);
      // Redirect to OTP verification page for email verification
      router.push(`/auth/verify-otp?email=${encodeURIComponent(form.email)}&purpose=verification`);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Unable to register. Please try again.";
      setError(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  const passwordChecks = [
    { label: "8+ characters", ok: form.password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(form.password) },
    { label: "Lowercase letter", ok: /[a-z]/.test(form.password) },
    { label: "Number", ok: /\d/.test(form.password) },
    { label: "Special character", ok: /[!@#$%^&*]/.test(form.password) },
  ];
  const passwordStrength = passwordChecks.filter((c) => c.ok).length;
  const strengthColors = ["bg-red-400", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-green-500"];
  const strengthLabels = ["", "Weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Glovia Market place</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Join thousands of<br />happy shoppers
            </h2>
            <p className="text-pink-100 leading-relaxed">
              Discover authentic beauty, skincare & wellness products shipped across Nepal.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Star, text: "10,000+ curated products" },
              { icon: Shield, text: "100% authentic brands" },
              { icon: Truck, text: "Fast delivery everywhere" },
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

        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <p className="text-white/90 text-sm italic leading-relaxed">
            &ldquo;I love how easy it is to find genuine beauty products. Glovia Market place is my go-to!&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Sita Rai</p>
              <p className="text-white/60 text-xs">Verified Shopper</p>
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
      <div className="w-full lg:w-7/12 flex items-center justify-center bg-white px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg">Glovia Market place</span>
          </div>

          <div className="mb-7">
            <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-1.5">Start your beauty journey today — it&apos;s free</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5" htmlFor="firstName">First name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-[17px] h-[17px]" />
                  <input
                    id="firstName"
                    required
                    className="input pl-10"
                    placeholder="Aarav"
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5" htmlFor="lastName">Last name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-[17px] h-[17px]" />
                  <input
                    id="lastName"
                    required
                    className="input pl-10"
                    placeholder="Khadka"
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-[17px] h-[17px]" />
                <input
                  id="email"
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5" htmlFor="phone">Phone number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-[17px] h-[17px]" />
                <input
                  id="phone"
                  type="tel"
                  required
                  className="input pl-10"
                  placeholder="98XXXXXXXX"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleChange("phone", value);
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">10-digit Nepal mobile number</p>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-[17px] h-[17px]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input pl-10 pr-11"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
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
              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= passwordStrength ? strengthColors[passwordStrength] : "bg-gray-200"
                        }`}
                      />
                    ))}
                    <span className={`text-xs font-semibold ml-2 ${
                      passwordStrength >= 4 ? "text-green-600" : passwordStrength >= 3 ? "text-yellow-600" : "text-red-500"
                    }`}>{strengthLabels[passwordStrength]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {passwordChecks.map(({ label, ok }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3 h-3 flex-shrink-0 ${ok ? "text-green-500" : "text-gray-300"}`} />
                        <span className={`text-xs ${ok ? "text-green-700" : "text-gray-400"}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5" htmlFor="confirmPassword">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-[17px] h-[17px]" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`input pl-10 pr-11 ${
                    form.confirmPassword && form.confirmPassword !== form.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : form.confirmPassword && form.confirmPassword === form.password
                      ? "border-green-300 focus:border-green-400"
                      : ""
                  }`}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {form.confirmPassword && form.confirmPassword === form.password && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-gray-400 font-medium">Already have an account?</span>
            </div>
          </div>

          <Link
            href="/auth/login"
            className="w-full py-3 px-6 border-2 border-gray-200 hover:border-rose-300 text-gray-700 hover:text-rose-600 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Sign in instead
          </Link>

          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
