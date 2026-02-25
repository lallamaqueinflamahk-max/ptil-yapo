"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

const STAFF_AVATAR_KEY = "ptil_staff_avatar";

interface MeResponse {
  name?: string | null;
  image?: string | null;
}

function initials(name: string | null | undefined): string {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function DashboardAvatar() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/dashboard/me")
      .then((r) => r.json())
      .then((data: MeResponse) => setUser(data))
      .catch(() => setUser({ name: "Staff", image: null }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STAFF_AVATAR_KEY);
    if (stored) setAvatar(stored);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem(STAFF_AVATAR_KEY, dataUrl);
        setAvatar(dataUrl);
      } catch (_) {}
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const name = user?.name ?? "Staff";
  const image = avatar ?? user?.image;

  return (
    <div
      className="flex items-center gap-2 shrink-0 ml-2 pl-2 border-l border-gray-200"
      title={name}
      role="img"
      aria-label={`Perfil de ${name}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-9 h-9 rounded-full overflow-hidden bg-[#1E3A8A]/10 ring-2 ring-[#1E3A8A]/30 flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E3A8A]"
        title="Cambiar foto de perfil"
      >
        {image ? (
          <Image
            src={image}
            alt=""
            width={36}
            height={36}
            className="object-cover w-full h-full"
            unoptimized={image.startsWith("data:")}
          />
        ) : (
          <span className="text-sm font-bold text-[#1E3A8A]">
            {initials(name)}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <Camera className="w-4 h-4 text-white" aria-hidden />
        </span>
      </button>
      <span className="hidden md:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">
        {name}
      </span>
    </div>
  );
}
