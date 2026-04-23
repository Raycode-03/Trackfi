"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  isLanding?: boolean;
}

const defaultLinks = [
  { label: "About", href: "#about" },
  { label: "Tables", href: "#tables" },
  { label: "Why Us", href: "#whyus" },
  { label: "Testimonies", href: "#testimories" },
  { label: "Contact", href: "#contact" },
];

const landingLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

function Navbar({ isLanding = false }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = isLanding ? landingLinks : defaultLinks;
  const cta = isLanding ? "/dashboard" : "/tables";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLanding
          ? scrolled
            ? "bg-[#111111]/95 backdrop-blur-md border-b border-white/5 shadow-sm"
            : "bg-transparent"
          : scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link
            href={isLanding ? "/" : "/"}
            className="text-white font-black text-xl hover:opacity-80 transition-opacity"
          >
            Trackfi
          </Link>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isLanding
                  ? "text-white hover:text-orange-400"
                  : scrolled
                    ? "text-gray-600 hover:text-gray-900"
                    : "text-white hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={cta}
            className="bg-orange-500 hover:bg-orange-400 text-black text-sm font-semibold px-5 py-2 rounded-full transition-colors cursor-pointer"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5 invert" /> : <Menu className="w-5 h-5 invert" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={cta}
            onClick={() => setIsOpen(false)}
            className="bg-orange-500 text-black text-sm font-semibold px-5 py-2.5 rounded-full text-center transition-colors cursor-pointer"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
