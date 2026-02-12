import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Role } from 'src/common/enums/enum';
import { PUBLIC_PATHS } from '../constants/public-paths';
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

@Injectable()
export class RoleMethodGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const url = req.url || '';

    // 1) @Public() routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    // 2) Public paths (swagger/health)
    if (PUBLIC_PATHS.some((rx) => rx.test(url))) return true;

    // 3) Must be authenticated (JwtAuthGuard should have set req.user)
    const user = req.user;
    if (!user) throw new UnauthorizedException('Authentication required.');

    // 4) Check role-based access
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
}
