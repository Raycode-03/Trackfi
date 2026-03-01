'use client'
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { testimonies } from '@/lib/constants/landing';
import { useGsapFadeUp, useGsapFadeRight } from '@/hooks/useGsapAnimation';
export default function TestimoniesSection() {
  const titleRef = useGsapFadeUp();
  const cardRef = useGsapFadeRight({ delay: 0.2 });
  const controlsRef = useGsapFadeUp({ delay: 0.3 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('left');

  const goTo = useCallback((index: number) => {
    if (index === activeIndex || animating) return;
    setDirection(index > activeIndex ? 'left' : 'right');
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setAnimating(false);
    }, 300);
  }, [activeIndex, animating]);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeIndex + 1) % testimonies.items.length;
      goTo(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex, goTo]);

  const item = testimonies.items[activeIndex];

  return (
    <section id="testimories" className="py-16 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div ref={titleRef} className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">{testimonies.title}</h2>
          <p className="text-gray-500 mt-2 text-sm">{testimonies.description}</p>
        </div>

        {/* Card — slides left/right */}
        <div ref={cardRef} className="overflow-hidden">
          <div
            className={`transition-all duration-300 ease-in-out ${animating
              ? direction === 'left'
                ? '-translate-x-8 opacity-0'
                : 'translate-x-8 opacity-0'
              : 'translate-x-0 opacity-100'
              }`}
          >
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-[#16A34A] text-sm">★</span>
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                &quot;{item.text}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: counter + dots */}
        <div ref={controlsRef} className="flex items-center justify-between mt-6 px-1">
          <span className="text-sm font-bold text-gray-900">
            {String(activeIndex + 1).padStart(2, '0')}
            <span className="text-gray-300 font-normal"> / {String(testimonies.items.length).padStart(2, '0')}</span>
          </span>

          {/* Horizontal dots */}
          <div className="flex items-center gap-2">
            {testimonies.items.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`transition-all duration-300 rounded-full h-2 ${index === activeIndex
                  ? 'w-8 bg-[#16A34A]'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => goTo(activeIndex === 0 ? testimonies.items.length - 1 : activeIndex - 1)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <span className="text-gray-600 text-sm">←</span>
            </button>
            <button
              onClick={() => goTo((activeIndex + 1) % testimonies.items.length)}
              className="w-8 h-8 rounded-full bg-[#16A34A] hover:bg-[#15803D] flex items-center justify-center transition-colors"
            >
              <span className="text-white text-sm">→</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}