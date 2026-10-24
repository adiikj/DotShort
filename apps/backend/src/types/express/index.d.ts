import type { SessionUser } from "../session.js";

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser | null;
    }
  }
}

export {};
