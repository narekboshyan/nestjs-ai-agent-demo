import { Module } from '@nestjs/common';
import { DemoUserMiddleware } from './demo-user.middleware.js';
import { SupportOnlyGuard } from './support-only.guard.js';

@Module({
  providers: [SupportOnlyGuard, DemoUserMiddleware],
  exports: [SupportOnlyGuard, DemoUserMiddleware],
})
export class AuthModule {}
