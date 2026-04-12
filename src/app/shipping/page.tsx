import Link from 'next/link';
import { Truck, MapPin, Clock, Package, ArrowRight, ShieldCheck, RefreshCw, Phone, Mail, AlertCircle } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-600 pt-14 pb-24">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-white/8 blur-2xl" />
        <div className="container relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 mb-5">
            <Truck className="h-3.5 w-3.5" /> Shipping Info
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Shipping Policy</h1>
          <p className="mt-3 text-blue-100/80 text-sm">Last Updated: January 2025</p>
          <p className="mt-3 text-base text-blue-100/90 leading-relaxed max-w-lg">
            We ship across Nepal to bring premium beauty products right to your doorstep.
          </p>
        </div>
      </section>

      {/* Quick delivery cards */}
      <div className="container relative z-10 -mt-10 pb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: MapPin,  color: 'text-blue-600',  bg: 'bg-blue-50',  title: 'Kathmandu Valley', time: '60 Minutes',         fee: 'NPR 99' },
            { icon: Truck,   color: 'text-sky-600',   bg: 'bg-sky-50',   title: 'Major Cities',     time: '2–3 Business Days',  fee: 'NPR 149' },
            { icon: Clock,   color: 'text-cyan-600',  bg: 'bg-cyan-50',  title: 'Remote Areas',     time: '5–7 Business Days',  fee: 'NPR 149' },
          ].map(({ icon: Icon, color, bg, title, time, fee }) => (
            <div key={title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-elevation-2 dark:bg-gray-900 dark:border-gray-800">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg} dark:bg-opacity-10`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{time}</p>
              <p className={`text-sm font-bold mt-1.5 ${color}`}>{fee}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Free shipping banner */}
      <div className="container py-4">
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 dark:bg-emerald-900/10 dark:border-emerald-800/40">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Free Shipping on Orders Above NPR 2,999</p>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-0.5">Applies to all delivery locations across Nepal.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container pb-16 max-w-4xl">
        <div className="space-y-8">

          {/* Delivery Locations */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/10">
                <MapPin className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Delivery Locations</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">We currently deliver to all districts across Nepal:</p>
            <ul className="space-y-2">
              {[
                { label: 'Kathmandu Valley', detail: 'Kathmandu, Lalitpur, Bhaktapur' },
                { label: 'Major Cities', detail: 'Pokhara, Biratnagar, Dharan, Butwal, Nepalgunj, and more' },
                { label: 'Other Districts', detail: 'All accessible areas across Nepal' },
              ].map(({ label, detail }) => (
                <li key={label} className="flex items-start gap-2.5 text-sm">
                  <div className="mt-1 h-4 w-4 shrink-0 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  </div>
                  <span><strong className="text-gray-900 dark:text-gray-100">{label}:</strong>{' '}
                    <span className="text-gray-500 dark:text-gray-400">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Order Processing */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
                <RefreshCw className="h-4.5 w-4.5 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Order Processing</h2>
            </div>
            <ul className="space-y-2.5">
              {[
                'Orders are processed within 10 minutes of confirmation',
                'Orders placed after 5 PM will be processed the next business day',
                'You\'ll receive an email confirmation once your order is shipped',
                'Track your order anytime using the tracking number provided',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-primary-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Order Tracking */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/10">
                <Package className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Order Tracking</h2>
            </div>
            <ol className="space-y-3">
              {[
                'Check your email for the tracking number',
                'Visit our Track Order page',
                'Enter your order number and email',
                'View real-time status updates',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
            <Link
              href="/track-order"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400"
            >
              Track Your Order <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          {/* Packaging + Failed Delivery */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:bg-gray-900 dark:border-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">Packaging</h2>
              <ul className="space-y-2">
                {['Eco-friendly and secure packaging', 'Bubble wrap for fragile items', 'Discreet packaging for privacy', 'Gift wrapping available on request'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:bg-gray-900 dark:border-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">Failed Delivery</h2>
              <ul className="space-y-2">
                {['We\'ll attempt delivery up to 3 times', 'You\'ll receive calls/SMS before each attempt', 'After 3 failed attempts, order is returned to us', 'Reshipping may incur additional charges'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Note about international */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:bg-amber-900/10 dark:border-amber-800/40">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-400">
              <strong>International Shipping:</strong> We currently ship within Nepal only. International shipping will be available soon. Subscribe to our newsletter to be notified!
            </p>
          </div>

          {/* Contact */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">Need Help?</h2>
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
            <p className="mt-3 text-xs text-gray-400">Hours: 10:00 AM – 7:00 PM (Sun–Sat)</p>
          </section>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-sm font-bold text-white shadow transition hover:from-primary-700 hover:to-primary-600">
              Back to Home
            </Link>
            <Link href="/track-order" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-soft transition hover:border-primary-200 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              Track Your Order <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
