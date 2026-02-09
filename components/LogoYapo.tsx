"use client";

import { useState } from "react";
import clsx from "clsx";

/** Logo YAPÓ completo: imagen oficial (Y Yapó, rojo/azul/amarillo). Opción dark para fondo negro. */
export default function LogoYapo({
  className,
  size = "md",
  darkBg = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Fondo negro para que el logo se vea como en el diseño original */
  darkBg?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const useImage = !imgError;

  const height = size === "sm" ? 40 : size === "md" ? 56 : 80;

  const wrapperClass = darkBg
    ? "inline-flex items-center justify-center rounded-xl bg-black px-3 py-2"
    : "";

  return (
    <span className={clsx(wrapperClass, className)}>
      {useImage ? (
        <img
          src="/logo-yapo.png"
          alt="Y Yapó"
          className="object-contain"
          style={{ height: `${height}px`, width: "auto", maxWidth: "100%" }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className={clsx(
            "flex items-center font-bold tracking-tight text-[#DC2626]",
            size === "sm" && "text-xl",
            size === "md" && "text-2xl",
            size === "lg" && "text-3xl"
          )}
          aria-label="Yapó"
        >
          <span className="text-[#2563EB]">Y</span>
          <span>apó</span>
          <span className="text-[#EAB308]">́</span>
        </span>
      )}
    </span>
  );
}
