"use client";

import Link from "next/link";
import { LayoutDashboard, MapPin } from "lucide-react";

export default function DashboardAdminPage() {
  return (
    <div className="min-h-screen bg-yapo-gray">
      <header className="bg-yapo-blue text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Dashboard Global (Admin Maestro)</h1>
          <Link
            href="/"
            className="text-yapo-orange-light hover:underline text-sm"
          >
            Volver a Inicio
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-600 mb-6">
          Vista para Intendente: 44 Seccionales, comparativa de fuerza por
          concejal y aliado.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
            <LayoutDashboard className="w-10 h-10 text-yapo-blue" />
            <div>
              <h2 className="font-semibold text-yapo-blue">Seccionales</h2>
              <p className="text-3xl font-bold text-yapo-orange">44</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
            <MapPin className="w-10 h-10 text-yapo-blue" />
            <div>
              <h2 className="font-semibold text-yapo-blue">Mapa Maestro</h2>
              <p className="text-sm text-gray-500">Próximamente</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
