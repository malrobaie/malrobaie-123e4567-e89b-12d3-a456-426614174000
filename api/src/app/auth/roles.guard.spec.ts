import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard, RequireRole } from './roles.guard';
import { Role } from '@turbovets-task-manager/data';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: jest.Mocked<Reflector>;

    const createMockContext = (user: any, handler?: any): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    user,
                }),
            }),
            getHandler: () => handler,
            getClass: () => ({}),
        } as ExecutionContext;
    };

    beforeEach(() => {
        reflector = {
            getAllAndOverride: jest.fn(),
        } as any;

        guard = new RolesGuard(reflector);
    });

    it('should allow access when no roles are required', () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);

        const context = createMockContext({
            memberships: [{ role: Role.VIEWER }],
        });

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has required role', () => {
        reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

        const context = createMockContext({
            memberships: [{ role: Role.ADMIN }],
        });

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow OWNER when ADMIN is required (role hierarchy)', () => {
        reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

        const context = createMockContext({
            memberships: [{ role: Role.OWNER }],
        });

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
        reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

        const context = createMockContext({
            memberships: [{ role: Role.VIEWER }],
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
        reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

        const context = createMockContext(null);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user has no role', () => {
        reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

        const context = createMockContext({
            memberships: [],
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
});

describe('RequireRole decorator', () => {
    it('should set metadata on method', () => {
        class TestController {
            @RequireRole(Role.ADMIN)
            testMethod() {}
        }

        const metadata = Reflect.getMetadata('roles', TestController.prototype.testMethod);
        expect(metadata).toEqual([Role.ADMIN]);
    });

    it('should set metadata on class', () => {
        @RequireRole(Role.OWNER)
        class TestController {}

        const metadata = Reflect.getMetadata('roles', TestController);
        expect(metadata).toEqual([Role.OWNER]);
    });
});

