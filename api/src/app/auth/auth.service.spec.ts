import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
    let service: AuthService;
    let usersService: jest.Mocked<UsersService>;
    let jwtService: jest.Mocked<JwtService>;
    let auditService: jest.Mocked<AuditService>;

    const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        displayName: 'Test User',
        memberships: [
            {
                id: 'membership-1',
                role: 'admin',
                organization: {
                    id: 'org-1',
                    name: 'Test Org',
                },
            },
        ],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findByEmailWithMembership: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                    },
                },
                {
                    provide: AuditService,
                    useValue: {
                        logLogin: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get(UsersService);
        jwtService = module.get(JwtService);
        auditService = module.get(AuditService);
    });

    describe('validateUser', () => {
        it('should return user when credentials are valid', async () => {
            usersService.findByEmailWithMembership.mockResolvedValue(mockUser as any);
            mockedBcrypt.compare.mockResolvedValue(true as never);

            const result = await service.validateUser('test@example.com', 'password');

            expect(result).toEqual(mockUser);
            expect(usersService.findByEmailWithMembership).toHaveBeenCalledWith('test@example.com');
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
        });

        it('should throw UnauthorizedException when user is not found', async () => {
            usersService.findByEmailWithMembership.mockResolvedValue(null);

            await expect(
                service.validateUser('test@example.com', 'password'),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockedBcrypt.compare).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when password is incorrect', async () => {
            usersService.findByEmailWithMembership.mockResolvedValue(mockUser as any);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            await expect(
                service.validateUser('test@example.com', 'wrong-password'),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('login', () => {
        it('should return access token and user info', async () => {
            jwtService.sign.mockReturnValue('jwt-token');

            const result = await service.login(mockUser as any);

            expect(result).toEqual({
                accessToken: 'jwt-token',
                user: {
                    id: 'user-1',
                    email: 'test@example.com',
                    displayName: 'Test User',
                    role: 'admin',
                    organizationId: 'org-1',
                },
            });

            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: 'user-1',
                email: 'test@example.com',
                role: 'admin',
                organizationId: 'org-1',
            });

            expect(auditService.logLogin).toHaveBeenCalledWith('user-1', 'org-1');
        });

        it('should use default role when membership is missing', async () => {
            const userWithoutMembership = {
                ...mockUser,
                memberships: [],
            };
            jwtService.sign.mockReturnValue('jwt-token');

            const result = await service.login(userWithoutMembership as any);

            expect(result.user.role).toBe('viewer');
            expect(result.user.organizationId).toBeNull();
            expect(auditService.logLogin).not.toHaveBeenCalled();
        });
    });
});
