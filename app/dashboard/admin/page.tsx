"use client";

import Link from "next/link";
import { LayoutDashboard, MapPin, ChevronRight } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import KPICard from "@/components/dashboard/KPICard";
import { PAGES, QUICK_ACCESS } from "@/lib/copy/dashboard";
import PageHero from "@/components/dashboard/PageHero";

export default function DashboardAdminPage() {
  return (
    <div className="space-y-8">
      <PageHero
        title={PAGES.admin.title}
        subtitle={PAGES.admin.subtitle}
        trust={PAGES.admin.trust}
        forWho={PAGES.admin.forWho}
      />

      <section aria-label="Métricas globales">
        <h2 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">
          Métricas globales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KPICard
            value={44}
            label="Seccionales"
            sublabel="Ámbito territorial"
            variant="blue"
            icon={<LayoutDashboard className="w-5 h-5" />}
            href="/dashboard/maestro"
          />
          <KPICard
            value="—"
            label="Mapa Maestro"
            sublabel="Próximamente"
            variant="neutral"
            icon={<MapPin className="w-5 h-5" />}
          />
        </div>
      </section>

      <section aria-label="Accesos">
        <h2 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">
          Accesos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DashboardCard href="/dashboard/maestro" interactive>
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-dash-blue/10 text-dash-blue">
                  <LayoutDashboard className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{QUICK_ACCESS.maestro.title}</p>
                  <p className="text-xs text-gray-600">{QUICK_ACCESS.maestro.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-dash-muted shrink-0" />
            </div>
          </DashboardCard>
        </div>
      </section>
    </div>
  );
}
