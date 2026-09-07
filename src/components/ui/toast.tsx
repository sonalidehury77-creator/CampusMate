"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils/cn";

type ToastType =
  | "success"
  | "error"
  | "info"
  | "warning";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  toast: (
    message: string,
    type?: ToastType,
  ) => void;
};

const ToastContext =
  createContext<ToastContextValue | null>(null);

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<
    ToastItem[]
  >([]);

  const toast = useCallback(
    (
      message: string,
      type: ToastType = "info",
    ) => {
      const id = Date.now();

      setItems((current) => [
        ...current,
        {
          id,
          message,
          type,
        },
      ]);

      setTimeout(() => {
        setItems((current) =>
          current.filter(
            (item) => item.id !== id,
          ),
        );
      }, 3500);
    },
    [],
  );

  const value = useMemo(
    () => ({ toast }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-xl border bg-white p-4 shadow-lg",
              item.type === "success" &&
                "border-green-200",
              item.type === "error" &&
                "border-red-200",
              item.type === "warning" &&
                "border-amber-200",
              item.type === "info" &&
                "border-blue-200",
            )}
          >
            <p className="text-sm font-medium text-slate-800">
              {item.message}
            </p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider",
    );
  }

  return context;
}