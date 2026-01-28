import Link from 'next/link';

export default function ReturnsPolicy() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold mb-8">Returns & Refund Policy</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-gray-600">
          <strong>Last Updated:</strong> January 2025
        </p>

        <p className="text-lg">
          At Glovia Nepal, we want you to be completely satisfied with your purchase. If you're not happy with 
          your order, we're here to help.
        </p>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">1. Return Eligibility</h2>
          <p>You can return products within <strong>7 days</strong> of delivery if:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The product is unused and in original condition</li>
            <li>Original packaging is intact with all tags and labels</li>
            <li>Product is not damaged or tampered with</li>
            <li>You have the original invoice/receipt</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">2. Non-Returnable Items</h2>
          <p>The following items cannot be returned for hygiene and safety reasons:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Opened cosmetics and makeup products</li>
            <li>Used skincare items</li>
            <li>Products with broken seals</li>
            <li>Discounted or sale items (unless defective)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">3. How to Return</h2>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Contact Us:</strong> Email returns@glovia.com.np or call +977-1-4445555 within 7 days
            </li>
            <li>
              <strong>Provide Details:</strong> Order number, product details, and reason for return
            </li>
            <li>
              <strong>Wait for Approval:</strong> We'll review and approve eligible returns within 24 hours
            </li>
            <li>
              <strong>Ship Back:</strong> Pack the item securely and ship to our address (we'll provide)
            </li>
            <li>
              <strong>Get Refund:</strong> Receive refund within 5-7 business days after inspection
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">4. Refund Methods</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Online Payments:</strong> Refunded to original payment method</li>
            <li><strong>Cash on Delivery:</strong> Bank transfer or store credit</li>
            <li>Delivery charges are non-refundable (except for defective products)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">5. Damaged or Defective Products</h2>
          <p>If you receive a damaged or defective product:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact us immediately with photos of the damage</li>
            <li>We'll arrange free pickup</li>
            <li>Get a full refund or replacement</li>
            <li>Delivery charges will be refunded</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">6. Wrong Item Delivered</h2>
          <p>
            If you receive the wrong item, we'll arrange immediate pickup and deliver the correct product 
            at no additional cost.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">7. Exchanges</h2>
          <p>
            We currently do not offer direct exchanges. Please return the item for a refund and place a 
            new order for the desired product.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">8. Return Shipping</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Customer bears return shipping costs (unless product is defective)</li>
            <li>We recommend using trackable shipping services</li>
            <li>Glovia Nepal is not responsible for lost return packages</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">9. Contact for Returns</h2>
          <div className="bg-primary-50 p-6 rounded-lg">
            <p className="font-semibold mb-2">Returns Department</p>
            <ul className="list-none space-y-1">
              <li>📧 Email: returns@glovia.com.np</li>
              <li>📞 Phone: +977-1-4445555</li>
              <li>⏰ Hours: 10:00 AM - 6:00 PM (Sun-Fri)</li>
            </ul>
          </div>
        </section>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> This policy applies to purchases made through glovia.com.np only. 
            For purchases from retail partners, please check their respective return policies.
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/contact" className="btn-outline">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
