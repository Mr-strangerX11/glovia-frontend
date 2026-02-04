import Link from 'next/link';

export default function ShippingPolicy() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold mb-8">Shipping Policy</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-gray-600">
          <strong>Last Updated:</strong> January 2025
        </p>

        <p className="text-lg">
          We ship across Nepal to bring premium beauty products right to your doorstep. Here's everything 
          you need to know about our shipping process.
        </p>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">1. Delivery Locations</h2>
          <p>We currently deliver to all districts across Nepal:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Kathmandu Valley:</strong> Kathmandu, Lalitpur, Bhaktapur</li>
            <li><strong>Major Cities:</strong> Pokhara, Biratnagar, Dharan, Butwal, Nepalgunj, etc.</li>
            <li><strong>Other Districts:</strong> All accessible areas across Nepal</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">2. Delivery Timeline</h2>
          <div className="bg-primary-50 p-6 rounded-lg space-y-3">
            <div>
              <p className="font-semibold">📍 Within Kathmandu Valley</p>
              <p className="text-sm">60 Mins According to Your Location</p>
            </div>
            <div>
              <p className="font-semibold">📍 Major Cities Outside Valley</p>
              <p className="text-sm">2-3 business days</p>
            </div>
            <div>
              <p className="font-semibold">📍 Remote Areas</p>
              <p className="text-sm">5-7 business days</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            *Business days exclude Saturdays, government holidays, and local holidays
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">3. Shipping Charges</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left border-b">Location</th>
                  <th className="px-6 py-3 text-left border-b">Shipping Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4">Kathmandu Valley</td>
                  <td className="px-6 py-4">NPR 99</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4">Outside Kathmandu Valley</td>
                  <td className="px-6 py-4">NPR 149</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="px-6 py-4 font-semibold">Orders above NPR 3,000</td>
                  <td className="px-6 py-4 font-semibold text-green-600">FREE 🎉</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">4. Order Processing</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Orders are processed within 10 mins of confirmation</li>
            <li>Orders placed after 5 PM will be processed the next business day</li>
            <li>You'll receive an email confirmation once your order is shipped</li>
            <li>Track your order anytime using the tracking number provided</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">5. Order Tracking</h2>
          <p>Stay updated on your order:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Check your email for the tracking number</li>
            <li>Visit our <Link href="/track-order" className="text-primary-600 hover:underline">Track Order</Link> page</li>
            <li>Enter your order number and email</li>
            <li>View real-time status updates</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">7. Delivery Instructions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Please provide accurate delivery address with landmarks</li>
            <li>Ensure someone is available to receive the package</li>
            <li>Delivery person will contact you before delivery</li>
            <li>Check the package before accepting delivery</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">8. Failed Delivery</h2>
          <p>If delivery fails:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We'll attempt delivery up to 3 times</li>
            <li>You'll receive calls/SMS before each attempt</li>
            <li>After 3 failed attempts, order will be returned to us</li>
            <li>Reshipping may incur additional charges</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">9. Packaging</h2>
          <p>We ensure your products arrive safely:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Eco-friendly and secure packaging</li>
            <li>Bubble wrap for fragile items</li>
            <li>Discreet packaging for privacy</li>
            <li>Gift wrapping available on request</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">10. International Shipping</h2>
          <p>
            We currently ship within Nepal only. International shipping will be available soon. 
            Subscribe to our newsletter to be notified!
          </p>
        </section>

        <div className="mt-12 p-6 bg-primary-50 rounded-lg">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm mb-3">Contact our customer service team:</p>
          <ul className="list-none space-y-1 text-sm">
            <li>📧 Email: glovianepal.com</li>
            <li>📞 Phone: +977-9700003327</li>
            <li>⏰ Hours: 10:00 AM - 7:00 PM (Sun-sat)</li>
          </ul>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/track-order" className="btn-outline">
            Track Your Order
          </Link>
        </div>
      </div>
    </div>
  );
}
