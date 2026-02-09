"use client";

import { useState, useEffect } from "react";
import { getMasterKey } from "@/lib/utils/masterKey";

export function useMasterKey(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(getMasterKey());
    const handler = () => setOn(getMasterKey());
    window.addEventListener("ptil-master-change", handler);
    return () => window.removeEventListener("ptil-master-change", handler);
  }, []);
  return on;
}
