import type { Role } from "@prisma/client";

export interface IJWTPayload {
  email: string;
  role: Role;
}
