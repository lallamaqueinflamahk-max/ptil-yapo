"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import { setStaffRole } from "@/lib/staffRole";
type Role = "maestro" | "pro" | "operador" | "capacitacion" | null;

const ROLE_REDIRECTS: Record<NonNullable<Role>, string> = {
  maestro: "/dashboard/maestro",
  pro: "/dashboard/pro",
  operador: "/dashboard/operador",
  capacitacion: "/dashboard/capacitacion",
};

export default function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("maestro");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const path = ROLE_REDIRECTS[role as NonNullable<Role>];
    if (!path) return;
    setStaffRole(role as NonNullable<Role>);
    onClose();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-hidden">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="login-title"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md max-h-[calc(100vh-2rem)] min-h-0 flex flex-col bg-white rounded-2xl shadow-xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-shrink-0 flex justify-between items-center p-4 pb-0">
                <h2 id="login-title" className="text-xl font-bold text-yapo-blue">
                  Acceso Staff
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-yapo-gray text-gray-500"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 pt-4"
                style={{ paddingLeft: "max(1rem, env(safe-area-inset-left))", paddingRight: "max(1rem, env(safe-area-inset-right))" }}
              >
                <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="label-yapo block mb-1">
                  Correo / Usuario
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-yapo w-full"
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="label-yapo block mb-1">
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-yapo w-full"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <span className="label-yapo block mb-1">Rol (elegí el dashboard)</span>
                <div className="flex gap-2 flex-wrap">
                  {(["maestro", "pro", "operador", "capacitacion"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-medium",
                        role === r
                          ? "bg-yapo-blue text-white"
                          : "bg-yapo-gray text-gray-700 hover:bg-yapo-gray-dark"
                      )}
                    >
                      {r === "maestro" && "Maestro"}
                      {r === "pro" && "Pro"}
                      {r === "operador" && "Operador YAPÓ"}
                      {r === "capacitacion" && "Capacitación"}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Modo demo: elegí un rol y hacé clic en Iniciar sesión (no hace falta correo/contraseña).
              </p>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="btn-yapo btn-yapo-primary w-full min-h-[48px] text-base font-semibold">
                Iniciar sesión
              </button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
