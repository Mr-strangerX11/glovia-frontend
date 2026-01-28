export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container py-12 space-y-6">
        <div>
          <p className="text-sm text-gray-500">About</p>
          <h1 className="text-3xl font-bold">About Glovia Nepal</h1>
          <p className="text-gray-600 max-w-3xl mt-3">
            Glovia Nepal is a premium beauty and cosmetics destination tailored for Nepali customers. We curate skincare, haircare, and makeup products with a focus on authenticity, fast delivery, and customer delight.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[{
            title: "Authentic Products",
            desc: "We source directly from trusted brands to ensure originality.",
          }, {
            title: "Fast Delivery",
            desc: "Express delivery options to get your essentials quickly.",
          }, {
            title: "Care for Nepal",
            desc: "Products and routines tuned for Nepali skin and climate.",
          }].map((item) => (
            <div key={item.title} className="card p-6 space-y-2">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
