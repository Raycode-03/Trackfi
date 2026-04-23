"use client";
import React from "react";
import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import { hero } from "@/lib/constants/landing";
import Link from "next/link";
export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#0a0a0a] overflow-hidden flex items-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Left — text */}
        <div className="w-full md:flex-1 md:max-w-xl">
          <h1 className="text-4xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            {hero.heading[0]}
            <br />
            {hero.heading[1]}
            <br />
            <span className="text-orange-400">{hero.heading[2]}</span>
            <br />
            {hero.heading[3]}
          </h1>
          <p className="text-white/50 text-sm md:text-lg leading-relaxed mb-8">
            {hero.description}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={'/dashboard'}>
      
            <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm transition-colors cursor-pointer">
              {hero.primaryCta} <ArrowRight className="w-4 h-4" />
            </button>
            </Link>
            <Link href='steps'>
            <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-white/60 hover:text-white text-sm font-medium transition-colors cursor-pointer">
              <Play className="w-3.5 h-3.5 fill-current" /> {hero.secondaryCta}
            </button>
            </Link>
          </div>
        </div>

        {/* Right — dashboard image (desktop) */}
        <div className="flex-1 relative hidden md:flex justify-end">
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-0 bg-orange-500/10 rounded-2xl blur-2xl scale-105" />
            <video
              src="/videos/demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="relative z-10 w-full rounded-2xl border border-white/10 shadow-2xl"
            />
          </div>
        </div>

        {/* Mobile — image below text */}
        <div className="w-full md:hidden">
          <div className="relative w-full">
            <div className="absolute inset-0 bg-orange-500/10 rounded-2xl blur-xl" />
            <video
              src="/videos/demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="relative z-10 w-full rounded-2xl border border-white/10 shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Trusted by bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-white/[0.02] py-4 overflow-hidden">
        <div className="flex items-center gap-10 w-max animate-marquee">
          {[
            ...hero.trustedBrands,
            ...hero.trustedBrands,
            ...hero.trustedBrands,
            ...hero.trustedBrands,
          ].map((name, i) => (
            <span
              key={i}
              className="text-white/30 text-xs font-semibold tracking-widest whitespace-nowrap hover:text-white/50 transition-colors cursor-default"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
