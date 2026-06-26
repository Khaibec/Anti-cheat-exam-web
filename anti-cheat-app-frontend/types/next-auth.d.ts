import NextAuth, { DefaultSession, User as DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import { UserRole } from "../models/user-models";

declare global {}

declare module "next-auth" {
  interface User {
    id: string;
    fname: string;
    lname: string;
    role: UserRole;
    token: string;
  }

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: User;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
    user: {
      id: string;
      fname: string;
      lname: string;
      role: UserRole;
      token: string;
    };
  }
}
