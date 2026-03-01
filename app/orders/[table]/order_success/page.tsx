'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useGsapFadeUp, useGsapScaleFade } from '@/hooks/useGsapAnimation';

const DOTS = [
  { top: '38%',  left: '48%', delay: '0ms',   size: 'w-2 h-2' },
  { top: '54%', left: '65%', delay: '60ms',  size: 'w-1.5 h-1.5' },
  { top: '28%', left: '78%', delay: '120ms', size: 'w-1 h-1' },
  { top: '48%', left: '82%', delay: '180ms', size: 'w-2 h-2' },
  { top: '68%', left: '74%', delay: '240ms', size: 'w-3 h-3' },
  { top: '80%', left: '60%', delay: '300ms', size: 'w-1.5 h-1.5' },
  { top: '84%', left: '44%', delay: '60ms',  size: 'w-3 h-3' },
  { top: '78%', left: '28%', delay: '120ms', size: 'w-1 h-1' },
  { top: '65%', left: '16%', delay: '180ms', size: 'w-1.5 h-1.5' },
  { top: '46%', left: '2%', right:'20%' , delay: '240ms', size: 'w-4 h-4' },
  { top: '86%', left: '28%', delay: '300ms', size: 'w-4 h-4' },
  { top: '33%', left: '32%', delay: '0ms',   size: 'w-1.5 h-1.5' },
  { top: '55%',  left: '56%', delay: '150ms', size: 'w-1 h-1' },
  { top: '20%', left: '72%', delay: '90ms',  size: 'w-1.5 h-1.5' },
  { top: '55%', left: '85%', delay: '210ms', size: 'w-1 h-1' },
  { top: '72%', left: '20%', delay: '270ms', size: 'w-1.5 h-1.5' },
  // three
  { top: '56%', left: '18%', delay: '300ms', size: 'w-1 h-1' },
  { top: '63%', left: '32%', delay: '0ms',   size: 'w-1.5 h-1.5' },
  { top: '12%',  left: '56%', delay: '150ms', size: 'w-1 h-1' },
  { top: '90%', left: '72%', delay: '90ms',  size: 'w-1.5 h-1.5' },
  { top: '25%', left: '85%', delay: '210ms', size: 'w-1 h-1' },
  { top: '82%', left: '20%', delay: '270ms', size: 'w-1.5 h-1.5' },
];

export default function OrderSuccessPage() {
  const params = useParams();
  const tableNumber = params?.table as string;
  const [dotsVisible, setDotsVisible] = useState(false);

  const cardRef = useGsapFadeUp({ scroll: false, delay: 0 });
  const iconRef = useGsapScaleFade({ scroll: false, delay: 0.2 });
  const titleRef = useGsapFadeUp({ scroll: false, delay: 0.3 });
  const descRef = useGsapFadeUp({ scroll: false, delay: 0.4 });
  const btnsRef = useGsapFadeUp({ scroll: false, delay: 0.5 });

  useEffect(() => {
    const t = setTimeout(() => setDotsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-20 py-10 flex items-center justify-center px-4">
      <div ref={cardRef} className="w-full max-w-sm bg-white rounded-3xl text-center">

        {/* Particle burst + icon */}
        <div className="relative flex items-center justify-center w-80 h-60 mx-auto mb-6">
          {DOTS.map((dot, i) => (
            <span
              key={i}
              className={`absolute rounded-full bg-[#16A34A] transition-all duration-500 ${dot.size} ${
                dotsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
              style={{ top: dot.top, left: dot.left, transitionDelay: dot.delay }}
            />
          ))}

          <div ref={iconRef} className="relative z-10 w-20 h-20 rounded-full bg-[#16A34A] flex items-center justify-center shadow-lg shadow-[#16A34A]/40">
            <Check className="w-9 h-9 text-white stroke-[2.5]" />
          </div>
        </div>

        <h1 ref={titleRef} className="text-2xl font-bold text-gray-900 mb-2">
          Thank you for ordering!
        </h1>

        <div ref={descRef}>
          <p className="text-sm text-gray-400 mb-2">
            Your food is being prepared and will be brought to
          </p>
          <p className="text-base font-semibold text-[#16A34A] mb-8">
            Table {tableNumber}
          </p>
        </div>

        <div ref={btnsRef} className="flex gap-3">
          <Link
            href={`/order/${tableNumber}`}
            className="flex-1 py-2.5 text-sm font-semibold bg-gray-100 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            View Order
          </Link>
          <Link
            href={`/menu/${tableNumber}`}
            className="flex-1 py-2.5 text-sm font-semibold bg-[#16A34A] text-white rounded-xl hover:bg-[#0acc51] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}