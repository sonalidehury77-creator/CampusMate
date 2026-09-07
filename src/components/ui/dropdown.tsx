"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

type DropdownItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

type DropdownProps = {
  trigger: React.ReactNode;
  items: DropdownItem[];
};

export function Dropdown({
  trigger,
  items,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 min-w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm",
                "hover:bg-slate-100",
                item.danger
                  ? "text-danger-700"
                  : "text-slate-700",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}