import type { Request } from 'express';

export type Role = 'customer' | 'support';

export interface AuthUser {
  id: string;
  role: Role;
}

/** A request after authentication has run. */
export type AuthenticatedRequest = Request & { user?: AuthUser };
