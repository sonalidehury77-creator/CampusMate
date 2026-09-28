import type { ReactNode } from "react";

import {
  adminNavigation,
  facultyNavigation,
  studentNavigation,
  type NavigationItem,
} from "@/config/navigation";

import { Topbar } from "./topbar";

type UserRole =
  | "student"
  | "faculty"
  | "admin";

type AppShellProps = {
  children: ReactNode;
  role: UserRole;
};

function RoleSidebar({
  role,
}: {
  role: UserRole;
}) {
  let navigation: NavigationItem[];

  if (role === "faculty") {
    navigation = facultyNavigation;
  } else if (role === "admin") {
    navigation = adminNavigation;
  } else {
    navigation = studentNavigation;
  }

  const groupedNavigation = navigation.reduce<
    Record<string, NavigationItem[]>
  >((groups, item) => {
    if (!groups[item.section]) {
      groups[item.section] = [];
    }

    groups[item.section].push(item);

    return groups;
  }, {});

  const portalLabel =
    role === "faculty"
      ? "Faculty Portal"
      : role === "admin"
        ? "Admin Portal"
        : "Student Portal";

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <a
            href={
              role === "faculty"
                ? "/faculty"
                : role === "admin"
                  ? "/admin"
                  : "/dashboard"
            }
            className="block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                CM
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  CampusMate
                </p>

                <p className="text-xs font-medium text-slate-500">
                  {portalLabel}
                </p>
              </div>
            </div>
          </a>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-6">
            {Object.entries(groupedNavigation).map(
              ([section, items]) => (
                <div key={section}>
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {section}
                  </p>

                  <div className="space-y-1">
                    {items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">
              Current workspace
            </p>

            <p className="mt-1 text-sm font-bold text-slate-950">
              {portalLabel}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AppShell({
  children,
  role,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <RoleSidebar role={role} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}