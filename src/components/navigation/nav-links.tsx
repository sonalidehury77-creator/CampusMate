import Link from "next/link";

import type { NavigationItem } from "@/config/navigation";

type NavLinksProps = {
  items: NavigationItem[];
};

export function NavLinks({
  items,
}: NavLinksProps) {
  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}