import Link from 'next/link';
import { Wallet, ArrowRight, Sparkles, Clock, ShieldCheck, CreditCard } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 pt-14 pb-24">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-white/8 blur-2xl" />
        <div className="container relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Coming Soon
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Glovia Wallet</h1>
          <p className="mt-4 text-lg text-purple-100/80 leading-relaxed">
            A smarter way to pay. Store credit, instant refunds, and exclusive wallet-only offers — all in one place.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-purple-700 shadow-lg transition hover:bg-purple-50"
          >
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Feature cards pulled up */}
      <div className="container relative z-10 -mt-10 pb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: CreditCard,  color: 'text-violet-600', bg: 'bg-violet-50', title: 'Instant Payments', desc: 'Pay at checkout with one tap — no card entry needed.' },
            { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Secure & Encrypted', desc: 'Your balance is protected with bank-grade security.' },
            { icon: Clock,       color: 'text-blue-600',   bg: 'bg-blue-50',   title: 'Instant Refunds',  desc: 'Refunds land in your wallet immediately upon approval.' },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-elevation-2 dark:bg-gray-900 dark:border-gray-800">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${bg} dark:bg-opacity-10`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">{title}</h3>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Coming soon banner */}
        <div className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 p-10 text-center shadow-elevation-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Wallet Feature Coming Soon</h2>
          <p className="mt-2 text-sm text-white/60 max-w-sm mx-auto">
            We&apos;re building something great. Sign up to be notified when Glovia Wallet launches.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-7 py-3 text-sm font-bold text-white shadow transition hover:from-violet-600 hover:to-purple-600"
          >
            Stay Updated <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
