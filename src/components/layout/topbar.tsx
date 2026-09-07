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

        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}