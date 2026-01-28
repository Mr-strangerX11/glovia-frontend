import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-gray-600">
          <strong>Last Updated:</strong> January 2025
        </p>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p>
            At Glovia Nepal, we collect the following information when you use our services:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Personal information (name, email, phone number)</li>
            <li>Delivery addresses and location data</li>
            <li>Payment information (processed securely through payment gateways)</li>
            <li>Order history and preferences</li>
            <li>Device and browser information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use your information to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about orders and promotions</li>
            <li>Improve our products and services</li>
            <li>Personalize your shopping experience</li>
            <li>Prevent fraud and ensure security</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">3. Data Protection</h2>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>SSL encryption for all data transmission</li>
            <li>Secure payment processing through certified gateways</li>
            <li>Regular security audits and updates</li>
            <li>Limited employee access to personal data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">4. Cookies and Tracking</h2>
          <p>
            We use cookies to enhance your browsing experience. You can control cookie settings in your browser.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">5. Third-Party Services</h2>
          <p>
            We work with trusted third parties for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Payment processing (eSewa, Khalti, IME Pay)</li>
            <li>Delivery services</li>
            <li>Analytics and marketing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">6. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Request corrections to your data</li>
            <li>Request deletion of your account</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">7. Contact Us</h2>
          <p>
            For privacy concerns or questions, contact us at:
          </p>
          <ul className="list-none space-y-2">
            <li>Email: privacy@glovia.com.np</li>
            <li>Phone: +977-1-4445555</li>
            <li>Address: Thamel, Kathmandu, Nepal</li>
          </ul>
        </section>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            By using Glovia Nepal's services, you agree to this Privacy Policy. We may update this policy periodically, 
            and we will notify you of significant changes.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
