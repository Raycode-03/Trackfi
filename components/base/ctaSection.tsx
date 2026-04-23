"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import { useGsapFadeUp } from "@/hooks/useGsapAnimation";

export function CTASection() {
  const contentRef = useGsapFadeUp();

  return (
    <section className="bg-[#0a0a0a] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div
          ref={contentRef}
          className="relative bg-orange-500/80 rounded-3xl px-8 py-16 text-center overflow-hidden"
        >
          {/* Background texture */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-black leading-tight mb-4">
              Start tracking your crypto today.
            </h2>
            <p className="text-black/60 text-base mb-8 max-w-md mx-auto">
              Join thousands of investors who trust Track8 to monitor their
              portfolio 24/7.
            </p>
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-black text-white font-bold text-sm hover:bg-black/80 transition-colors cursor-pointer">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
