'use client';

import { useState } from 'react';
import { Send, MessageCircle, Mail, Phone, HelpCircle, Package, RotateCcw, User, Shield, Clock, Globe } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    orderId: '',
    topic: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setFormData({ fullName: '', email: '', orderId: '', topic: '', message: '' });
      
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Online 24/7
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Need Help? We're Online 24/7
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Message us anytime — support replies within a few hours.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Contact Form - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Smart Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
                  <p className="text-gray-600">We'll get back to you shortly</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="Your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                      Order ID <span className="text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="orderId"
                      name="orderId"
                      value={formData.orderId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="#12345"
                    />
                  </div>

                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                      Topic *
                    </label>
                    <select
                      id="topic"
                      name="topic"
                      required
                      value={formData.topic}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
                    >
                      <option value="">Select a topic</option>
                      <option value="support">Support</option>
                      <option value="refund">Refund</option>
                      <option value="sales">Sales</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Message sent successfully! We'll reply soon.</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <span className="font-medium">Something went wrong. Please try again.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Help Center Shortcut */}
            <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-2xl p-8 border border-primary-100">
              <div className="flex items-start gap-3 mb-6">
                <div className="text-2xl">👉</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Before contacting us, check our Help Center
                  </h3>
                  <p className="text-gray-600">Find quick answers to common questions</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href="/shipping"
                  className="bg-white hover:bg-gray-50 p-4 rounded-xl border border-gray-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="font-semibold text-gray-900">Shipping Info</div>
                  </div>
                </a>

                <a
                  href="/returns"
                  className="bg-white hover:bg-gray-50 p-4 rounded-xl border border-gray-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition">
                      <RotateCcw className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="font-semibold text-gray-900">Returns & Refund</div>
                  </div>
                </a>

                <a
                  href="/account"
                  className="bg-white hover:bg-gray-50 p-4 rounded-xl border border-gray-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="font-semibold text-gray-900">Account Help</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Instant Contact Options */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Support</h3>
              <p className="text-gray-600 text-sm mb-6">Get help right away</p>

              <div className="space-y-3">
                <a
                  href="https://wa.me/9779700003327"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-xl transition shadow-md hover:shadow-lg group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">WhatsApp Support</div>
                    <div className="text-sm text-green-100">Chat with us now</div>
                  </div>
                </a>

                <a
                  href="mailto:support@glovia.com.np"
                  className="flex items-center gap-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white p-4 rounded-xl transition shadow-md hover:shadow-lg group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Email Support</div>
                    <div className="text-sm text-primary-100">glovianepal@gmail.com</div>
                  </div>
                </a>

                <button
                  onClick={() => alert('Call request feature coming soon!')}
                  className="w-full flex items-center gap-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 rounded-xl transition shadow-md hover:shadow-lg group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Call Request</div>
                    <div className="text-sm text-purple-100">We'll call you back</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Trust Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why trust us?</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm mb-1">Privacy Assurance</div>
                    <div className="text-gray-600 text-sm">Your information stays secure with us.</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm mb-1">Response Time Promise</div>
                    <div className="text-gray-600 text-sm">Average reply time: under 2 hours.</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm mb-1">Social Proof</div>
                    <div className="text-gray-600 text-sm">Serving customers worldwide since 2024.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday - Friday</span>
                  <span className="font-semibold text-gray-900">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-semibold text-gray-900">10:00 AM - 4:00 PM</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Online support available 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
