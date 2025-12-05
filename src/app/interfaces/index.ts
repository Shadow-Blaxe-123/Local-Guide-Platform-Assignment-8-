import type { Role } from "@prisma/client";

export interface IJWTPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
}
