"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { steps, stepsHeading } from "@/lib/constants/landing";
import { useGsapFadeUp } from "@/hooks/useGsapAnimation";

gsap.registerPlugin(ScrollTrigger);

export function StepsSection() {
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
            {stepsHeading}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[60%] right-0 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
              )}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-orange-500/20 transition-all duration-300">
                <span className="text-5xl font-black text-orange-500/20 block mb-4">
                  {step.number}
                </span>
                <h3 className="text-white font-bold text-xl mb-3">
                  {step.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
