export type UserRole = "student" | "admin";

export interface User {
  id: string;
  fname: string;
  lname: string;
  role: UserRole;
  token: string;
}
