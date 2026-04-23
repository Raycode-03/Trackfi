"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { features, featuresHeading } from "@/lib/constants/landing";
import { useGsapFadeUp } from "@/hooks/useGsapAnimation";

gsap.registerPlugin(ScrollTrigger);

export function FeaturesSection() {
  const titleRef = useGsapFadeUp();
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardsRef.current.forEach((el, index) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "bottom top",
            toggleActions: "play none none reverse",
          },
        },
      );
    });
  }, []);

  return (
    <section className="bg-[#0a0a0a] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            {featuresHeading.title}
          </h2>
          <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto">
            {featuresHeading.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
                className={`${feature.span} bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-orange-500/20 hover:bg-white/[0.05] transition-all duration-300`}
              >
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-orange-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {feature.description}
                </p>
                {feature.image && (
                  <div className="mt-6 rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
