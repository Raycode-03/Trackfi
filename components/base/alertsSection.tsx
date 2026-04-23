"use client";
import React from "react";
import { ArrowRight, Link } from "lucide-react";
import Image from "next/image";
import { alerts } from "@/lib/constants/landing";
import { useGsapFadeLeft, useGsapFadeRight } from "@/hooks/useGsapAnimation";

export function AlertsSection() {
  const textRef = useGsapFadeLeft();
  const imageRef = useGsapFadeRight();

  return (
    <section className="bg-[#0a0a0a] py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col justify-evenly md:flex-row items-center gap-16">
        {/* Left — text */}
        <div ref={textRef} className=" min-w-0 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6">
            {alerts.badge}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            {alerts.heading}
          </h2>
          <p className="text-white/40 text-base leading-relaxed mb-8">
            {alerts.description}
          </p>

          {/* Sample alert card */}
          <div className="bg-white/5 border border-orange-500/30 rounded-xl px-4 py-3 flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-white text-sm font-medium">
              {alerts.sampleAlert.label}
            </span>
            <span className="ml-auto text-green-400 text-xs font-semibold">
              {alerts.sampleAlert.status}
            </span>
          </div>
          <Link href={"/alers"}>
            <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm transition-colors cursor-pointer">
              {alerts.cta} <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Right — image */}
        <div ref={imageRef} className="min-w-0 relative">
          <div className="absolute inset-0 bg-orange-500/5 rounded-3xl blur-2xl scale-110" />
          <Image
            src="/images/person1.jpg"
            alt="Price alerts UI"
            className="relative z-10 w-full rounded-2xl border border-white/10 shadow-2xl"
            height={600}
            width={600}
          />
        </div>
      </div>
    </section>
  );
}
