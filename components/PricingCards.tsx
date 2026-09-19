import React from "react";
import { Check, MessageCircle } from "lucide-react";
import { PRICING_PLANS } from "@/lib/plans";
import { planWhatsappLink } from "@/lib/contact";

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      {PRICING_PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`relative rounded-2xl p-7 flex flex-col bg-white ${
            plan.highlighted
              ? "border-2 border-brand-600 shadow-lg shadow-brand-600/10"
              : "border border-slate-200 shadow-sm"
          }`}
        >
          {plan.highlighted && (
            <span className="absolute -top-3 left-7 bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Paling Populer
            </span>
          )}

          <p className={`text-sm font-semibold ${plan.highlighted ? "text-brand-600" : "text-slate-500"}`}>
            {plan.tagline}
          </p>
          <h3 className="text-xl font-bold text-slate-900 mt-1">{plan.name}</h3>
          <div className="flex items-baseline gap-1.5 mt-4">
            <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
            <span className="text-sm text-slate-500">/ {plan.period}</span>
          </div>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">{plan.description}</p>

          <ul className="space-y-3 text-sm text-slate-700 border-t border-slate-100 pt-5 mt-5 flex-1">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <a
            href={planWhatsappLink(plan.name)}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn w-full mt-7 ${plan.highlighted ? "btn-primary" : "btn-secondary"}`}
          >
            <MessageCircle className="w-4 h-4" />
            {plan.cta}
          </a>
        </div>
      ))}
    </div>
  );
}
