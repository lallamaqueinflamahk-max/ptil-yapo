"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Users,
  UserCheck,
  GraduationCap,
  Settings,
  Home,
  BarChart3,
  Table2,
} from "lucide-react";
import { DashboardChartProvider } from "@/context/DashboardChartContext";
import DashboardAvatar from "@/components/dashboard/DashboardAvatar";
import AsistenteMaestroBar from "@/components/dashboard/AsistenteMaestroBar";
import { PRODUCT, NAV } from "@/lib/copy/dashboard";
import { getStaffRole, canAccessMaestroUi, MAESTRO_ONLY_PATHS, type StaffRole } from "@/lib/staffRole";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  MapPin,
  Users,
  UserCheck,
  GraduationCap,
  Settings,
  BarChart3,
  Table2,
};

function navFilter(href: string, role: StaffRole): boolean {
  if ((MAESTRO_ONLY_PATHS as readonly string[]).includes(href)) return canAccessMaestroUi(role);
  return true;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [staffRole, setStaffRole] = useState<StaffRole>(null);

  useEffect(() => {
    setStaffRole(getStaffRole());
  }, []);

  const navItems = NAV.filter((item) => navFilter(item.href, staffRole));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans antialiased">
      <header className="sticky top-0 z-30 border-b border-gray-200/90 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-900 font-semibold hover:text-[#1E3A8A] transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 text-[#1E3A8A]" aria-hidden />
              <span className="hidden sm:inline">{PRODUCT.name}</span>
              <span className="sm:hidden">{PRODUCT.shortName}</span>
            </Link>
            <div className="hidden lg:flex flex-col items-end text-right">
              <p className="text-xs text-gray-600 font-medium">{PRODUCT.tagline}</p>
              <p className="text-[10px] text-gray-400 tracking-wide">{PRODUCT.byline}</p>
            </div>
            <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-hide max-w-full">
              {navItems.map(({ href, label, shortLabel, icon: iconKey }) => {
                const Icon = ICONS[iconKey] ?? Settings;
                // #region agent log
                if (href === "/dashboard/operador" && typeof window !== "undefined") {
                  fetch("http://127.0.0.1:7245/ingest/039a586b-016e-41a6-bbd7-7d228a8b81c8", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4fa08" },
                    body: JSON.stringify({
                      sessionId: "a4fa08",
                      location: "dashboard/layout.tsx:nav",
                      message: "operador nav item render",
                      data: { href, iconKey, hasIcon: !!ICONS[iconKey] },
                      timestamp: Date.now(),
                      hypothesisId: "B",
                    }),
                  }).catch(() => {});
                }
                // #endregion
                const isActive =
                  pathname === href ||
                  (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    title={label}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-[#1E3A8A] text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100 hover:text-[#1E3A8A]"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">{shortLabel}</span>
                  </Link>
                );
              })}
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 hover:text-[#1E3A8A] transition-all ml-2"
              >
                <Home className="w-4 h-4" aria-hidden />
                <span className="hidden sm:inline">Inicio</span>
              </Link>
              <AsistenteMaestroBar inNavbar />
              <DashboardAvatar />
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <DashboardChartProvider>{children}</DashboardChartProvider>
      </main>
    </div>
  );
}
