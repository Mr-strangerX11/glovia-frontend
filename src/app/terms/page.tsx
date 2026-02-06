import Link from 'next/link';

export default function TermsAndConditions() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold mb-8">Terms & Conditions</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-gray-600">
          <strong>Last Updated:</strong> January 2025
        </p>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Glovia Nepal's website and services, you accept and agree to be bound by these 
            Terms and Conditions. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">2. Product Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>We strive to provide accurate product descriptions and images</li>
            <li>All products are 100% authentic and sourced from verified suppliers</li>
            <li>Prices are in Nepali Rupees (NPR) and subject to change without notice</li>
            <li>Product availability may vary</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">3. Orders and Payments</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All orders are subject to acceptance and availability</li>
            <li>We reserve the right to refuse or cancel any order</li>
            <li> be completed before order processing</li>
            <li>We accept: Cash on Delivery, eSewa, Khalti, IME Pay, and Bank Transfer</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">4. Delivery</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Delivery within Kathmandu Valley: 60 Mins</li>
            <li>Outside Valley: 2-3 business days</li>
            <li>Free delivery on orders above NPR 2,999</li>
            <li>Delivery charges: NPR 99 (Valley), NPR 149 (Outside Valley)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">5. Returns and Refunds</h2>
          <p>
            Please refer to our <Link href="/returns" className="text-primary-600 hover:underline">Returns & Refunds Policy</Link> for detailed information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">6. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are responsible for maintaining account security</li>
            <li>Provide accurate and current information</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>We reserve the right to suspend or terminate accounts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">7. Intellectual Property</h2>
          <p>
            All content on this website, including logos, images, and text, is the property of Glovia Nepal 
            and protected by copyright laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            Glovia Nepal shall not be liable for any indirect, incidental, or consequential damages arising 
            from the use of our products or services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">9. Governing Law</h2>
          <p>
            These terms are governed by the laws of Nepal. Any disputes shall be resolved in the courts of 
            Kathmandu, Nepal.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">10. Contact Information</h2>
          <ul className="list-none space-y-2">
            <li>Email: glovianepal@gmail.com</li>
            <li>Phone: +977-9700003327</li>
            <li>Address: kumarigal, Kathmandu, Nepal</li>
          </ul>
        </section>

        <div className="mt-8">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
