"use client";

import { useState } from "react";
import clsx from "clsx";

/** Logo YAPÓ completo: rotación 3D continua, tipo gráfico interactivo, ambas caras visibles. */
export default function LogoYapo({
  className,
  size = "md",
  darkBg = false,
  /** Si false, el logo no rota (solo se muestra estático) */
  rotate3d = true,
  /** Ruta de la imagen del logo (por defecto /logo-yapo.png) */
  logoSrc = "/logo-yapo.png",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Fondo negro para que el logo se vea como en el diseño original */
  darkBg?: boolean;
  /** Rotación 3D continua (estilo 3D Max); default true */
  rotate3d?: boolean;
  logoSrc?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const useImage = !imgError;

  const height = size === "sm" ? 40 : size === "md" ? 56 : size === "lg" ? 80 : 192;
  const width = size === "sm" ? 80 : size === "md" ? 120 : size === "lg" ? 180 : 360;
  /** Grosor 3D: rotación sobre eje Y, bloque más grueso */
  const depth = size === "sm" ? 40 : size === "md" ? 56 : size === "lg" ? 80 : 140;
  const depthHalf = depth / 2;

  const wrapperClass = darkBg
    ? "inline-flex items-center justify-center rounded-xl bg-black px-3 py-2"
    : "";

  const imgStyle = { height: `${height}px`, width: "auto", maxWidth: "100%" };
  const logoImg = useImage ? (
    <img
      src={logoSrc}
      alt=""
      className="object-contain pointer-events-none"
      style={imgStyle}
      onError={() => setImgError(true)}
    />
  ) : (
    <span
      className={clsx(
        "flex items-center font-bold tracking-tight text-[#DC2626]",
        size === "sm" && "text-xl",
        size === "md" && "text-2xl",
        size === "lg" && "text-3xl",
        size === "xl" && "text-4xl"
      )}
      aria-hidden
    >
      <span className="text-[#2563EB]">Y</span>
      <span>apó</span>
      <span className="text-[#EAB308]">́</span>
    </span>
  );

  if (!useImage) {
    return (
      <span className={clsx(wrapperClass, className)} aria-label="Yapó">
        {logoImg}
      </span>
    );
  }

  if (!rotate3d) {
    return (
      <span className={clsx(wrapperClass, className)}>
        <img
          src={logoSrc}
          alt="Y Yapó"
          className="object-contain"
          style={imgStyle}
          onError={() => setImgError(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={clsx("logo-yapo-3d-wrap", wrapperClass, className)}
      style={{ width: `${width}px`, height: `${height}px` }}
      aria-label="Y Yapó"
    >
      <div
        className="logo-yapo-3d-inner"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          ["--logo-depth-half" as string]: `${depthHalf}px`,
        }}
      >
        {/* Cara frontal: se lee Yapó */}
        <div className="logo-yapo-3d-face logo-yapo-3d-face-front">
          <img
            src={logoSrc}
            alt=""
            className="object-contain pointer-events-none"
            style={imgStyle}
            onError={() => setImgError(true)}
          />
        </div>
        {/* Cara trasera: misma orientación, también se lee Yapó */}
        <div className="logo-yapo-3d-face logo-yapo-3d-face-back">
          <img
            src={logoSrc}
            alt=""
            className="object-contain pointer-events-none"
            style={imgStyle}
          />
        </div>
      </div>
    </span>
  );
}
