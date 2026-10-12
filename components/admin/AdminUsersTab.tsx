"use client";

import React from "react";
import { Star, Trash2 } from "lucide-react";
import { AdminUserView } from "@/lib/store";
import { formatCurrencyIDR } from "@/lib/crypto";

export function AdminUsersTab({
  usersList,
  currentUserId,
  onTogglePlan,
  onAddCredits,
  onDeleteUser,
}: {
  usersList: AdminUserView[];
  currentUserId: string;
  onTogglePlan: (u: AdminUserView) => void;
  onAddCredits: (u: AdminUserView, amount: number) => void;
  onDeleteUser: (u: AdminUserView) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Daftar Pengguna Platform</h2>
          <p className="text-xs text-slate-500">Kelola paket langganan dan kredit proyek untuk setiap pengguna.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Pengguna</th>
                <th className="px-5 py-3.5">Peran</th>
                <th className="px-5 py-3.5">Paket Akun</th>
                <th className="px-5 py-3.5">Kredit Proyek</th>
                <th className="px-5 py-3.5">Total Kontrak</th>
                <th className="px-5 py-3.5">Nilai Proyek</th>
                <th className="px-5 py-3.5 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{u.fullName}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-slate-600 font-medium">{u.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.plan === "pro"
                          ? "bg-brand-50 text-brand-700 border border-brand-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {u.plan === "pro" ? (
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-3 h-3 text-brand-600 fill-brand-600" /> Pro
                        </span>
                      ) : (
                        "Gratis"
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-800">{u.credits}</span>
                    <span className="text-xs text-slate-500"> kredit</span>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{u.agreementCount} dokumen</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{formatCurrencyIDR(u.totalValue)}</td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      onClick={() => onTogglePlan(u)}
                      className={`btn btn-sm ${u.plan === "pro" ? "btn-secondary" : "btn-primary"}`}
                    >
                      {u.plan === "pro" ? "Set ke Gratis" : "Upgrade ke Pro"}
                    </button>
                    <button
                      onClick={() => onAddCredits(u, 3)}
                      className="btn btn-secondary btn-sm"
                      title="Tambah 3 kredit proyek"
                    >
                      +3 Kredit
                    </button>
                    {u.id !== currentUserId && (
                      <button
                        onClick={() => onDeleteUser(u)}
                        className="btn btn-ghost btn-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        title="Hapus akun pengguna secara permanen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
