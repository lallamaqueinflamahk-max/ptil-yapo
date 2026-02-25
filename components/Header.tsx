"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import LoginModal from "./LoginModal";
import { Search } from "lucide-react";

export default function Header() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-200/70 via-amber-100/50 to-orange-200/60 border-b-2 border-yapo-blue/40 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-end gap-3 min-h-[56px]">
          <Link
            href="/verificar"
            className={clsx(
              "inline-flex items-center gap-2 min-h-[48px] px-4 rounded-xl font-semibold text-sm",
              "text-yapo-blue border-2 border-yapo-blue/50 hover:border-yapo-blue hover:bg-yapo-blue hover:text-white",
              "transition-all duration-200 hover:scale-105 active:scale-[0.98] shadow-sm hover:shadow-lg"
            )}
            aria-label="Consultar estado de inscripción"
          >
            <Search className="w-4 h-4" />
            Consultar mi estado
          </Link>
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className={clsx(
              "text-base font-semibold text-yapo-blue hover:text-white",
              "py-2.5 px-4 rounded-xl border-2 border-yapo-blue/50 hover:border-yapo-blue hover:bg-yapo-blue min-h-[48px]",
              "transition-all duration-200 hover:scale-105 active:scale-[0.98] shadow-sm hover:shadow-lg"
            )}
            aria-label="Acceso para personal"
          >
            Acceso Staff
          </button>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
