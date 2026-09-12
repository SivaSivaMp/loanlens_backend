import { UserRole } from "@/domian/entities/User";

declare global {
  namespace Express {
    interface User {
      userId: string;
      role: UserRole;
    }

    interface Request {
      portalUser?: {
        userId: string;
        type: "portal";
      };
    }
  }
}

export {};
