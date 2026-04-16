import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name: DefaultSession["user"]["name"];
      email: DefaultSession["user"]["email"];
    };
  }

  interface User {
    id: string;
    name: string | null;
    email: string;
  }
}
