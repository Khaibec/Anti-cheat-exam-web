export type UserRole = "student" | "admin";

export const getDashboardPath = (role?: UserRole) =>
  role === "admin" ? "/admin/dashboard" : "/dashboard";

export const isAdmin = (role?: UserRole) => role === "admin";

export const isStudent = (role?: UserRole) => role === "student";
