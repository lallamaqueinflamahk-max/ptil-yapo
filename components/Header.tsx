"use client";

import { useState } from "react";
import { clsx } from "clsx";
import LoginModal from "./LoginModal";

export default function Header() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-yapo-white border-b border-yapo-gray-dark shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between min-h-[64px]">
          <img
            src="/ChatGPT_Image_Feb_3__2026__12_25_26_AM-removebg-preview.png"
            alt="Yapó"
            className="h-10 w-auto object-contain shrink-0"
          />

          {/* Acceso Staff - visible en barra superior */}
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className={clsx(
              "text-base font-semibold text-yapo-blue hover:text-blue-900",
              "py-2.5 px-4 rounded-xl border-2 border-yapo-blue/30 hover:border-yapo-blue hover:bg-yapo-blue/5 transition-colors"
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
