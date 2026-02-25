"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, ChevronUp, Sparkles, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = { role: "user" | "assistant"; content: string };

function renderMessageText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface AsistenteMaestroBarProps {
  /** Si true, el trigger va en el navbar (fijo arriba) y el panel abre debajo del header. */
  inNavbar?: boolean;
}

export default function AsistenteMaestroBar({ inNavbar = false }: AsistenteMaestroBarProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (open && messages.length > 0) listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = useCallback(async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          provider: "openai",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");
      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "No pude procesar tu mensaje. Revisá la conexión e intentá de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const toggleVoice = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setInput((prev) => prev + (prev ? " " : "") + "[El navegador no soporta reconocimiento de voz]");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SpeechRecognition() as SpeechRecognitionInstance;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "es-PY";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const results = e.results;
      let transcript = "";
      for (let i = e.resultIndex; i < results.length; i++) {
        transcript += results[i][0].transcript;
      }
      if (transcript) setInput((prev) => (prev ? prev + " " + transcript : transcript).trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening]);

  const triggerNavbar = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all border-0"
      style={{
        background: "linear-gradient(135deg, rgba(30,58,138,0.95) 0%, rgba(13,148,136,0.95) 100%)",
      }}
      aria-label="Abrir Asistente"
      title="Preguntame lo que necesitás"
    >
      <Sparkles className="w-4 h-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Asistente</span>
    </button>
  );

  const triggerFloating = (
    <motion.button
      key="bar"
      type="button"
      onClick={() => setOpen(true)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="w-full flex items-center gap-3 rounded-2xl text-white shadow-lg shadow-[#1E3A8A]/25 hover:shadow-xl hover:shadow-[#0D9488]/20 transition-shadow duration-300 py-3.5 px-4 text-left border-0 backdrop-blur-md"
      style={{
        background: "linear-gradient(120deg, rgba(15,23,42,0.82) 0%, rgba(30,58,138,0.85) 50%, rgba(13,148,136,0.82) 100%)",
      }}
      aria-label="Abrir Asistente Maestro"
    >
      <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/25 backdrop-blur-sm text-white shrink-0">
        <Sparkles className="w-5 h-5" aria-hidden />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm tracking-tight">Asistente Maestro</p>
        <p className="text-xs text-white/85 truncate">Preguntame lo que necesitás</p>
      </div>
      <ChevronUp className="w-5 h-5 text-white/80 shrink-0" aria-hidden />
    </motion.button>
  );

  const panelContent = (
    <motion.div
      key="panel"
      initial={{ opacity: 0, y: inNavbar ? -10 : 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: inNavbar ? -10 : 10, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`overflow-hidden flex flex-col shadow-2xl ring-2 ring-[#0D9488]/30 backdrop-blur-xl ${inNavbar ? "rounded-b-2xl max-h-[min(calc(100vh - 3.5rem), 480px)]" : "rounded-2xl max-h-[min(75vh,480px)]"}`}
      style={{
        background: "linear-gradient(180deg, rgba(240,253,250,0.88) 0%, rgba(236,254,255,0.9) 12%, rgba(248,250,252,0.88) 30%, rgba(255,255,255,0.85) 100%)",
      }}
    >
      {/* Cabecera con colores atractivos */}
                <div
                  className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-3.5 border-b border-[#0D9488]/25 backdrop-blur-md"
                  style={{
                    background: "linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(30,58,138,0.9) 45%, rgba(13,148,136,0.88) 100%)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm text-white">
                      <MessageCircle className="w-5 h-5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-bold text-white text-base tracking-tight">Asistente Maestro</p>
                      <p className="text-[11px] text-white/90 font-medium">Hola, soy tu ASISTENTE MAESTRO. Preguntame lo que necesitás.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-xl text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mensajes */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/40 to-white/70">
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-sm">
                      <p className="font-semibold text-slate-700">Escribí o hablá tu pregunta.</p>
                      <p className="mt-2 text-slate-500">Ej: &quot;¿Cuál es la lealtad global?&quot;, &quot;Dame un resumen del día&quot;, &quot;¿Cuántas certificaciones hay?&quot;</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "text-white shadow-md backdrop-blur-sm"
                            : "bg-white/75 text-slate-800 border border-slate-200/70 shadow-sm backdrop-blur-sm"
                        }`}
                        style={
                          msg.role === "user"
                            ? { background: "linear-gradient(135deg, rgba(30,58,138,0.92) 0%, rgba(13,148,136,0.92) 100%)" }
                            : undefined
                        }
                      >
                        <div className="whitespace-pre-wrap break-words">
                          {msg.role === "assistant" ? renderMessageText(msg.content) : msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl px-4 py-3 bg-slate-100/80 backdrop-blur-sm text-slate-600 text-sm font-medium">
                        Escribiendo…
                      </div>
                    </div>
                  )}
                  <div ref={listEndRef} />
                </div>

                {/* Input con micrófono */}
                <div
                  className="flex-shrink-0 p-3 border-t border-slate-200/80 backdrop-blur-md"
                  style={{ background: "linear-gradient(180deg, rgba(240,253,250,0.88) 0%, rgba(236,254,255,0.9) 100%)" }}
                >
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={toggleVoice}
                      title={listening ? "Detener voz" : "Enviar comando de voz"}
                      className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-all ${
                        listening
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse"
                          : "bg-slate-200/80 text-slate-600 hover:bg-teal-100 hover:text-teal-700"
                      }`}
                      aria-label={listening ? "Detener grabación" : "Usar micrófono"}
                    >
                      {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Escribí o hablá tu pregunta..."
                      rows={1}
                      className="flex-1 min-h-[44px] max-h-24 rounded-xl border-2 border-slate-200/90 px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white/90 backdrop-blur-sm placeholder:text-slate-400"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => sendMessage()}
                      disabled={loading || !input.trim()}
                      className="flex items-center justify-center w-11 h-11 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm"
                      style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.92) 0%, rgba(30,58,138,0.92) 100%)" }}
                      aria-label="Enviar"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
    </motion.div>
  );

  if (inNavbar) {
    return (
      <>
        {triggerNavbar}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/30"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div className="fixed left-0 right-0 top-14 z-50 flex justify-center px-2 pt-2">
                <div className="w-full max-w-lg">{panelContent}</div>
              </div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none px-2 pb-2">
      <div className="pointer-events-auto w-full max-w-lg">
        <AnimatePresence mode="wait">
          {!open ? (
            triggerFloating
          ) : (
            panelContent
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
