import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';

type Role = 'ADMIN' | 'DEALER' | 'AGENT';
type AuthUser = { id: number; role: Role };

@Injectable()
export class ClsUserInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    // JwtStrategy + JwtRoleGuard already validated and attached user
    const userId = req?.user?.id;
    if (userId) {
      this.cls.set('userId', userId);
    }
    return next.handle();
  }
}
