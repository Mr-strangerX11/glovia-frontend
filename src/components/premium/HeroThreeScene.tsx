"use client";

import Image from "next/image";

export default function HeroThreeScene() {
  return (
    <div className="relative h-[300px] sm:h-[360px] lg:h-[430px] w-full overflow-hidden rounded-2xl bg-white/80">
      <Image
        src="/glovia-logo.png"
        alt="Glovia Logo"
        fill
        priority
        className="object-contain p-6 sm:p-8"
      />
    </div>
  );
}
