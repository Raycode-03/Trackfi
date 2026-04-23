"use client";
import React, { useState, useRef, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { faqs, faqHeading } from "@/lib/constants/landing";
import { useGsapFadeUp } from "@/hooks/useGsapAnimation";

gsap.registerPlugin(ScrollTrigger);

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const titleRef = useGsapFadeUp();
  const faqRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    faqRef.current.forEach((el, index) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.1,
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
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            {faqHeading}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) faqRef.current[i] = el;
              }}
              className={`border rounded-xl transition-all duration-300 ${
                open === i
                  ? "border-orange-500/30 bg-orange-500/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-white text-sm font-medium">
                  {faq.question}
                </span>
                {open === i ? (
                  <Minus className="w-4 h-4 text-orange-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-white/30 flex-shrink-0" />
                )}
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-white/40 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
