import "next-auth";
import { UserRole } from "../models/user-models";

declare module "next-auth" {
  interface User {
    id: string;
    fname: string;
    lname: string;
    role: UserRole;
    token: string;
  }
}
