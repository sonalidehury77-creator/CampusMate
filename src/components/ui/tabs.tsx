"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
};

export function Tabs({
  tabs,
  defaultTab,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(
    defaultTab ?? tabs[0]?.id,
  );

  const activeContent = tabs.find(
    (tab) => tab.id === activeTab,
  )?.content;

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap",
                active
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-500 hover:text-slate-900",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-6">
        {activeContent}
      </div>
    </div>
  );
}