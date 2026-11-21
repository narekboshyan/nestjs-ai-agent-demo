import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from './authenticated-request.js';

/**
 * DEMO ONLY. Stands in for real authentication: it trusts the `x-demo-role`
 * header and puts a user on the request. Never ship this. In a real app your
 * auth layer (JWT, session, SSO) sets `request.user`.
 */
@Injectable()
export class DemoUserMiddleware implements NestMiddleware {
  use(request: AuthenticatedRequest, _response: Response, next: NextFunction) {
    const role = request.headers['x-demo-role'] === 'support' ? 'support' : 'customer';
    request.user = { id: 'demo-user', role };
    next();
  }
}
