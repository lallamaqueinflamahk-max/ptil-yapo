"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hammer,
  MapPin,
  Camera,
  ChevronRight,
  ChevronLeft,
  ScanLine,
  CheckCircle2,
  Sparkles,
  Home,
  Briefcase,
  Info,
  Search,
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import { getGrupoPreclasificacion } from "@/lib/utils/preclasificacion";
import { buildSubscriptor } from "@/lib/utils/buildSubscriptor";
import { getMasterKey, FAKE_FORM_DATA, FAKE_GPS } from "@/lib/utils/masterKey";
import GuiaOperador from "@/components/GuiaOperador";
import Link from "next/link";
import {
  tipificarOficioIA as tipificarOficioIAClient,
  type TipificacionOficioResult,
} from "@/lib/api/tipificarOficio";

export type FormData = {
  nombreCompleto: string;
  cedula: string;
  whatsapp: string;
  email: string;
  facebook: string;
  instagram: string;
  oficioPrincipal: string;
  oficioSecundario: string;
  anosExperiencia: string;
  nivelEstudios: string;
  situacion: string;
  seguroSocial: boolean;
  selfieDataUrl: string | null;
  gpsActivo: boolean;
  promotor: string;
  gestorZona: string;
  cargoGestor: string;
  seccionalNro: string;
  cedulaOperador: string;
};

const defaultData: FormData = {
  nombreCompleto: "",
  cedula: "",
  whatsapp: "",
  email: "",
  facebook: "",
  instagram: "",
  oficioPrincipal: "",
  oficioSecundario: "",
  anosExperiencia: "",
  nivelEstudios: "",
  situacion: "",
  seguroSocial: false,
  selfieDataUrl: null,
  gpsActivo: false,
  promotor: "Juan Referente",
  gestorZona: "",
  cargoGestor: "",
  seccionalNro: "",
  cedulaOperador: "",
};

const NIVEL_ESTUDIOS = ["SNPP", "SINAFOCAL", "Otros", "Empírico"];
const SITUACION = ["Desempleado", "Contratado", "Independiente"];
const GESTORES = ["Juan Referente", "Juan Pérez", "María García", "Carlos López"];
const CARGOS = ["Presidente de Seccional", "Convencional"];

interface RegisterFormProps {
  onClose: () => void;
  isOperatorFlow?: boolean;
}

