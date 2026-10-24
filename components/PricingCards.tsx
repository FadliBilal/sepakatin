"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, QrCode, Zap } from "lucide-react";
import { PRICING_PLANS } from "@/lib/plans";
import { useSession } from "@/lib/auth";
import { PaymentPackageType } from "@/lib/types";
import { PaymentModal } from "@/components/PaymentModal";

export function PricingCards() {
  const { user } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<PaymentPackageType | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const packageType: PaymentPackageType = plan.id === "per-proyek" ? "credit_1" : "pro_monthly";

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl p-6 sm:p-7 flex flex-col bg-white transition-all duration-200 ${
                plan.highlighted
                  ? "border-2 border-blue-600 shadow-md -translate-y-0.5"
                  : "border border-slate-200 hover:border-blue-300"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-6 bg-blue-600 text-white px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 shadow-xs tracking-wide">
                  <Zap className="w-3 h-3" /> Paling Fleksibel
                </span>
              )}

              <p className={`text-xs font-semibold uppercase tracking-wider ${plan.highlighted ? "text-blue-600" : "text-slate-400"}`}>
                {plan.tagline}
              </p>
              <h3 className="text-xl font-bold font-display text-slate-900 mt-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1.5 mt-3">
                <span className="text-3xl font-bold font-display text-slate-900">{plan.price}</span>
                <span className="text-xs text-slate-500">/ {plan.period}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">{plan.description}</p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 border-t border-slate-200 pt-5 mt-5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.id === "gratis" ? (
                <Link
                  href={user ? "/dashboard" : "/auth/register"}
                  className="btn btn-secondary w-full mt-6 text-xs sm:text-sm"
                >
                  {user ? "Buka Dashboard" : "Daftar Gratis"}
                </Link>
              ) : user ? (
                <button
                  type="button"
                  onClick={() => setSelectedPlan(packageType)}
                  className={`btn w-full mt-6 text-xs sm:text-sm flex items-center justify-center gap-2 ${
                    plan.highlighted ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Bayar via QRIS (Instan)
                </button>
              ) : (
                <Link
                  href={`/auth/login?redirect=/#harga`}
                  className={`btn w-full mt-6 text-xs sm:text-sm flex items-center justify-center gap-2 ${
                    plan.highlighted ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Masuk untuk Beli
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <PaymentModal
          isOpen={true}
          onClose={() => setSelectedPlan(null)}
          packageType={selectedPlan}
          onSuccess={() => setSelectedPlan(null)}
        />
      )}
    </>
  );
}
