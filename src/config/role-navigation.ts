import {
  adminNavigation,
  facultyNavigation,
  studentNavigation,
  type NavigationItem,
} from "./navigation";

export type UserRole =
  | "student"
  | "faculty"
  | "admin";

export function getRoleNavigation(
  role: UserRole,
): NavigationItem[] {
  if (role === "faculty") {
    return facultyNavigation;
  }

  if (role === "admin") {
    return adminNavigation;
  }

  return studentNavigation;
}