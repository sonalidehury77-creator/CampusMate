import Link from "next/link";

import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/navigation/nav-links";

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <Link href="/dashboard">
            <Logo showTagline />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Campus
          </p>

          <NavLinks />
        </div>

        <div className="border-t border-slate-200 p-4">
          <p className="px-3 text-xs text-slate-400">
            CampusMate
          </p>

          <p className="mt-1 px-3 text-xs text-slate-500">
            Smart student companion
          </p>
        </div>
      </div>
    </aside>
  );
}