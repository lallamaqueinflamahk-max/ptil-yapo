"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import useSWR from "swr";
import { UserPlus, Camera, MapPin, CheckCircle2, Send, Coins, AlertTriangle, GraduationCap, XCircle, User } from "lucide-react";
import { mensajeBienvenidaYapo } from "@/lib/messages/whatsappBienvenida";
import { PAGES } from "@/lib/copy/dashboard";
import PageHero from "@/components/dashboard/PageHero";

const COMISION_POR_VALIDACION = 5000;
const OPERADOR_CEDULA_KEY = "operador_yapo_cedula";
const OPERADOR_SECCIONAL_KEY = "operador_yapo_seccional";

type EstadoValidacion = "pendiente" | "aprobado" | "aprobado_observacion" | "rechazado" | "derivar_capacitacion";
type Dictamen = "APROBADO" | "APROBADO_OBSERVACION" | "RECHAZADO" | "DERIVAR_CAPACITACION";

interface ValidacionItem {
  id: string;
  nombreTrabajador: string;
  oficio: string;
  whatsapp: string;
  estado: EstadoValidacion;
  fechaRegistro: string | null;
  dictamenLabel?: string | null;
  evidenciaFaltaEquipo?: boolean;
}

interface AlertaItem {
  id: string;
  nombreTrabajador: string;
  oficio: string;
  whatsapp: string;
  fechaRegistro: string;
  seccionalNro?: string;
  gestorZona?: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardOperadorPage() {
  const [cedula, setCedula] = useState("");
  const [seccionalNro, setSeccionalNro] = useState("");
  const [perfilGuardado, setPerfilGuardado] = useState(false);
  const [feedbackNombre, setFeedbackNombre] = useState<string | null>(null);
  const [reenviandoId, setReenviandoId] = useState<string | null>(null);
  const [mostrarComisionGanada, setMostrarComisionGanada] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);
  const [tomandoId, setTomandoId] = useState<string | null>(null);
  const [dictamenandoId, setDictamenandoId] = useState<string | null>(null);

  useEffect(() => {
    const c = typeof window !== "undefined" ? localStorage.getItem(OPERADOR_CEDULA_KEY) : null;
    const s = typeof window !== "undefined" ? localStorage.getItem(OPERADOR_SECCIONAL_KEY) : null;
    if (c) setCedula(c);
    if (s) setSeccionalNro(s);
    if (c) setPerfilGuardado(true);
  }, []);

