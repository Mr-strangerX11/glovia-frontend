export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 pt-10 pb-20">
        <div className="container text-white">
          <p className="text-rose-200 text-sm font-medium mb-1">About</p>
          <h1 className="text-3xl font-bold">About Glovia Market place</h1>
          <p className="text-pink-100 max-w-3xl mt-3 text-sm sm:text-base">
            A premium beauty marketplace tailored for Nepali customers with authentic products, fast delivery, and trusted support.
          </p>
        </div>
      </div>

      <div className="container -mt-10 pb-12 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 sm:p-8">
          <p className="text-gray-600 max-w-4xl leading-relaxed">
            Glovia Market place is a premium beauty and cosmetics destination tailored for Nepali customers. We curate skincare, haircare, and makeup products with a focus on authenticity, fast delivery, and customer delight.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Authentic Products",
              desc: "We source directly from trusted brands to ensure originality.",
            },
            {
              title: "Fast Delivery",
              desc: "Express delivery options to get your essentials quickly.",
            },
            {
              title: "Care for Nepal",
              desc: "Products and routines tuned for Nepali skin and climate.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
