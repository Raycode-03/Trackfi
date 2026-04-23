"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { links } from "@/lib/constants/landing";
import { useGsapFadeUp } from "@/hooks/useGsapAnimation";

gsap.registerPlugin(ScrollTrigger);

export function FooterSection() {
  const brandRef = useGsapFadeUp();
  const linksRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    linksRef.current.forEach((el, index) => {
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
    <footer className="bg-[#0a0a0a] border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div ref={brandRef} className="col-span-2 md:col-span-1">
            <p className="text-white font-black text-xl mb-3">Track8</p>
            <p className="text-white/30 text-xs leading-relaxed mb-4">
              The ultimate crypto portfolio tracker for modern investors.
            </p>
            <div className="flex items-center gap-3">
              {["X", "in", "gh"].map((s) => (
                <button
                  key={s}
                  className="w-8 h-8 rounded-lg border border-white/10 text-white/30 hover:text-white hover:border-white/20 text-xs font-bold transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items], index) => (
            <div
              key={group}
              ref={(el) => {
                if (el) linksRef.current[index] = el;
              }}
            >
              <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-white/30 text-sm hover:text-white/70 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            © 2025 Track8. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            Built for the financial future.
          </p>
        </div>
      </div>
    </footer>
  );
}
