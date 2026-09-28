import {
  getRoleNavigation,
  type UserRole,
} from "@/config/role-navigation";

import { NavLinks } from "@/components/navigation/nav-links";

type SidebarProps = {
  role: UserRole;
};

export function Sidebar({
  role,
}: SidebarProps) {
  const navigation = getRoleNavigation(role);

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
              CM
            </div>

            <div>
              <p className="font-bold text-slate-950">
                CampusMate
              </p>

              <p className="text-xs font-medium text-slate-500">
                {role === "faculty"
                  ? "Faculty Portal"
                  : role === "admin"
                    ? "Admin Portal"
                    : "Student Portal"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <NavLinks items={navigation} />
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">
              Current workspace
            </p>

            <p className="mt-1 text-sm font-bold text-slate-950">
              {role === "faculty"
                ? "Faculty Portal"
                : role === "admin"
                  ? "Admin Portal"
                  : "Student Portal"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}