export default function RegisterForm({
  onClose,
  isOperatorFlow = false,
}: RegisterFormProps) {
  const masterKey = getMasterKey();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(defaultData);
  const [gpsChecked, setGpsChecked] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsCasaCoords, setGpsCasaCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLaburoCoords, setGpsLaburoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tipificacionIA, setTipificacionIA] = useState<TipificacionOficioResult | null>(null);
  const [tipificacionLoading, setTipificacionLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [codigoVerificacion, setCodigoVerificacion] = useState<string | null>(null);
  const { toasts, success, error, dismiss } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (masterKey) {
      setData({ ...FAKE_FORM_DATA });
      setGpsCoords(FAKE_GPS);
      setGpsCasaCoords(FAKE_GPS);
      setGpsLaburoCoords(FAKE_GPS);
    }
  }, [masterKey]);

  const update = (key: keyof FormData, value: string | boolean | null) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep1 = () => {
    if (masterKey) return true;
    return (
      data.nombreCompleto.trim() !== "" &&
      data.cedula.trim() !== "" &&
      data.whatsapp.trim() !== "" &&
      /^[0-9+\s-]+$/.test(data.whatsapp)
    );
  };

  const validateStep2 = () => {
    if (masterKey) return true;
    const hasOficio = data.oficioPrincipal.trim() !== "";
    const hasSelfie = !!data.selfieDataUrl;
    const gpsOk = data.gpsActivo;
    const hasGpsCasa = gpsCasaCoords != null;
    const hasGpsLaburo = gpsLaburoCoords != null;
    return hasOficio && hasSelfie && gpsOk && hasGpsCasa && hasGpsLaburo;
  };

  const validateStep3 = () => {
    if (masterKey) return true;
    // Paso 3 opcional para pruebas: podés guardar sin completar respaldo (en backend se guarda "Prueba").
    return isOperatorFlow ? data.cedulaOperador.trim() !== "" : true;
  };

  const canNext1 = validateStep1();
  const canNext2 = validateStep2();
  const canNext3 = validateStep3();

  const handleSelfieClick = () => {
    if (masterKey) {
      fileInputRef.current?.click();
      return;
    }
    if (!data.gpsActivo) {
      setGpsChecked(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const MAX_SELFIE_BASE64_LENGTH = 300000;

  const compressImageToDataUrl = (file: File, maxWidth: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const scale = w > maxWidth ? maxWidth / w : 1;
        const cw = Math.round(w * scale);
        const ch = Math.round(h * scale);
        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("");
          return;
        }
        ctx.drawImage(img, 0, 0, cw, ch);
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } catch {
          resolve("");
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo cargar la imagen"));
      };
      img.src = url;
    });
  };

  const compressDataUrlAgain = (dataUrl: string, maxWidth: number, quality: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const scale = w > maxWidth ? maxWidth / w : 1;
        const cw = Math.round(w * scale);
        const ch = Math.round(h * scale);
        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, cw, ch);
        try {
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    e.target.value = "";
    try {
      let dataUrl = await compressImageToDataUrl(file, 600, 0.58);
      if (!dataUrl) dataUrl = await compressImageToDataUrl(file, 400, 0.5);
      if (dataUrl) {
        if (dataUrl.length > MAX_SELFIE_BASE64_LENGTH) {
          dataUrl = await compressDataUrlAgain(dataUrl, 400, 0.48);
        }
        update("selfieDataUrl", dataUrl);
      } else {
        error("No se pudo procesar la foto. Sacá otra selfie.");
      }
    } catch {
      error("No se pudo procesar la foto. Sacá otra selfie.");
    }
  };

  const activateGps = () => {
    if (masterKey) {
      update("gpsActivo", true);
      setGpsCoords(FAKE_GPS);
      setGpsChecked(false);
      return;
    }
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          update("gpsActivo", true);
          setGpsCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setGpsChecked(false);
        },
        () => setGpsChecked(true)
      );
    } else {
      update("gpsActivo", true);
      setGpsChecked(false);
    }
  };

  const captureGpsCasa = () => {
    if (masterKey) {
      setGpsCasaCoords(FAKE_GPS);
      return;
    }
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsCasaCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => error("No se pudo obtener la ubicación de tu casa.")
      );
    }
  };

  const captureGpsLaburo = () => {
    if (masterKey) {
      setGpsLaburoCoords(FAKE_GPS);
      return;
    }
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLaburoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => error("No se pudo obtener la ubicación de tu trabajo.")
      );
    }
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setCodigoVerificacion(null);
    setSubmitError(null);
    try {
      let selfieToSend = data.selfieDataUrl;
      if (selfieToSend && selfieToSend.length > MAX_SELFIE_BASE64_LENGTH) {
        selfieToSend = await compressDataUrlAgain(selfieToSend, 400, 0.45);
      }
      if (selfieToSend && selfieToSend.length > 450000) {
        selfieToSend = null;
        success("La foto era muy pesada; se envía la inscripción sin foto. Podés actualizarla después.");
      }
      const body = {
        nombreCompleto: data.nombreCompleto,
        cedula: data.cedula,
        whatsapp: data.whatsapp,
        email: data.email,
        facebook: data.facebook,
        instagram: data.instagram,
        oficioPrincipal: data.oficioPrincipal,
        oficioSecundario: data.oficioSecundario,
        anosExperiencia: data.anosExperiencia,
        nivelEstudios: data.nivelEstudios,
        situacion: data.situacion,
        seguroSocial: data.seguroSocial,
        selfieDataUrl: selfieToSend,
        promotor: data.promotor,
        gestorZona: data.gestorZona,
        cargoGestor: data.cargoGestor,
        seccionalNro: data.seccionalNro,
        cedulaOperador: data.cedulaOperador,
        gpsCoords: gpsCoords ? { lat: gpsCoords.lat, lng: gpsCoords.lng } : null,
        gpsCasa: gpsCasaCoords ? { lat: gpsCasaCoords.lat, lng: gpsCasaCoords.lng } : null,
        gpsLaburo: gpsLaburoCoords ? { lat: gpsLaburoCoords.lat, lng: gpsLaburoCoords.lng } : null,
      };
      const res = await fetch("/api/subscriptores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const contentType = res.headers.get("content-type") || "";
      let json: { error?: string; codigoVerificacion?: string } = {};
      if (contentType.includes("application/json")) {
        json = await res.json();
      } else {
        const text = await res.text();
        try {
          json = JSON.parse(text) as { error?: string };
        } catch {
          setSubmitError(res.ok ? "No se pudo leer la respuesta." : `Error del servidor (${res.status}). Reintentá más tarde.`);
          error(res.ok ? "No se pudo leer la respuesta." : `Error del servidor (${res.status}). Reintentá más tarde.`);
          setSubmitLoading(false);
          return;
        }
      }
      if (!res.ok) {
        const errMsg =
          res.status === 413
            ? "La foto pesa demasiado. Sacá otra selfie más simple (solo vos y la herramienta, fondo claro) y reintentá."
            : (json?.error ?? "No se pudo guardar la inscripción.");
        setSubmitError(errMsg);
        error(errMsg);
        setSubmitLoading(false);
        return;
      }
      setSubmitLoading(false);
      setSubmitSuccess(true);
      setSubmitError(null);
      setCodigoVerificacion(json.codigoVerificacion ?? null);
      success("Inscripción guardada. Guardá tu código de verificación.");
      setTimeout(() => onClose(), 4000);
    } catch (e) {
      const isNetworkError =
        e instanceof TypeError && (e.message === "Failed to fetch" || e.message.includes("NetworkError"));
      const errMsg = isNetworkError
        ? "Error de conexión. Revisá tu internet y reintentá."
        : (e instanceof Error ? e.message : "No se pudo guardar. Reintentá más tarde.");
      setSubmitError(errMsg);
      error(errMsg);
      setSubmitLoading(false);
    }
  };

  const step3Missing: string[] = [];
  if (isOperatorFlow && data.cedulaOperador.trim() === "") step3Missing.push("Cédula del Operador YAPÓ");
  const step3Opcional = !isOperatorFlow && (!data.gestorZona || !data.cargoGestor || !data.seccionalNro.trim());

  return (
    <div className="fixed inset-0 z-50 bg-yapo-gray overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={onClose}
            className="btn-yapo min-h-[52px] px-4 border-2 border-yapo-gray-dark bg-white text-gray-700 hover:bg-yapo-gray flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver atrás
          </button>
          <h2 className="text-xl font-bold text-yapo-blue shrink-0">Registro PTIL</h2>
          <span className="w-[120px]" aria-hidden />
        </div>

        {/* Stepper */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={clsx(
                "flex-1 h-2 rounded-full",
                step >= s ? "bg-yapo-orange" : "bg-yapo-gray-dark"
              )}
            />
          ))}
        </div>

        {isOperatorFlow && (
          <div className="mb-6">
            <GuiaOperador />
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-yapo-blue flex items-center gap-2">
                <Hammer className="w-5 h-5" />
                Identidad y Contacto
              </h3>
              <div>
                <label className="label-yapo">Nombre Completo</label>
                <input
                  type="text"
                  value={data.nombreCompleto}
                  onChange={(e) => update("nombreCompleto", e.target.value)}
                  className="input-yapo"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div>
                <label className="label-yapo">Nro. de Cédula</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={data.cedula}
                    onChange={(e) => update("cedula", e.target.value)}
                    className="input-yapo flex-1"
                    placeholder="Número de cédula"
                  />
                  <button
                    type="button"
                    className="btn-yapo btn-yapo-outline shrink-0 min-h-[52px] px-4"
                    onClick={() => success("Función de escáner OCR próximamente")}
                  >
                    <ScanLine className="w-5 h-5" />
                    Escanear Cédula OCR
                  </button>
                </div>
              </div>
              <div>
                <label className="label-yapo">WhatsApp</label>
                <input
                  type="tel"
                  value={data.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  className="input-yapo"
                  placeholder="+595 981 123 456"
                />
                {data.whatsapp && !/^[0-9+\s-]+$/.test(data.whatsapp) && (
                  <p className="text-sm text-red-600 mt-1">
                    Solo números y + - espacios
                  </p>
                )}
              </div>
              <div>
                <label className="label-yapo">Correo electrónico <span className="text-gray-600 font-normal">(opcional)</span></label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="input-yapo"
                  placeholder="tu@correo.com"
                />
              </div>
              <div>
                <label className="label-yapo">Facebook (usuario o enlace) <span className="text-gray-600 font-normal">(opcional)</span></label>
                <input
                  type="text"
                  value={data.facebook}
                  onChange={(e) => update("facebook", e.target.value)}
                  className="input-yapo"
                  placeholder="Ej. facebook.com/tu-perfil o tu usuario"
                />
              </div>
              <div>
                <label className="label-yapo">Instagram (usuario o enlace) <span className="text-gray-600 font-normal">(opcional)</span></label>
                <input
                  type="text"
                  value={data.instagram}
                  onChange={(e) => update("instagram", e.target.value)}
                  className="input-yapo"
                  placeholder="Ej. @tu_usuario o instagram.com/tu_usuario"
                />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canNext1}
                  className="btn-yapo btn-yapo-primary disabled:opacity-50"
                >
                  Siguiente <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-yapo-blue flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Perfil Laboral e IA
              </h3>
              <div className="rounded-xl border-2 border-yapo-blue/20 bg-yapo-gray/50 p-4 flex gap-3">
                <Info className="w-5 h-5 text-yapo-blue shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-yapo-blue mb-1">¿Cómo se valida tu suscripción?</p>
                  <p>Si aún no tenés certificación (SNPP, SINAFOCAL u otro título), se te asignará un <strong>Operador YAPÓ</strong> para validar tu oficio.</p>
                  <p className="mt-1">Si ya tenés certificación y cumplís los parámetros, tu suscripción se valida <strong>automáticamente</strong> y pasás directo a la base, sin necesidad de un operador.</p>
                </div>
              </div>
              <div>
                <label className="label-yapo">Oficio Principal</label>
                <input
                  type="text"
                  value={data.oficioPrincipal}
                  onChange={(e) => update("oficioPrincipal", e.target.value)}
                  className="input-yapo"
                  placeholder="Ej. Electricista, Albañil"
                />
              </div>
              <div>
                <label className="label-yapo">Oficio Secundario</label>
                <input
                  type="text"
                  value={data.oficioSecundario}
                  onChange={(e) => update("oficioSecundario", e.target.value)}
                  className="input-yapo"
                  placeholder="Opcional"
                />
              </div>
              <div className="rounded-xl border-2 border-yapo-blue/20 bg-white p-4">
                <p className="text-sm font-medium text-yapo-blue mb-2">
                  Tipificación con IA
                </p>
                <button
                  type="button"
                  disabled={!data.oficioPrincipal.trim() || tipificacionLoading}
                  onClick={async () => {
                    setTipificacionLoading(true);
                    setTipificacionIA(null);
                    try {
                      const res = await tipificarOficioIAClient(
                        data.oficioPrincipal,
                        data.selfieDataUrl
                      );
                      setTipificacionIA(res);
                    } catch (e) {
                      error("No se pudo tipificar. Reintentá más tarde.");
                    } finally {
                      setTipificacionLoading(false);
                    }
                  }}
                  className="btn-yapo btn-yapo-outline w-full min-h-[52px] disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  {tipificacionLoading ? "Analizando…" : "Tipificar oficio con IA"}
                </button>
                {tipificacionIA && (
                  <div className="mt-3 p-3 rounded-lg bg-yapo-gray text-sm space-y-1">
                    <p><strong>Categoría:</strong> {tipificacionIA.categoria}</p>
                    <p><strong>Especialidad:</strong> {tipificacionIA.especialidad}</p>
                    <p>
                      <strong>Sugerencia grupo:</strong>{" "}
                      <span
                        className={clsx(
                          "font-semibold",
                          tipificacionIA.sugerencia_grupo === "A" && "text-green-600",
                          tipificacionIA.sugerencia_grupo === "B" && "text-amber-700",
                          tipificacionIA.sugerencia_grupo === "C" && "text-red-600"
                        )}
                      >
                        Grupo {tipificacionIA.sugerencia_grupo}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="label-yapo">Años de Experiencia</label>
                <input
                  type="number"
                  min={0}
                  value={data.anosExperiencia}
                  onChange={(e) => update("anosExperiencia", e.target.value)}
                  className="input-yapo"
                  placeholder="Ej. 5"
                />
              </div>
              <div>
                <label className="label-yapo">Nivel de Estudios</label>
                <select
                  value={data.nivelEstudios}
                  onChange={(e) => update("nivelEstudios", e.target.value)}
                  className="input-yapo"
                >
                  <option value="">Seleccionar</option>
                  {NIVEL_ESTUDIOS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-yapo">Situación</label>
                <select
                  value={data.situacion}
                  onChange={(e) => update("situacion", e.target.value)}
                  className="input-yapo"
                >
                  <option value="">Seleccionar</option>
                  {SITUACION.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between p-4 bg-yapo-gray rounded-xl">
                <span className="label-yapo mb-0">
                  ¿Posee Seguro Social/Previsión?
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={data.seguroSocial}
                  onClick={() => update("seguroSocial", !data.seguroSocial)}
                  className={clsx(
                    "w-14 h-8 rounded-full transition-colors",
                    data.seguroSocial ? "bg-yapo-orange" : "bg-yapo-gray-dark"
                  )}
                >
                  <span
                    className={clsx(
                      "block w-6 h-6 rounded-full bg-white shadow mt-1 transition-transform",
                      data.seguroSocial ? "translate-x-8" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* GPS Casa y Trabajo */}
              <div className="rounded-xl border-2 border-yapo-blue/30 bg-white p-4 space-y-4">
                <p className="font-medium text-yapo-blue">Ubicación de casa y trabajo</p>
                <p className="text-xs text-gray-600">Necesitamos la ubicación de tu casa y de tu lugar de trabajo para la validación.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label-yapo flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Ubicación de tu casa
                    </label>
                    {!gpsCasaCoords ? (
                      <button
                        type="button"
                        onClick={captureGpsCasa}
                        className="btn-yapo btn-yapo-outline w-full min-h-[48px]"
                      >
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Capturar ubicación casa
                      </button>
                    ) : (
                      <p className="text-sm text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Casa: {gpsCasaCoords.lat.toFixed(5)}, {gpsCasaCoords.lng.toFixed(5)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label-yapo flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Ubicación de tu trabajo
                    </label>
                    {!gpsLaburoCoords ? (
                      <button
                        type="button"
                        onClick={captureGpsLaburo}
                        className="btn-yapo btn-yapo-outline w-full min-h-[48px]"
                      >
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Capturar ubicación trabajo
                      </button>
                    ) : (
                      <p className="text-sm text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Trabajo: {gpsLaburoCoords.lat.toFixed(5)}, {gpsLaburoCoords.lng.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Matriz de preclasificación A/B/C */}
              {(data.nivelEstudios || data.anosExperiencia) && (() => {
                const pre = getGrupoPreclasificacion(
                  data.nivelEstudios,
                  parseInt(data.anosExperiencia, 10) || 0
                );
                return (
                  <div className="p-4 rounded-xl border-2 border-yapo-gray-dark bg-white">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preclasificación automática
                    </p>
                    <span
                      className={clsx(
                        "inline-block px-3 py-1.5 rounded-lg text-sm font-semibold",
                        pre.color
                      )}
                    >
                      Grupo {pre.grupo} – {pre.label}
                    </span>
                    <p className="text-xs text-gray-600 mt-2">{pre.estado}</p>
                  </div>
                );
              })()}

              {/* Selfie de Trabajo (Validación Digital) – YAPÓ Selfie */}
              <div className="border-2 border-yapo-blue/30 rounded-2xl p-4 bg-white">
                <p className="font-medium text-yapo-blue mb-1">
                  Selfie de Trabajo (La Prueba Real) – YAPÓ Selfie
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  Sacá la foto acá mismo: vos con tu herramienta y de fondo el trabajo (obra, cableado, etc.). No se permite adjuntar archivo ni fotos de galería; la foto debe ser sacada dentro de la app para sello de realidad.
                </p>
                {!data.gpsActivo && (
                  <div className="mb-3 p-3 bg-amber-100 text-amber-800 rounded-xl text-sm">
                    <strong>GPS activo obligatorio.</strong> La landing no permite enviar la foto sin GPS. El sistema captura latitud, longitud y hora en los metadatos de la imagen.
                  </div>
                )}
                {gpsChecked && !data.gpsActivo && (
                  <p className="text-red-600 text-sm mb-2">
                    Debes activar el GPS para sacar la selfie. No podés enviar el registro sin ubicación.
                  </p>
                )}
                {!data.gpsActivo ? (
                  <button
                    type="button"
                    onClick={activateGps}
                    className="btn-yapo btn-yapo-secondary w-full mb-2"
                  >
                    Activar GPS
                  </button>
                ) : (
                  <p className="text-green-700 text-sm mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> GPS activo (lat, long y hora se guardan)
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleSelfieClick}
                  disabled={!data.gpsActivo}
                  className="btn-yapo min-h-[60px] w-full border-2 border-dashed border-yapo-orange text-yapo-orange hover:bg-yapo-orange hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-6 h-6" />
                  Sacar Selfie de Trabajo (con herramienta y obra de fondo)
                </button>
                {data.selfieDataUrl && (
                  <div className="mt-3 relative rounded-xl overflow-hidden max-h-40">
                    <img
                      src={data.selfieDataUrl}
                      alt="Selfie laboral"
                      className="w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => update("selfieDataUrl", null)}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-lg px-2 py-1 text-sm"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-yapo btn-yapo-outline"
                >
                  <ChevronLeft className="w-5 h-5" /> Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!canNext2}
                  className="btn-yapo btn-yapo-primary disabled:opacity-50"
                >
                  Siguiente <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-yapo-blue">
                Respaldo de Confianza (El Corazón Político)
              </h3>
              {(data.nivelEstudios || data.anosExperiencia) && (() => {
                const pre = getGrupoPreclasificacion(
                  data.nivelEstudios,
                  parseInt(data.anosExperiencia, 10) || 0
                );
                return (
                  <div className="p-3 rounded-xl bg-yapo-gray border border-yapo-gray-dark">
                    <span className={clsx("inline-block px-3 py-1 rounded-lg text-sm font-semibold", pre.color)}>
                      Grupo {pre.grupo} – {pre.label}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">{pre.estado}</p>
                  </div>
                );
              })()}
              <div>
                <label className="label-yapo">Promotor YAPÓ</label>
                <input
                  type="text"
                  value={data.promotor}
                  readOnly
                  className="input-yapo bg-yapo-gray"
                />
              </div>
              <div>
                <label className="label-yapo">Gestor de tu Zona</label>
                <select
                  value={data.gestorZona}
                  onChange={(e) => update("gestorZona", e.target.value)}
                  className="input-yapo"
                >
                  <option value="">Seleccionar dirigente</option>
                  {GESTORES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="label-yapo">Cargo del Gestor</span>
                <div className="flex gap-4 mt-2">
                  {CARGOS.map((c) => (
                    <label
                      key={c}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="cargoGestor"
                        value={c}
                        checked={data.cargoGestor === c}
                        onChange={(e) => update("cargoGestor", e.target.value)}
                        className="w-5 h-5"
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-yapo">Seccional Nro.</label>
                <input
                  type="text"
                  value={data.seccionalNro}
                  onChange={(e) => update("seccionalNro", e.target.value)}
                  className="input-yapo"
                  placeholder="Ej. 12"
                />
              </div>
              {isOperatorFlow && (
                <div>
                  <label className="label-yapo">
                    Cédula del Operador YAPÓ *
                  </label>
                  <input
                    type="text"
                    value={data.cedulaOperador}
                    onChange={(e) => update("cedulaOperador", e.target.value)}
                    className="input-yapo"
                    placeholder="Obligatorio para carga directa / validación in situ"
                  />
                </div>
              )}
              <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200 text-sm flex items-start gap-2">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-yapo-blue" aria-hidden />
                <p className="text-[#1e3a8a] font-medium">
                  Si tenés certificación (SNPP, SINAFOCAL, etc.) y cumplís los requisitos, tu ficha puede validarse automáticamente. Si no, un Operador YAPÓ de tu zona te va a contactar para coordinar la verificación.
                </p>
              </div>
              {submitError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-800 text-sm" role="alert">
                  {submitError}
                </div>
              )}
              {submitSuccess && codigoVerificacion && (
                <div className="mb-6 p-6 rounded-2xl bg-green-50 border-2 border-green-300 text-center">
                  <div className="flex justify-center mb-3">
                    <span className="flex items-center justify-center w-16 h-16 rounded-full bg-green-600 text-white" aria-hidden>
                      <CheckCircle2 className="w-10 h-10" strokeWidth={2.5} />
                    </span>
                  </div>
                  <p className="text-xl font-bold text-green-900 mb-1">¡Listo! Tu inscripción fue enviada</p>
                  <p className="text-sm text-green-800 mb-2 font-medium">Guardá este código; lo vas a necesitar para consultar el estado de tu ficha.</p>
                  <p className="text-2xl font-bold text-green-900 tracking-wider select-all mb-4" aria-label={`Código de verificación: ${codigoVerificacion}`}>{codigoVerificacion}</p>
                  <Link
                    href={`/verificar?codigo=${encodeURIComponent(codigoVerificacion)}`}
                    className="btn-yapo btn-yapo-primary inline-flex min-h-[48px]"
                  >
                    <Search className="w-5 h-5" aria-hidden />
                    Consultar estado ahora
                  </Link>
                </div>
              )}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-yapo btn-yapo-outline"
                >
                  <ChevronLeft className="w-5 h-5" /> Atrás
                </button>
                {!submitSuccess && (
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canNext3 || submitLoading}
                      className="btn-yapo btn-yapo-primary disabled:opacity-50 flex items-center gap-2 min-h-[48px]"
                      title={!canNext3 && step3Missing.length > 0 ? `Completá: ${step3Missing.join(", ")}` : undefined}
                    >
                      {submitLoading ? (
                        <>
                          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando…
                        </>
                      ) : (
                        "Enviar registro"
                      )}
                    </button>
                    {!canNext3 && step3Missing.length > 0 && (
                      <span className="text-xs text-amber-700">
                        Para enviar completá: {step3Missing.join(", ")}
                      </span>
                    )}
                    {canNext3 && step3Opcional && (
                      <span className="text-xs text-gray-600">
                        Respaldo opcional: podés enviar así para probar (se guarda como prueba y podés consultar tu estado con el código).
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
