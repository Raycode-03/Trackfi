"use client";
import React, { useState } from "react";

type CardConfig<T extends string> = {
  key: T;
  title: string;
  description: string;
  icon: React.ReactNode;
  count: string;
  alert?: string;
};

type DashboardShellProps<T extends string> = {
  title: string;
  subtitle?: string;
  cards: CardConfig<T>[];
  sections: Record<T, React.ReactNode>;
  loading?: boolean;
};

export function DashboardShell<T extends string>({
  title,
  subtitle,
  cards,
  sections,

}: DashboardShellProps<T>) {
  const [activeSection, setActiveSection] = useState<T>(cards[0].key);


  return (
    <div className="mx-auto p-6 space-y-6 w-full max-w-full">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(card => (
          <button
            key={card.key}
            onClick={() => setActiveSection(card.key)}
            className={`p-6 rounded-xl border cursor-pointer transition hover:ring-4 hover:ring-blue-300
              ${activeSection === card.key ? "ring-4 ring-blue-400" : ""}
              bg-white  dark:bg-gray-800`}
          >
            {card.icon}
            <h3 className="font-semibold mt-2">{card.title}</h3>
            <p className="text-sm text-gray-500">{card.description}</p>

            <div className="mt-3 flex justify-between text-sm">
              <span className="font-bold">{card.count}</span>
              {card.alert && (
                <span className="bg-yellow-100 px-2 py-1 rounded text-xs">
                  {card.alert}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
        {sections[activeSection]}
      </div>
    </div>
  );
}
