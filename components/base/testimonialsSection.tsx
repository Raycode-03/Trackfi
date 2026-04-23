"use client";
import React from "react";
import { Star } from "lucide-react";
import { testimonials, testimonialsHeading } from "@/lib/constants/landing";
import { useGsapFadeUp } from "@/hooks/useGsapAnimation";

export function TestimonialsSection() {
  const titleRef = useGsapFadeUp();
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
            {testimonialsHeading.eyebrow}
          </p>
          <h2
            ref={titleRef}
            className="text-3xl md:text-5xl font-bold text-white"
          >
            {testimonialsHeading.title}
          </h2>
        </div>
      </div>

      <div className="overflow-hidden w-full">
        <div className="flex gap-4 w-max animate-marquee">
          {doubled.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[300px] bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-orange-500/20 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-3.5 h-3.5 fill-orange-400 text-orange-400"
                  />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                &quot;{t.text}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
