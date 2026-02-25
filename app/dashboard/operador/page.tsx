"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import useSWR from "swr";
import Image from "next/image";
import { UserPlus, Camera, MapPin, CheckCircle2, Send, Coins, AlertTriangle, GraduationCap, XCircle, User, Navigation, Wallet, ArrowDownCircle, ArrowUpCircle, Link2, Unlink, Bell, Shield } from "lucide-react";
import { mensajeBienvenidaYapo } from "@/lib/messages/whatsappBienvenida";
import { PAGES } from "@/lib/copy/dashboard";
import PageHero from "@/components/dashboard/PageHero";
import { COMISION_POR_VALIDACION } from "@/lib/constants/comision";
const OPERADOR_CEDULA_KEY = "operador_yapo_cedula";
const OPERADOR_SECCIONAL_KEY = "operador_yapo_seccional";
/** Tiempo en segundos que tiene el operador para tomar la orden (5 min). */
const TIEMPO_PARA_TOMAR_SEG = 300;

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
  gpsLat?: number | null;
  gpsLng?: number | null;
  lugarValidacion?: string | null;
}

interface AlertaItem {
  id: string;
  nombreTrabajador: string;
  cedulaNro?: string;
  oficio: string;
  whatsapp: string;
  email?: string | null;
  fechaRegistro: string;
  createdAt?: string;
  seccionalNro?: string;
  gestorZona?: string;
  cargoGestor?: string | null;
  gpsLat?: number | null;
  gpsLng?: number | null;
  gpsVerificado?: boolean;
}

