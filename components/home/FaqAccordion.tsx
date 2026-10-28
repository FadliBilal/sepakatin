"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`rounded-xl border transition-all ${
              isOpen
                ? "border-blue-400 bg-white shadow-xs"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between gap-3.5 p-4 sm:p-5 text-left select-none"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <HelpCircle
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isOpen ? "text-orange-600" : "text-slate-400"
                  }`}
                />
                <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {item.q}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
