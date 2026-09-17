import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="font-semibold text-slate-900 lg:hidden"
        >
          CampusMate
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/search"
            className="hidden items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition hover:border-brand-300 hover:text-brand-700 sm:flex"
          >
            <span aria-hidden="true">🔎</span>

            <span>Search</span>

            <kbd className="rounded-md bg-muted px-1.5 py-0.5 text-[10px]">
              Ctrl K
            </kbd>
          </Link>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}