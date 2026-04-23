"use client";
import React from "react";
import { Check } from "lucide-react";
import Image from "next/image";
import { bullets, marketCoverage } from "@/lib/constants/landing";
import { useGsapFadeLeft, useGsapFadeDown ,  useGsapFadeRight } from "@/hooks/useGsapAnimation";

export function MarketCoverageSection() {
  const imageRef = useGsapFadeDown();
  const textRef = useGsapFadeRight();

  return (
    <section className="bg-[#0a0a0a] py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col justify-evenly md:flex-row items-center gap-16">
        {/* Left — image */}
        <div ref={imageRef} className=" relative">
          <div className="absolute inset-0 bg-orange-500/5 rounded-3xl blur-2xl scale-110" />
          <Image
            src="/images/image1.jpg"
            alt="Live coin prices"
            className="relative z-10 w-full rounded-2xl border border-white/10 shadow-2xl"
            height={20}
            width={20}
          />
        </div>

        {/* Right — text */}
        <div ref={textRef} className=" max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6">
            {marketCoverage.badge}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            {marketCoverage.heading}
          </h2>
          <p className="text-white/40 text-base leading-relaxed mb-8">
            {marketCoverage.description}
          </p>
          <ul className="space-y-3">
            {bullets.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-white/70 text-sm"
              >
                <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-orange-400" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
