import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Role } from 'src/common/enums/enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface AuthUser {
  id: number;
  role: Role;
}

// Role hierarchy: Higher number = more permissions
const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.OWNER]: 4,
  [Role.MANAGER]: 3,
  [Role.CASHIER]: 2,
  [Role.TECHNICIAN]: 1,
};

const PUBLIC_PATHS: RegExp[] = [
  /^\/api\/docs(\/|$)/,
  /^\/api-json$/,
  /^\/health$/,
];

@Injectable()
export class JwtRoleGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const method = (req.method || '').toUpperCase();
    const url = req.url || '';

    if (method === 'OPTIONS') return true;

    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic || PUBLIC_PATHS.some((rx) => rx.test(url))) return true;

    // Authenticate user
    await super.canActivate(ctx);

    const user = req.user;
    if (!user) throw new UnauthorizedException('Authentication required.');

    // Check role-based access
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // If no specific roles required, allow authenticated users
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // Check if user has sufficient role hierarchy level
    const userRoleLevel = ROLE_HIERARCHY[user.role];
    const hasPermission = requiredRoles.some(
      (role) => userRoleLevel >= ROLE_HIERARCHY[role],
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }

  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) {
      throw (
        (err as Error) ?? new UnauthorizedException('Invalid or missing token.')
      );
    }
    return user as TUser;
  }
}