function wazeUrl(lat: number, lng: number): string {
  return `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardOperadorPage() {
  const [cedula, setCedula] = useState("");
  const [seccionalNro, setSeccionalNro] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [whatsappOperador, setWhatsappOperador] = useState("");
  const [perfilGuardado, setPerfilGuardado] = useState(false);
  const [feedbackNombre, setFeedbackNombre] = useState<string | null>(null);
  const [reenviandoId, setReenviandoId] = useState<string | null>(null);
  const [mostrarComisionGanada, setMostrarComisionGanada] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);
  const [tomandoId, setTomandoId] = useState<string | null>(null);
  const [dictamenandoId, setDictamenandoId] = useState<string | null>(null);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState<Record<string, number>>({});
  const [lugarValidacionSeleccionado, setLugarValidacionSeleccionado] = useState<Record<string, string>>({});

  useEffect(() => {
    const c = typeof window !== "undefined" ? localStorage.getItem(OPERADOR_CEDULA_KEY) : null;
    const s = typeof window !== "undefined" ? localStorage.getItem(OPERADOR_SECCIONAL_KEY) : null;
    if (c) setCedula(c);
    if (s) setSeccionalNro(s);
    if (c) setPerfilGuardado(true);
    // #region agent log
    fetch("http://127.0.0.1:7245/ingest/039a586b-016e-41a6-bbd7-7d228a8b81c8", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4fa08" },
      body: JSON.stringify({ sessionId: "a4fa08", location: "operador/page.tsx:mount", message: "operador page mounted", data: { hasCedula: !!c, hasSeccional: !!s }, timestamp: Date.now(), hypothesisId: "C" }),
    }).catch(() => {});
    // #endregion
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
        body: JSON.stringify({
          cedula: c,
          seccionalNro: s,
          nombreCompleto: nombreCompleto.trim() || null,
          whatsapp: whatsappOperador.trim() || null,
        }),
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
  }, [cedula, seccionalNro, nombreCompleto, whatsappOperador]);

  const operadorProfileUrl = perfilGuardado && cedula ? `/api/operador?cedula=${encodeURIComponent(cedula)}` : null;
  const { data: operadorProfileRaw, error: operadorProfileError, mutate: mutateOperadorProfile } = useSWR<{ nombreCompleto?: string | null; whatsapp?: string | null; avatarUrl?: string | null; error?: string }>(operadorProfileUrl, fetcher);
  // #region agent log
  if (typeof window !== "undefined") {
    fetch("http://127.0.0.1:7245/ingest/039a586b-016e-41a6-bbd7-7d228a8b81c8", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4fa08" },
      body: JSON.stringify({
        sessionId: "a4fa08",
        location: "operador/page.tsx:SWR",
        message: "operador profile state",
        data: { operadorProfileUrl, hasData: !!operadorProfileRaw, hasError: !!operadorProfileError, dataKeys: operadorProfileRaw ? Object.keys(operadorProfileRaw) : [], errorInData: operadorProfileRaw && "error" in operadorProfileRaw ? (operadorProfileRaw as { error?: string }).error : null },
        timestamp: Date.now(),
        hypothesisId: "A",
      }),
    }).catch(() => {});
  }
  // #endregion
  const operadorProfile = operadorProfileRaw && !("error" in operadorProfileRaw && operadorProfileRaw.error) ? operadorProfileRaw : undefined;
  const operadorAvatarInputRef = useRef<HTMLInputElement>(null);

  const actualizarAvatarOperador = useCallback(
    async (dataUrl: string) => {
      if (!cedula.trim() || !seccionalNro.trim()) return;
      try {
        const res = await fetch("/api/operador", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cedula: cedula.trim(),
            seccionalNro: seccionalNro.trim(),
            nombreCompleto: nombreCompleto.trim() || null,
            whatsapp: whatsappOperador.trim() || null,
            avatarUrl: dataUrl,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        await mutateOperadorProfile();
      } catch (e) {
        alert(e instanceof Error ? e.message : "No se pudo actualizar la foto.");
      }
    },
    [cedula, seccionalNro, nombreCompleto, whatsappOperador, mutateOperadorProfile]
  );

  const handleOperadorAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => actualizarAvatarOperador(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  useEffect(() => {
    if (operadorProfile?.nombreCompleto) setNombreCompleto(operadorProfile.nombreCompleto);
    if (operadorProfile?.whatsapp) setWhatsappOperador(operadorProfile.whatsapp ?? "");
  }, [operadorProfile?.nombreCompleto, operadorProfile?.whatsapp]);

  const alertasUrl = perfilGuardado && cedula ? `/api/operador/alertas?cedula=${encodeURIComponent(cedula)}` : null;
  const misValidacionesUrl = perfilGuardado && cedula ? `/api/operador/mis-validaciones?cedulaOperador=${encodeURIComponent(cedula)}` : null;
  const statsUrl = perfilGuardado && cedula ? `/api/operador/stats?cedula=${encodeURIComponent(cedula)}` : null;

  const { data: alertasData, mutate: mutateAlertas } = useSWR<{ alertas: AlertaItem[]; total: number }>(alertasUrl, fetcher, { refreshInterval: 15000 });
  const { data: statsData } = useSWR<{ totalValidados: number; validadosEsteMes: number; pendientesDictamen: number }>(statsUrl, fetcher, { refreshInterval: 20000 });
  const { data: validacionesData, mutate: mutateValidaciones } = useSWR<{
    validaciones: ValidacionItem[];
    pendientes: ValidacionItem[];
    conDictamen: ValidacionItem[];
    total: number;
  }>(misValidacionesUrl, fetcher, { refreshInterval: 10000 });

  const alertasZona = alertasData?.alertas ?? [];

  // Countdown para tomar orden (5 min desde createdAt de cada alerta)
  useEffect(() => {
    if (alertasZona.length === 0) {
      setSegundosRestantes({});
      return;
    }
    const update = () => {
      const next: Record<string, number> = {};
      const now = Date.now() / 1000;
      for (const a of alertasZona) {
        const created = a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0;
        const elapsed = now - created;
        const rest = Math.max(0, Math.floor(TIEMPO_PARA_TOMAR_SEG - elapsed));
        next[a.id] = rest;
      }
      setSegundosRestantes(next);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [alertasZona.length, alertasZona.map((a) => a.id + (a.createdAt ?? "")).join(",")]);
  const validaciones = validacionesData?.validaciones ?? [];
  const pendientes = validacionesData?.pendientes ?? validaciones.filter((v) => v.estado === "pendiente");
  const aprobados = validaciones.filter((v) => v.estado === "aprobado" || v.estado === "aprobado_observacion");
  const otros = validaciones.filter((v) => v.estado === "rechazado" || v.estado === "derivar_capacitacion");
  const comisionTotal = aprobados.length * COMISION_POR_VALIDACION;

  const billeteraUrl = perfilGuardado && cedula ? `/api/operador/billetera?cedula=${encodeURIComponent(cedula)}` : null;
  const { data: billeteraData, mutate: mutateBilletera } = useSWR<{
    saldoYapo: number;
    mangoVinculado: boolean;
    mangoPhone: string | null;
    movimientos: { id: string; tipo: string; monto: number; referencia: string | null; estado: string; createdAt: string }[];
  }>(billeteraUrl, fetcher);
  const [mangoPhoneInput, setMangoPhoneInput] = useState("");
  const [retiroMonto, setRetiroMonto] = useState("");
  const [retiroDestino, setRetiroDestino] = useState<"MANGO" | "CUENTA_BANCARIA" | null>(null);
  const [retiroBanco, setRetiroBanco] = useState("");
  const [retiroNumeroCuenta, setRetiroNumeroCuenta] = useState("");
  const [loadingVincular, setLoadingVincular] = useState(false);
  const [loadingRetirar, setLoadingRetirar] = useState(false);
  const [errorBilletera, setErrorBilletera] = useState<string | null>(null);
  const [exitoBilletera, setExitoBilletera] = useState<string | null>(null);

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
    const lugar = lugarValidacionSeleccionado[item.id] || null;
    try {
      const res = await fetch("/api/operador/dictamen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fichaId: item.id,
          cedulaOperador: cedula,
          dictamen,
          evidenciaFaltaEquipo: item.evidenciaFaltaEquipo ?? false,
          lugarValidacion: lugar || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo registrar el dictamen");
      if (dictamen === "APROBADO" || dictamen === "APROBADO_OBSERVACION") {
        setFeedbackNombre(item.nombreTrabajador);
        setMostrarComisionGanada(true);
        const mensaje = mensajeBienvenidaYapo(item.nombreTrabajador);
        console.log("WhatsApp bienvenida enviado a", item.whatsapp, mensaje);
        await mutateBilletera();
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

  const vincularMango = async () => {
    if (!cedula) return;
    setErrorBilletera(null);
    setLoadingVincular(true);
    try {
      const res = await fetch("/api/operador/billetera/vincular-mango", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula, mangoPhone: mangoPhoneInput.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo vincular");
      setMangoPhoneInput("");
      await mutateBilletera();
    } catch (e) {
      setErrorBilletera(e instanceof Error ? e.message : "Error al vincular Mango.");
    } finally {
      setLoadingVincular(false);
    }
  };

  const desvincularMango = async () => {
    if (!cedula) return;
    setErrorBilletera(null);
    setLoadingVincular(true);
    try {
      const res = await fetch("/api/operador/billetera/vincular-mango", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula, mangoPhone: "" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo desvincular");
      await mutateBilletera();
    } catch (e) {
      setErrorBilletera(e instanceof Error ? e.message : "Error al desvincular.");
    } finally {
      setLoadingVincular(false);
    }
  };

  const solicitarRetiro = async () => {
    if (!cedula || !retiroDestino) return;
    const monto = parseInt(String(retiroMonto || "0").replace(/\D/g, ""), 10);
    if (!Number.isFinite(monto) || monto <= 0) {
      setErrorBilletera("Ingresá un monto válido en Gs.");
      return;
    }
    if (retiroDestino === "CUENTA_BANCARIA" && (!retiroBanco.trim() || !retiroNumeroCuenta.trim())) {
      setErrorBilletera("Para retirar a cuenta bancaria completá banco y número de cuenta.");
      return;
    }
    setErrorBilletera(null);
    setExitoBilletera(null);
    setLoadingRetirar(true);
    try {
      const body: { cedula: string; destino: "MANGO" | "CUENTA_BANCARIA"; monto: number; banco?: string; numeroCuenta?: string } = {
        cedula,
        destino: retiroDestino,
        monto,
      };
      if (retiroDestino === "CUENTA_BANCARIA") {
        body.banco = retiroBanco.trim();
        body.numeroCuenta = retiroNumeroCuenta.trim();
      }
      const res = await fetch("/api/operador/billetera/retirar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo procesar el retiro");
      setRetiroMonto("");
      setRetiroDestino(null);
      setRetiroBanco("");
      setRetiroNumeroCuenta("");
      setExitoBilletera(json.mensaje || (retiroDestino === "MANGO" ? "Retiro a Mango registrado." : "Retiro a cuenta bancaria registrado."));
      setTimeout(() => setExitoBilletera(null), 6000);
      await mutateBilletera();
    } catch (e) {
      setErrorBilletera(e instanceof Error ? e.message : "Error al retirar.");
    } finally {
      setLoadingRetirar(false);
    }
  };

  const cerrarFormRetiro = () => {
    setRetiroDestino(null);
    setRetiroMonto("");
    setRetiroBanco("");
    setRetiroNumeroCuenta("");
    setErrorBilletera(null);
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
              <>
                <button
                  type="button"
                  onClick={() => setNotificacionesAbiertas((v) => !v)}
                  className="relative inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all"
                  aria-label="Notificaciones"
                >
                  <Bell className="w-5 h-5" />
                  Notificaciones
                  {alertasZona.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {alertasZona.length}
                    </span>
                  )}
                </button>
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-xl text-sm font-medium">
                  <User className="w-4 h-4" /> Cédula: {cedula.slice(-4)}
                </span>
              </>
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
        {/* Panel de notificaciones (campanita) */}
        {perfilGuardado && notificacionesAbiertas && (
          <section className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {alertasZona.length > 0
                ? `Tenés ${alertasZona.length} nuevo${alertasZona.length === 1 ? "" : "s"} suscriptor${alertasZona.length === 1 ? "" : "es"} que busca${alertasZona.length === 1 ? "n" : "n"} validación (online, in situ o en su lugar de trabajo)`
                : "No hay nuevas notificaciones de validación"}
            </h2>
            {alertasZona.length > 0 && (
              <p className="text-sm text-amber-800 mb-3">El primero que toque &quot;Tomar Verificación&quot; se queda con el suscriptor. Revisá la lista más abajo y el tiempo para responder.</p>
            )}
          </section>
        )}

        {/* KPIs para el operador: validados, por mes, pendientes */}
        {perfilGuardado && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statsUrl && !statsData ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow border border-gray-200 animate-pulse" aria-hidden>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                    <div className="h-8 w-20 bg-gray-200 rounded" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-4 shadow border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">Cantidad de validados</p>
                  <p className="text-2xl font-bold text-yapo-blue">{(statsData?.totalValidados ?? 0).toLocaleString("es-PY")}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">Validados este mes</p>
                  <p className="text-2xl font-bold text-green-600">{(statsData?.validadosEsteMes ?? 0).toLocaleString("es-PY")}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">Validaciones pendientes de dictamen</p>
                  <p className="text-2xl font-bold text-amber-600">{(statsData?.pendientesDictamen ?? pendientes.length).toLocaleString("es-PY")}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Perfil Operador: cédula, seccional, nombre, WhatsApp, avatar */}
        {!perfilGuardado ? (
          <section className="bg-white rounded-2xl p-6 shadow border-2 border-yapo-blue/30">
            <h2 className="text-lg font-semibold text-yapo-blue mb-2 flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil Operador YAPÓ
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Ingresá tu cédula, seccional y datos de contacto para ver alertas en tu zona.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                  placeholder="Solo números"
                  className="input-yapo w-full max-w-[200px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seccional Nro.</label>
                <input
                  type="text"
                  value={seccionalNro}
                  onChange={(e) => setSeccionalNro(e.target.value)}
                  placeholder="Ej. 12"
                  className="input-yapo w-full max-w-[120px]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="input-yapo w-full max-w-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (tu número)</label>
                <input
                  type="text"
                  value={whatsappOperador}
                  onChange={(e) => setWhatsappOperador(e.target.value)}
                  placeholder="Ej. 0981 123 456"
                  className="input-yapo w-full max-w-xs"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={guardarPerfil}
              className="btn-yapo btn-yapo-primary min-h-[52px] mt-3 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-2 border-yapo-blue/80"
            >
              Guardar y cargar
            </button>
            {errorPerfil && <p className="text-red-600 text-sm mt-2">{errorPerfil}</p>}
          </section>
        ) : (
          <section className="bg-white rounded-2xl p-6 shadow border-2 border-yapo-blue/20 flex flex-wrap items-center gap-4">
            <input
              ref={operadorAvatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-hidden
              onChange={handleOperadorAvatarChange}
            />
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => operadorAvatarInputRef.current?.click()}
                className="relative w-14 h-14 rounded-full overflow-hidden bg-yapo-blue/20 ring-2 ring-yapo-blue/40 flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yapo-blue"
                title="Cambiar foto de perfil"
              >
                {operadorProfile?.avatarUrl && typeof operadorProfile.avatarUrl === "string" && (operadorProfile.avatarUrl.startsWith("data:") || operadorProfile.avatarUrl.startsWith("http") || operadorProfile.avatarUrl.startsWith("/")) ? (
                  <Image
                    src={operadorProfile.avatarUrl}
                    alt=""
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                    unoptimized={operadorProfile.avatarUrl.startsWith("data:")}
                  />
                ) : (
                  <span className="text-lg font-bold text-yapo-blue">
                    {(() => {
                      const n = (operadorProfile?.nombreCompleto || nombreCompleto || "").trim();
                      if (!n) return "O";
                      const parts = n.split(/\s+/);
                      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                      return n.slice(0, 2).toUpperCase();
                    })()}
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera className="w-6 h-6 text-white" aria-hidden />
                </span>
              </button>
              <div>
                <p className="font-semibold text-gray-900">{operadorProfile?.nombreCompleto || nombreCompleto || "Operador YAPÓ"}</p>
                <p className="text-sm text-gray-600">Cédula: {cedula.slice(-4)} · Seccional {seccionalNro}</p>
                {(operadorProfile?.whatsapp || whatsappOperador) && (
                  <a
                    href={`https://wa.me/595${(operadorProfile?.whatsapp || whatsappOperador).replace(/\D/g, "").slice(-9)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline"
                  >
                    WhatsApp: {operadorProfile?.whatsapp || whatsappOperador}
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {feedbackNombre && (
          <div className="flex items-center gap-3 p-4 bg-green-100 border border-green-300 rounded-xl text-green-800">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <p className="font-medium">
              Mensaje de bienvenida enviado a <strong>{feedbackNombre}</strong>
            </p>
          </div>
        )}

        {/* Notificaciones de validación: lista con datos del suscriptor, WhatsApp, GPS, seguridad y countdown */}
        {perfilGuardado && (
          <section className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones de validación – Lista de validaciones pendientes
            </h2>
            <p className="text-sm text-amber-800 mb-4">
              Nuevos suscriptores que buscan validación (online, in situ o en su lugar de trabajo). Contactalos por WhatsApp y tocá &quot;Tomar Verificación&quot; para asignarte la orden. Tenés 5 minutos para responder.
            </p>
            {alertasUrl && alertasData === undefined ? (
              <ul className="space-y-4" aria-hidden>
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex flex-wrap gap-3 p-4 rounded-xl bg-white border-2 border-amber-200 animate-pulse">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-5 w-40 bg-gray-200 rounded" />
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                    </div>
                    <div className="h-10 w-36 bg-gray-200 rounded-xl" />
                  </li>
                ))}
              </ul>
            ) : alertasZona.length === 0 ? (
              <p className="text-amber-800 text-sm">No hay notificaciones pendientes en tu zona.</p>
            ) : (
              <ul className="space-y-4">
                {alertasZona.map((item) => {
                  const seg = segundosRestantes[item.id] ?? 0;
                  const min = Math.floor(seg / 60);
                  const s = seg % 60;
                  return (
                    <li
                      key={item.id}
                      className="flex flex-wrap gap-3 p-4 rounded-xl bg-white border-2 border-amber-200"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-semibold text-gray-900">{item.nombreTrabajador}</p>
                        {item.cedulaNro && <p className="text-sm text-gray-600">Cédula: {item.cedulaNro}</p>}
                        <p className="text-sm text-gray-600">Oficio: {item.oficio}</p>
                        <a
                          href={`https://wa.me/595${(item.whatsapp || "").replace(/\D/g, "").slice(-9)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:underline"
                        >
                          WhatsApp: {item.whatsapp}
                        </a>
                        {item.email && <p className="text-sm text-gray-600">Email: {item.email}</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.gpsVerificado && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-100 text-green-800 text-xs font-medium">
                              <MapPin className="w-3 h-3" /> GPS verificado
                            </span>
                          )}
                          {(item.seccionalNro || item.gestorZona) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-medium">
                              <Shield className="w-3 h-3" /> Seguridad: Seccional {item.seccionalNro ?? "—"} · {item.gestorZona ?? "—"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-700 font-medium mt-1">
                          Tiempo para tomar la orden: {min}:{s.toString().padStart(2, "0")}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {typeof item.gpsLat === "number" && typeof item.gpsLng === "number" && (
                          <a
                            href={wazeUrl(item.gpsLat, item.gpsLng)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-cyan-500/15 text-cyan-700 hover:bg-cyan-500/25 border-2 border-cyan-500/50 shadow-sm hover:shadow transition-all"
                          >
                            <Navigation className="w-4 h-4" /> Cómo llegar (Waze)
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => tomarVerificacion(item)}
                          disabled={tomandoId === item.id || seg <= 0}
                          className="btn-yapo min-h-[48px] px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold disabled:opacity-60 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-2 border-amber-600/50"
                        >
                          {tomandoId === item.id ? "…" : seg <= 0 ? "Tiempo agotado" : "Tomar Verificación"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/?operador=1"
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg flex items-center gap-4 border-2 border-transparent hover:border-yapo-orange/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="w-14 h-14 rounded-xl bg-yapo-blue/10 group-hover:bg-yapo-blue/20 flex items-center justify-center transition-colors shrink-0">
              <UserPlus className="w-8 h-8 text-yapo-blue" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-yapo-blue">Carga directa (Vía B)</h2>
              <p className="text-sm text-gray-600">Registrar trabajador in situ</p>
            </div>
          </Link>
          <div className="bg-white rounded-2xl p-6 shadow-md flex items-center gap-4 border-2 border-amber-200/60">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Camera className="w-8 h-8 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-yapo-blue">Evidencia visual</h2>
              <p className="text-sm text-gray-600">Foto con herramientas o marcar Falta equipamiento</p>
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
                <p className="text-gray-600 text-sm">No hay validaciones pendientes de dictamen.</p>
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
                        {typeof item.gpsLat === "number" && typeof item.gpsLng === "number" && (
                          <a
                            href={wazeUrl(item.gpsLat, item.gpsLng)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#33CCFF]/15 text-[#33CCFF] hover:bg-[#33CCFF]/25 border border-[#33CCFF]/40 ml-auto"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            Waze
                          </a>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Lugar de validación:</label>
                        <select
                          value={lugarValidacionSeleccionado[item.id] ?? ""}
                          onChange={(e) => setLugarValidacionSeleccionado((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          className="input-yapo text-sm max-w-[200px]"
                        >
                          <option value="">Seleccionar</option>
                          <option value="IN_SITU">In situ</option>
                          <option value="LUGAR_TRABAJO">En su lugar de trabajo</option>
                          <option value="CASA">En su casa (verificar dónde vive)</option>
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => aplicarDictamen(item, "APROBADO")}
                          disabled={dictamenandoId === item.id}
                          className="btn-yapo min-h-[48px] px-3 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-1.5 disabled:opacity-60 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 border-2 border-green-700/50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          APROBADO
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarDictamen(item, "APROBADO_OBSERVACION")}
                          disabled={dictamenandoId === item.id}
                          className="btn-yapo min-h-[48px] px-3 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl flex items-center gap-1.5 disabled:opacity-60 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 border-2 border-amber-600/50"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          APROBADO/OBSERVACIÓN – FALTA EQUIPO
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarDictamen(item, "RECHAZADO")}
                          disabled={dictamenandoId === item.id}
                          className="btn-yapo min-h-[48px] px-3 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-1.5 disabled:opacity-60 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 border-2 border-red-700/50"
                        >
                          <XCircle className="w-4 h-4" />
                          RECHAZADO
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarDictamen(item, "DERIVAR_CAPACITACION")}
                          disabled={dictamenandoId === item.id}
                          className="btn-yapo min-h-[48px] px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 disabled:opacity-60 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 border-2 border-blue-700/50"
                        >
                          <GraduationCap className="w-4 h-4" />
                          DERIVAR A CAPACITACIÓN
                        </button>
                      </div>
                      <p className="text-xs text-gray-600">
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
                        {item.lugarValidacion && (
                          <span className="text-gray-600">
                            {" "}· {item.lugarValidacion === "IN_SITU" ? "In situ" : item.lugarValidacion === "LUGAR_TRABAJO" ? "Lugar de trabajo" : "En su casa"}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => reenviarBienvenida(item)}
                      disabled={reenviandoId === item.id}
                      className="btn-yapo min-h-[48px] px-3 text-sm border-2 border-yapo-blue text-yapo-blue hover:bg-yapo-blue hover:text-white rounded-xl disabled:opacity-50 flex items-center gap-1.5 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
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
                        {item.lugarValidacion && (
                          <span className="text-gray-600">
                            {" "}· {item.lugarValidacion === "IN_SITU" ? "In situ" : item.lugarValidacion === "LUGAR_TRABAJO" ? "Lugar de trabajo" : "En su casa"}
                          </span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {validaciones.length === 0 && (
                <p className="text-gray-600 text-sm">Aún no tenés validaciones asignadas.</p>
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

        <section className="bg-white rounded-2xl shadow p-6 border border-gray-200/60">
          <h2 className="text-lg font-semibold text-yapo-blue mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5" /> Billeteras
          </h2>
          {errorBilletera && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {errorBilletera}
            </div>
          )}
          {exitoBilletera && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {exitoBilletera}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Billetera Mango: vincular cuenta personal y retirar a Mango */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 flex items-center justify-center border border-gray-200">
                  <Image src="/images/billetera-mango.png" alt="" width={56} height={56} className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Billetera Mango</p>
                  <p className="text-sm text-gray-600">Tu cuenta personal Mango (Tu Financiera)</p>
                </div>
              </div>
              {billeteraData?.mangoVinculado && billeteraData.mangoPhone ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-green-600" /> Vinculada: {billeteraData.mangoPhone}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={desvincularMango}
                      disabled={loadingVincular}
                      className="btn-yapo min-h-[48px] px-3 text-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-xl disabled:opacity-60 flex items-center gap-1.5 shadow-sm hover:shadow transition-all duration-200"
                    >
                      <Unlink className="w-4 h-4" /> {loadingVincular ? "…" : "Desvincular"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRetiroDestino("MANGO")}
                      disabled={loadingRetirar || (billeteraData?.saldoYapo ?? 0) <= 0}
                      className="btn-yapo min-h-[48px] px-3 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl disabled:opacity-60 flex items-center gap-1.5 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-2 border-amber-600/50"
                    >
                      <ArrowUpCircle className="w-4 h-4" /> Retirar a Mango
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Teléfono Mango (ej. 0981123456)</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={mangoPhoneInput}
                      onChange={(e) => setMangoPhoneInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="0981123456"
                      className="input-yapo flex-1 min-w-0 text-sm"
                    />
                    <button
                      type="button"
                      onClick={vincularMango}
                      disabled={loadingVincular || !mangoPhoneInput.trim()}
                      className="btn-yapo min-h-[48px] px-4 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl disabled:opacity-60 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-2 border-amber-600/50"
                    >
                      {loadingVincular ? "…" : "Vincular"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Paga Billetera YAPÓ: saldo y retiros */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 flex items-center justify-center border border-gray-200">
                  <Image src="/images/billetera-yapo.png" alt="" width={56} height={56} className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Paga Billetera YAPÓ</p>
                  <p className="text-sm text-gray-600">Saldo por comisiones de validación</p>
                </div>
              </div>
              <p className="text-lg font-bold text-yapo-blue flex items-center gap-1.5">
                <Coins className="w-5 h-5" /> {(billeteraData?.saldoYapo ?? 0).toLocaleString("es-PY")} Gs
              </p>
              <div className="flex flex-wrap gap-2">
                {billeteraData?.mangoVinculado && (
                  <button
                    type="button"
                    onClick={() => setRetiroDestino("MANGO")}
                    disabled={loadingRetirar || (billeteraData?.saldoYapo ?? 0) <= 0}
                    className="btn-yapo min-h-[48px] px-3 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl disabled:opacity-60 flex items-center gap-1.5 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-2 border-amber-600/50"
                  >
                    Retirar a Mango
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setRetiroDestino("CUENTA_BANCARIA")}
                  disabled={loadingRetirar || (billeteraData?.saldoYapo ?? 0) <= 0}
                  className="btn-yapo min-h-[48px] px-3 text-sm bg-yapo-blue hover:bg-yapo-blue/90 text-white rounded-xl disabled:opacity-60 flex items-center gap-1.5 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-2 border-yapo-blue/80"
                >
                  <ArrowDownCircle className="w-4 h-4" /> Retirar a cuenta bancaria
                </button>
              </div>
            </div>
          </div>

          {/* Formulario de retiro (monto y datos) cuando el usuario eligió destino */}
          {retiroDestino && (
            <div className="mt-4 p-4 rounded-xl border-2 border-yapo-blue/30 bg-blue-50/50 space-y-3">
              <p className="text-sm font-medium text-gray-800">
                {retiroDestino === "MANGO" ? "Retirar a Billetera Mango" : "Retirar a cuenta bancaria"}
              </p>
              {retiroDestino === "CUENTA_BANCARIA" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Banco <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={retiroBanco}
                      onChange={(e) => setRetiroBanco(e.target.value)}
                      placeholder="Ej. Banco Nacional de Fomento"
                      className="input-yapo w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Número de cuenta <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={retiroNumeroCuenta}
                      onChange={(e) => setRetiroNumeroCuenta(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ej. 1234567890"
                      className="input-yapo w-full text-sm"
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">Monto (Gs)</label>
                  <input
                    type="text"
                    value={retiroMonto}
                    onChange={(e) => setRetiroMonto(e.target.value.replace(/\D/g, ""))}
                    placeholder="Monto en Gs"
                    className="input-yapo w-full max-w-[180px] text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={solicitarRetiro}
                  disabled={
                    loadingRetirar ||
                    !retiroMonto.trim() ||
                    (retiroDestino === "CUENTA_BANCARIA" && (!retiroBanco.trim() || !retiroNumeroCuenta.trim()))
                  }
                  className="btn-yapo min-h-[48px] px-4 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-60 mt-5 sm:mt-0 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-2 border-green-700/50"
                >
                  {loadingRetirar ? "Procesando…" : "Confirmar retiro"}
                </button>
                <button
                  type="button"
                  onClick={cerrarFormRetiro}
                  className="btn-yapo min-h-[48px] px-4 text-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl mt-5 sm:mt-0 transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Saldo disponible: {(billeteraData?.saldoYapo ?? 0).toLocaleString("es-PY")} Gs
              </p>
            </div>
          )}

          {/* Últimos movimientos: prueba de que retiros y comisiones se registran */}
          {billeteraData?.movimientos && billeteraData.movimientos.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-yapo-blue mb-2">Últimos movimientos</h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {billeteraData.movimientos.slice(0, 15).map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700">
                      {m.tipo === "COMISION_ACREDITADA" && "Comisión acreditada"}
                      {m.tipo === "RETIRO_MANGO" && "Retiro a Mango"}
                      {m.tipo === "RETIRO_CUENTA_BANCARIA" && "Retiro a cuenta bancaria"}
                      {!["COMISION_ACREDITADA", "RETIRO_MANGO", "RETIRO_CUENTA_BANCARIA"].includes(m.tipo) && m.tipo}
                      {m.referencia && (
                        <span className="text-gray-600 ml-1">· {m.referencia}</span>
                      )}
                    </span>
                    <span className={m.tipo === "COMISION_ACREDITADA" ? "text-green-600 font-medium" : "text-gray-700"}>
                      {m.tipo === "COMISION_ACREDITADA" ? "+" : "-"}
                      {m.monto.toLocaleString("es-PY")} Gs
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <Link
          href="/dashboard/operador/mapa"
          className="bg-white rounded-2xl border-2 border-yapo-blue/30 shadow-md hover:shadow-lg hover:border-yapo-blue/50 p-6 flex items-center gap-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] group"
        >
          <div className="w-14 h-14 rounded-xl bg-yapo-blue/10 flex items-center justify-center group-hover:bg-yapo-blue/20 transition-colors shrink-0">
            <MapPin className="w-8 h-8 text-yapo-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-yapo-blue">Zona de cobertura (Operador YAPÓ)</h2>
            <p className="text-sm text-gray-600">Ver mapa de validación activa por geofencing</p>
          </div>
          <span className="text-yapo-blue font-medium text-sm shrink-0 group-hover:underline">Ver mapa →</span>
        </Link>
      </div>
    </div>
  );
}
