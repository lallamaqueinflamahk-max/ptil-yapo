"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

  useEffect(() => {
    fetch("/api/dashboard/me")
      .then((r) => r.json())
      .then((data: MeResponse) => setUser(data))
      .catch(() => setUser({ name: "Staff", image: null }));
  }, []);

  const name = user?.name ?? "Staff";
  const image = user?.image;

  return (
    <div
      className="flex items-center gap-2 shrink-0 ml-2 pl-2 border-l border-gray-200"
      title={name}
      role="img"
      aria-label={`Perfil de ${name}`}
    >
      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#1E3A8A]/10 ring-2 ring-[#1E3A8A]/30 flex items-center justify-center">
        {image ? (
          <Image
            src={image}
            alt=""
            width={36}
            height={36}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-sm font-bold text-[#1E3A8A]">
            {initials(name)}
          </span>
        )}
      </div>
      <span className="hidden md:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">
        {name}
      </span>
    </div>
  );
}
