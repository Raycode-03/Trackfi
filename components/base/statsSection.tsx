"use client";
import React, { useEffect, useRef } from "react";
import { stats } from "@/lib/constants/landing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const match = value.match(/^([^0-9]*)(\d+\.?\d*)(.*)$/);
    if (!match || !ref.current) return;

    const prefix = match[1];
    const target = parseFloat(match[2]);
    const suffix = match[3];

    const obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        once: true,
      },
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${Math.floor(obj.val)}${suffix}`;
        }
      },
      onComplete: () => {
        if (ref.current) ref.current.textContent = value;
      },
    });
  }, [value]);

  return (
    <div className="py-6">
      <p ref={ref} className="text-5xl md:text-6xl font-black text-orange-400 mb-2">
        0
      </p>
      <p className="text-white/40 text-sm uppercase tracking-widest">{label}</p>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="bg-[#0a0a0a] py-20 px-6 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <AnimatedStat key={stat.value} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}