import type { ReactNode } from "react";

import { requireFaculty } from "@/lib/auth/require-faculty";

export default async function FacultyLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireFaculty();

  return <>{children}</>;
}