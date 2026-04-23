"use client";
import React, { useRef, useEffect } from "react";
import { Check } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { plans, pricingHeading } from "@/lib/constants/landing";
import Link from "next/link";
import { useGsapFadeUp } from "@/hooks/useGsapAnimation";

gsap.registerPlugin(ScrollTrigger);

export function PricingSection() {
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
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
            {pricingHeading.eyebrow}
          </p>
          <h2
            ref={titleRef}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            {pricingHeading.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className={`relative rounded-2xl p-8 border transition-all duration-300 flex flex-col ${
                plan.highlight
                  ? "bg-orange-500/10 border-orange-500/40 shadow-lg shadow-orange-500/10"
                  : "bg-white/[0.03] border-white/10 hover:border-white/20"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-orange-500 text-black text-xs font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-white/40 text-sm mb-1">{plan.name}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-white/40 text-sm mb-1">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-white/30 text-xs mt-1">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-white/60 text-sm"
                  >
                    <div className="w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-orange-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.link}>
                <button
                  className={`mt-auto w-full py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    plan.highlight
                      ? "bg-orange-500 hover:bg-orange-400 text-black"
                      : "border border-white/10 text-white/60 hover:text-white hover:border-white/20"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
