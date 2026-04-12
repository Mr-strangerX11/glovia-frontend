import Link from 'next/link';
import { RefreshCw, CheckCircle2, XCircle, ArrowRight, Package, CreditCard, AlertCircle, Phone, Mail } from 'lucide-react';

export default function ReturnsPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 pt-14 pb-24">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-white/8 blur-2xl" />
        <div className="container relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 mb-5">
            <RefreshCw className="h-3.5 w-3.5" /> Returns & Refunds
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Returns &amp; Refund Policy</h1>
          <p className="mt-3 text-emerald-100/80 text-sm">Last Updated: January 2025</p>
          <p className="mt-3 text-base text-emerald-100/90 leading-relaxed max-w-lg">
            We want you to be completely satisfied with your purchase. If you&apos;re not happy, we&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Quick stats */}
      <div className="container relative z-10 -mt-10 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '7 Days', label: 'Return Window', color: 'text-emerald-600' },
            { value: '24 hrs', label: 'Approval Time', color: 'text-blue-600' },
            { value: '5–7 Days', label: 'Refund Timeline', color: 'text-violet-600' },
          ].map(({ value, label, color }) => (
            <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-elevation-2 dark:bg-gray-900 dark:border-gray-800">
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container pb-16 max-w-4xl">
        <div className="space-y-6">

          {/* Eligibility */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/10">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Return Eligibility</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              You can return products within <strong className="text-gray-900 dark:text-gray-100">7 days</strong> of delivery if:
            </p>
            <ul className="space-y-2">
              {[
                'The product is unused and in original condition',
                'Original packaging is intact with all tags and labels',
                'Product is not damaged or tampered with',
                'You have the original invoice/receipt',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Non-returnable */}
          <section className="rounded-2xl border border-red-100 bg-red-50/50 p-6 dark:bg-red-900/5 dark:border-red-900/30">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-4.5 w-4.5 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Non-Returnable Items</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">The following cannot be returned for hygiene and safety reasons:</p>
            <ul className="space-y-2">
              {[
                'Opened cosmetics and makeup products',
                'Used skincare items',
                'Products with broken seals',
                'Discounted or sale items (unless defective)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* How to return */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/10">
                <Package className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">How to Return</h2>
            </div>
            <ol className="space-y-3">
              {[
                { title: 'Contact Us', detail: 'Email glovianepal@gmail.com or call +977-9700003327 within 2–3 days' },
                { title: 'Provide Details', detail: 'Share your order number, product details, and reason for return' },
                { title: 'Wait for Approval', detail: 'We\'ll review and approve eligible returns within 24 hours' },
                { title: 'Ship Back', detail: 'Pack the item securely and ship to our address (we\'ll provide)' },
                { title: 'Get Refund', detail: 'Receive refund within 5–7 business days after inspection' },
              ].map(({ title, detail }, i) => (
                <li key={title} className="flex items-start gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {i + 1}
                  </span>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">{title}:</strong>{' '}
                    <span className="text-gray-500 dark:text-gray-400">{detail}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Refund + Damaged — side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-900/10">
                  <CreditCard className="h-4.5 w-4.5 text-violet-600" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Refund Methods</h2>
              </div>
              <ul className="space-y-2">
                {[
                  { label: 'Online Payments', detail: 'Refunded to original payment method' },
                  { label: 'Cash on Delivery', detail: 'Bank transfer or store credit' },
                  { label: 'Note', detail: 'Delivery charges are non-refundable (except for defective products)' },
                ].map(({ label, detail }) => (
                  <li key={label} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                    <span><strong className="text-gray-800 dark:text-gray-200">{label}:</strong> {detail}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 dark:bg-amber-900/5 dark:border-amber-900/30">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/20">
                  <AlertCircle className="h-4.5 w-4.5 text-amber-600" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Damaged / Defective</h2>
              </div>
              <ul className="space-y-2">
                {[
                  'Contact us immediately with photos',
                  'We\'ll arrange free pickup',
                  'Full refund or replacement',
                  'Delivery charges also refunded',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Note */}
          <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:bg-gray-900 dark:border-gray-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-gray-400 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-gray-800 dark:text-gray-200">Note:</strong> This policy applies to purchases made through glovia.com.np only. For purchases from retail partners, please check their respective return policies.
            </p>
          </div>

          {/* Contact */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">Returns Department</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href="mailto:glovianepal@gmail.com" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm transition hover:border-primary-200 hover:bg-primary-50 dark:bg-gray-800 dark:border-gray-700 group">
                <Mail className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                <span className="text-gray-600 dark:text-gray-400 group-hover:text-primary-700 transition-colors">glovianepal@gmail.com</span>
              </a>
              <a href="tel:+9779700003327" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm transition hover:border-primary-200 hover:bg-primary-50 dark:bg-gray-800 dark:border-gray-700 group">
                <Phone className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                <span className="text-gray-600 dark:text-gray-400 group-hover:text-primary-700 transition-colors">+977-9700003327</span>
              </a>
            </div>
            <p className="mt-3 text-xs text-gray-400">Hours: 10:00 AM – 6:00 PM (Sun–Fri)</p>
          </section>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-sm font-bold text-white shadow transition hover:from-primary-700 hover:to-primary-600">
              Back to Home
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-soft transition hover:border-primary-200 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              Contact Support <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