  const guardarPerfil = useCallback(async () => {
    setErrorPerfil(null);
    const c = cedula.trim().replace(/\D/g, "");
    const s = seccionalNro.trim();
    if (!c || !s) {
      setErrorPerfil("Ingresá cédula y seccional.");
      return;
    }
    try {
      const res = await fetch("/api/operador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula: c, seccionalNro: s }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      localStorage.setItem(OPERADOR_CEDULA_KEY, c);
      localStorage.setItem(OPERADOR_SECCIONAL_KEY, s);
      setCedula(c);
      setSeccionalNro(s);
      setPerfilGuardado(true);
    } catch (e) {
      setErrorPerfil(e instanceof Error ? e.message : "No se pudo guardar el perfil.");
    }
  }, [cedula, seccionalNro]);

  const alertasUrl = perfilGuardado && cedula ? `/api/operador/alertas?cedula=${encodeURIComponent(cedula)}` : null;
  const misValidacionesUrl = perfilGuardado && cedula ? `/api/operador/mis-validaciones?cedulaOperador=${encodeURIComponent(cedula)}` : null;

  const { data: alertasData, mutate: mutateAlertas } = useSWR<{ alertas: AlertaItem[]; total: number }>(alertasUrl, fetcher, { refreshInterval: 15000 });
  const { data: validacionesData, mutate: mutateValidaciones } = useSWR<{
    validaciones: ValidacionItem[];
    pendientes: ValidacionItem[];
    conDictamen: ValidacionItem[];
    total: number;
  }>(misValidacionesUrl, fetcher, { refreshInterval: 10000 });

  const alertasZona = alertasData?.alertas ?? [];
  const validaciones = validacionesData?.validaciones ?? [];
  const pendientes = validacionesData?.pendientes ?? validaciones.filter((v) => v.estado === "pendiente");
  const aprobados = validaciones.filter((v) => v.estado === "aprobado" || v.estado === "aprobado_observacion");
  const otros = validaciones.filter((v) => v.estado === "rechazado" || v.estado === "derivar_capacitacion");
  const comisionTotal = aprobados.length * COMISION_POR_VALIDACION;

  const tomarVerificacion = async (item: AlertaItem) => {
    if (!cedula) return;
    setTomandoId(item.id);
    try {
      const res = await fetch("/api/operador/tomar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fichaId: item.id, cedulaOperador: cedula }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo tomar");
      await mutateAlertas();
      await mutateValidaciones();
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo tomar la verificación.");
    } finally {
      setTomandoId(null);
    }
  };

  const aplicarDictamen = async (item: ValidacionItem, dictamen: Dictamen) => {
    if (!cedula) return;
    setDictamenandoId(item.id);
    try {
      const res = await fetch("/api/operador/dictamen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fichaId: item.id,
          cedulaOperador: cedula,
          dictamen,
          evidenciaFaltaEquipo: item.evidenciaFaltaEquipo ?? false,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo registrar el dictamen");
      if (dictamen === "APROBADO" || dictamen === "APROBADO_OBSERVACION") {
        setFeedbackNombre(item.nombreTrabajador);
        setMostrarComisionGanada(true);
        const mensaje = mensajeBienvenidaYapo(item.nombreTrabajador);
        console.log("WhatsApp bienvenida enviado a", item.whatsapp, mensaje);
      }
      await mutateValidaciones();
      setTimeout(() => setFeedbackNombre(null), 5000);
      setTimeout(() => setMostrarComisionGanada(false), 4000);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo registrar el dictamen.");
    } finally {
      setDictamenandoId(null);
    }
  };

  const reenviarBienvenida = (item: ValidacionItem) => {
    setReenviandoId(item.id);
    const mensaje = mensajeBienvenidaYapo(item.nombreTrabajador);
    console.log("Re-envío WhatsApp bienvenida a", item.whatsapp, mensaje);
    setTimeout(() => {
      setReenviandoId(null);
      setFeedbackNombre(item.nombreTrabajador);
      setTimeout(() => setFeedbackNombre(null), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8">
      <PageHero
        title={PAGES.operador.title}
        subtitle={PAGES.operador.subtitle}
        trust={PAGES.operador.trust}
        forWho={PAGES.operador.forWho}
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            {perfilGuardado && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-xl text-sm font-medium">
                <User className="w-4 h-4" /> Cédula: {cedula.slice(-4)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 px-3 py-1.5 rounded-xl font-semibold">
              <Coins className="w-4 h-4" />
              {comisionTotal.toLocaleString("es-PY")} Gs
            </span>
            {mostrarComisionGanada && (
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-sm font-bold px-2 py-1 rounded-lg animate-pulse">
                + {COMISION_POR_VALIDACION.toLocaleString("es-PY")} Gs. ganados
              </span>
            )}
          </div>
        }
      />

      <div className="space-y-8">
        {/* Perfil Operador: cédula + seccional para geofencing */}
        {!perfilGuardado ? (
          <section className="bg-white rounded-2xl p-6 shadow border-2 border-yapo-blue/30">
            <h2 className="text-lg font-semibold text-yapo-blue mb-2 flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil Operador YAPÓ
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Ingresá tu cédula y seccional para ver alertas en tu zona y cargar tus validaciones.
            </p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                  placeholder="Solo números"
                  className="input-yapo max-w-[200px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seccional Nro.</label>
                <input
                  type="text"
                  value={seccionalNro}
                  onChange={(e) => setSeccionalNro(e.target.value)}
                  placeholder="Ej. 12"
                  className="input-yapo max-w-[120px]"
                />
              </div>
              <button type="button" onClick={guardarPerfil} className="btn-yapo btn-yapo-primary min-h-[52px]">
                Guardar y cargar
              </button>
            </div>
            {errorPerfil && <p className="text-red-600 text-sm mt-2">{errorPerfil}</p>}
          </section>
        ) : null}

        {feedbackNombre && (
          <div className="flex items-center gap-3 p-4 bg-green-100 border border-green-300 rounded-xl text-green-800">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <p className="font-medium">
              Mensaje de bienvenida enviado a <strong>{feedbackNombre}</strong>
            </p>
          </div>
        )}

        {/* Geofencing: alertas en tu zona */}
        {perfilGuardado && (
          <section className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Alertas en tu zona – Tomar Verificación
            </h2>
            <p className="text-sm text-amber-800 mb-4">
              El primero que toque &quot;Tomar Verificación&quot; se queda con el suscriptor. Una vez tomada, desaparece para los demás.
            </p>
            {alertasZona.length === 0 ? (
              <p className="text-amber-800 text-sm">No hay alertas pendientes en tu zona.</p>
            ) : (
              <ul className="space-y-3">
                {alertasZona.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-amber-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{item.nombreTrabajador}</p>
                      <p className="text-sm text-gray-600">{item.oficio} · {item.fechaRegistro}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => tomarVerificacion(item)}
                      disabled={tomandoId === item.id}
                      className="btn-yapo min-h-[48px] px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold disabled:opacity-60"
                    >
                      {tomandoId === item.id ? "…" : "Tomar Verificación"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/?operador=1"
            className="bg-white rounded-2xl p-6 shadow flex items-center gap-4 hover:ring-2 hover:ring-yapo-orange"
          >
            <UserPlus className="w-10 h-10 text-yapo-blue" />
            <div>
              <h2 className="font-semibold text-yapo-blue">Carga directa (Vía B)</h2>
              <p className="text-sm text-gray-500">Registrar trabajador in situ</p>
            </div>
          </Link>
          <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
            <Camera className="w-10 h-10 text-yapo-orange" />
            <div>
              <h2 className="font-semibold text-yapo-blue">Evidencia visual</h2>
              <p className="text-sm text-gray-500">Foto con herramientas o marcar Falta equipamiento</p>
            </div>
          </div>
        </div>

        {perfilGuardado && (
          <>
            <section className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-yapo-blue mb-4">
                Validaciones pendientes de dictamen ({pendientes.length})
              </h2>
              <p className="text-xs text-gray-600 mb-4">
                Subí foto del trabajador con herramientas (Profesional Equipado) o marcá &quot;Falta de Equipamiento/equipamientos ajenos&quot;. Luego elegí un dictamen para el Comité.
              </p>
              {pendientes.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay validaciones pendientes de dictamen.</p>
              ) : (
                <ul className="space-y-4">
                  {pendientes.map((item) => (
                    <li
                      key={item.id}
                      className="p-4 rounded-xl bg-yapo-gray border border-yapo-gray-dark space-y-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-gray-900">{item.nombreTrabajador}</p>
                        <p className="text-sm text-gray-600">{item.oficio} · {item.whatsapp}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => aplicarDictamen(item, "APROBADO")}
                          disabled={dictamenandoId === item.id}
                          className="btn-yapo min-h-[44px] px-3 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          APROBADO
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarDictamen(item, "APROBADO_OBSERVACION")}
                          disabled={dictamenandoId === item.id}
                          className="btn-yapo min-h-[44px] px-3 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          APROBADO/OBSERVACIÓN – FALTA EQUIPO
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarDictamen(item, "RECHAZADO")}
                          disabled={dictamenandoId === item.id}
                          className="btn-yapo min-h-[44px] px-3 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <XCircle className="w-4 h-4" />
                          RECHAZADO
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarDictamen(item, "DERIVAR_CAPACITACION")}
                          disabled={dictamenandoId === item.id}
                          className="btn-yapo min-h-[44px] px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <GraduationCap className="w-4 h-4" />
                          DERIVAR A CAPACITACIÓN
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        APROBADO: persona real, foto auténtica, herramientas completas/básicas/visibles. FALTA EQUIPO: sabe el oficio pero no tiene herramientas. RECHAZADO: datos falsos o no sabe del oficio. DERIVAR: no tiene oficio, busca capacitación.
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-yapo-blue mb-4">
                Historial de validaciones (dictámenes al Comité)
              </h2>
              <ul className="space-y-4">
                {aprobados.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{item.nombreTrabajador}</p>
                      <p className="text-sm text-gray-600">
                        {item.oficio} · {item.fechaRegistro ?? ""}
                        {item.estado === "aprobado_observacion" && " · Aprobado/Observación – Falta equipo"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => reenviarBienvenida(item)}
                      disabled={reenviandoId === item.id}
                      className="btn-yapo min-h-[44px] px-3 text-sm border-2 border-yapo-blue text-yapo-blue hover:bg-yapo-blue hover:text-white rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      {reenviandoId === item.id ? "Enviando…" : "Re-enviar Bienvenida"}
                    </button>
                  </li>
                ))}
                {otros.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200"
                  >
                    {item.estado === "rechazado" ? <XCircle className="w-5 h-5 text-red-600 shrink-0" /> : <GraduationCap className="w-5 h-5 text-blue-600 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{item.nombreTrabajador}</p>
                      <p className="text-sm text-gray-600">
                        {item.oficio} · {item.fechaRegistro ?? ""}
                        {item.estado === "rechazado" ? " · Rechazado" : " · Derivado a capacitación"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {validaciones.length === 0 && (
                <p className="text-gray-500 text-sm">Aún no tenés validaciones asignadas.</p>
              )}
            </section>
          </>
        )}

        <div className="bg-yapo-orange/10 rounded-2xl p-4 border border-yapo-orange/30">
          <p className="text-sm font-medium text-yapo-blue">
            <strong>Incentivo:</strong> Por cada validación con dictamen APROBADO o APROBADO/OBSERVACIÓN sumás{" "}
            <strong>{COMISION_POR_VALIDACION.toLocaleString("es-PY")} Gs</strong>. El primero que toma la verificación (geofencing) se queda con el suscriptor.
          </p>
        </div>

        <div className="bg-white rounded-[14px] border border-gray-200/60 shadow-card p-6 flex items-center gap-4">
          <MapPin className="w-10 h-10 text-dash-blue shrink-0" />
          <div>
            <h2 className="font-semibold text-dash-blue">Zona de cobertura (Operador YAPÓ)</h2>
            <p className="text-sm text-dash-muted">Mapa de validación activa por geofencing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
