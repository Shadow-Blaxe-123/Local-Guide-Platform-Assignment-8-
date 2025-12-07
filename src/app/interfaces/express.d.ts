import type { IJWTPayload } from ".";

declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload | null;
    }
  }
}
