"use client";

import Image from "next/image";

export default function HeroThreeScene() {
  return (
    <div className="relative h-[300px] sm:h-[360px] lg:h-[430px] w-full overflow-hidden rounded-2xl bg-white/80">
      <div className="relative h-full w-full" style={{ perspective: "1400px" }}>
        <div className="relative h-full w-full" style={{ animation: "logoFloatTilt 7s ease-in-out infinite" }}>
          <Image
            src="/logo.png"
            alt="Glovia Logo"
            fill
            priority
            className="object-contain p-6 sm:p-8"
          />
        </div>
      </div>
      <style jsx>{`
        @keyframes logoFloatTilt {
          0% {
            transform: translateY(0px) rotateX(3deg) rotateY(-5deg);
          }
          50% {
            transform: translateY(-10px) rotateX(-2deg) rotateY(5deg);
          }
          100% {
            transform: translateY(0px) rotateX(3deg) rotateY(-5deg);
          }
        }
      `}</style>
    </div>
  );
}
