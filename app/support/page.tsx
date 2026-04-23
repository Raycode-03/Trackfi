"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Mail,
  BookOpen,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { FAQSection } from "@/components/base/faqSection";
import ContactSection from "@/components/base/contact";

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of using TrackFi",
      icon: BookOpen,
      articles: [
        "Creating your first watchlist",
        "Setting up price alerts",
        "Understanding the dashboard",
        "Importing your portfolio",
      ],
    },
    {
      id: "accounts",
      title: "Account & Auth",
      description: "Account management and security",
      icon: AlertCircle,
      articles: [
        "How to reset your password",
        "Two-factor authentication",
        "Managing your profile",
        "Account deletion",
      ],
    },
    {
      id: "alerts",
      title: "Price Alerts",
      description: "Configure and manage your alerts",
      icon: CheckCircle,
      articles: [
        "Creating price alerts",
        "Alert notifications",
        "Modifying alert settings",
        "Troubleshooting alerts",
      ],
    },
    {
      id: "transactions",
      title: "Transactions",
      description: "Track and manage your portfolio",
      icon: Mail,
      articles: [
        "Adding transactions",
        "Importing from exchanges",
        "Calculating gains/losses",
        "Portfolio analytics",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
      {/* Hero Section */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How can we help?
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Find answers, get support, or reach out to our team
          </p>

          {/* Quick Contact Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <a
              href="https://wa.me/9167019229?text=Hi%20TrackFi%20Support!%20I%20need%20help%20with..."
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </a>
            <a
              href="mailto:akereleolasun5@gmail.com"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5" />
              Email Support
            </a>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Browse Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id,
                    )
                  }
                  className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-gray-600 p-6 rounded-lg transition-all hover:shadow-lg text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8 text-blue-400" />
                    <ArrowRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedCategory === category.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {category.description}
                  </p>

                  {/* Expand to show articles */}
                  {selectedCategory === category.id && (
                    <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                      {category.articles.map((article, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          {article}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-[#0a0a0a]">
        <FAQSection />
      </section>     
    </main>
  );
}
