import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimationOptions {
  delay?: number;
  duration?: number;
  scroll?: boolean; // trigger on scroll or on mount
}

// Fade in from bottom
export function useGsapFadeUp(options: AnimationOptions = {}) {
  const { delay = 0, duration = 0.8, scroll = true } = options;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const animation = {
      opacity: 0,
      y: 50,
    };

    const target = {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: 'power3.out',
    };

    if (scroll) {
      gsap.fromTo(ref.current, animation, {
        ...target,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
           end: 'bottom top',
          toggleActions: 'play none none reverse',
        },
      });
    } else {
      gsap.fromTo(ref.current, animation, target);
    }
  }, [delay, duration, scroll]);

  return ref;
}

// Fade in from right
export function useGsapFadeRight(options: AnimationOptions = {}) {
  const { delay = 0, duration = 0.8, scroll = true } = options;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const animation = { opacity: 0, x: 60 };
    const target = {
      opacity: 1,
      x: window.innerWidth < 768 ? 0 : 60,
      y: window.innerWidth < 768 ? 40 : 0,
      duration,
      delay,
      ease: 'power3.out',
    };

    if (scroll) {
      gsap.fromTo(ref.current, animation, {
        ...target,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
           end: 'bottom top',
          toggleActions: 'play none none reverse',
        },
      });
    } else {
      gsap.fromTo(ref.current, animation, target);
    }
  }, [delay, duration, scroll]);

  return ref;
}

// Fade in from left
export function useGsapFadeLeft(options: AnimationOptions = {}) {
  const { delay = 0, duration = 0.8, scroll = true } = options;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const animation = { opacity: 0, x: -60 };
    const target = {
      opacity: 1,
      x: window.innerWidth < 768 ? 0 : -60,  // no X on mobile
      y: window.innerWidth < 768 ? 40 : 0,
      duration,
      delay,
      ease: 'power3.out',
    };

    if (scroll) {
      gsap.fromTo(ref.current, animation, {
        ...target,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
           end: 'bottom top',
          toggleActions: 'play none none reverse',
        },
      });
    } else {
      gsap.fromTo(ref.current, animation, target);
    }
  }, [delay, duration, scroll]);

  return ref;
}

// Fade in from top
export function useGsapFadeDown(options: AnimationOptions = {}) {
  const { delay = 0, duration = 0.8, scroll = true } = options;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const animation = { opacity: 0, y: -50 };
    const target = {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: 'power3.out',
    };

    if (scroll) {
      gsap.fromTo(ref.current, animation, {
        ...target,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
           end: 'bottom top',
          toggleActions: 'play none none reverse',
        },
      });
    } else {
      gsap.fromTo(ref.current, animation, target);
    }
  }, [delay, duration, scroll]);

  return ref;
}

// Scale + fade — good for cards, images, buttons
export function useGsapScaleFade(options: AnimationOptions = {}) {
  const { delay = 0, duration = 0.7, scroll = true } = options;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const animation = { opacity: 0, scale: 0.85 };
    const target = {
      opacity: 1,
      scale: 1,
      duration,
      delay,
      ease: 'back.out(1.4)',
    };

    if (scroll) {
      gsap.fromTo(ref.current, animation, {
        ...target,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
           end: 'bottom top',
          toggleActions: 'play none none reverse',
        },
      });
    } else {
      gsap.fromTo(ref.current, animation, target);
    }
  }, [delay, duration, scroll]);

  return ref;
}