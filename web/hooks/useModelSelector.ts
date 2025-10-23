"use client";

import { useEffect, useState } from "react";

export type SupportedModel = "qwen";

const STORAGE_KEY = "neuralgig:model";
const DEFAULT_MODEL: SupportedModel = "qwen";

export function useModelSelector() {
  const [model, setModel] = useState<SupportedModel>(DEFAULT_MODEL);
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedModel | null;
    if (saved === "qwen") {
      setModel(saved);
    } else if (saved) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  const updateModel = (next: SupportedModel) => {
    setModel(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
  };

  return {
    model,
    setModel: updateModel,
    isHydrated,
  };
}
