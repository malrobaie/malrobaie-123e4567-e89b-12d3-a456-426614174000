import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { Role } from '@turbovets-task-manager/data';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard - RBAC Logic Tests', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
  };

  it('should allow access when no roles are required', () => {
    const context = createMockContext({
      memberships: [{ role: Role.VIEWER }],
    });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const context = createMockContext({
      memberships: [{ role: Role.ADMIN }],
    });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow OWNER when ADMIN is required (role hierarchy)', () => {
    const context = createMockContext({
      memberships: [{ role: Role.OWNER }],
    });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    const context = createMockContext({
      memberships: [{ role: Role.VIEWER }],
    });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user is not authenticated', () => {
    const context = createMockContext(null);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

