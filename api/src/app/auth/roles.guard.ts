import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@turbovets-task-manager/data';
import { isAdminOrAbove } from '@turbovets-task-manager/auth';

export const RequireRole = (...roles: Role[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            // No roles required, allow access
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Get the user's role from their membership
        // The JWT strategy should have loaded the user with memberships
        const membership = user.memberships?.[0];
        const userRole = membership?.role;

        if (!userRole) {
            throw new ForbiddenException('User role not found');
        }

        // Check if user has one of the required roles
        // For roles like ADMIN, we also allow OWNER (role hierarchy)
        const hasRequiredRole = requiredRoles.some(role => {
            if (role === Role.ADMIN) {
                // Admin or above can access
                return isAdminOrAbove(userRole);
            }
            return userRole === role;
        });

        if (!hasRequiredRole) {
            throw new ForbiddenException(`Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`);
        }

        return true;
    }
}

