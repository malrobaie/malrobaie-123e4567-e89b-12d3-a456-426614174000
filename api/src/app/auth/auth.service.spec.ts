import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt at the module level
jest.mock('bcrypt');

describe('AuthService - JWT Authentication Tests', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let auditService: jest.Mocked<AuditService>;
  let bcryptCompare: jest.MockedFunction<typeof bcrypt.compare>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword',
    displayName: 'Test User',
    memberships: [
      {
        role: 'admin',
        organization: { id: 'org-123', name: 'Test Org' },
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
    bcryptCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      usersService.findByEmailWithMembership.mockResolvedValue(mockUser);
      bcryptCompare.mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmailWithMembership).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmailWithMembership.mockResolvedValue(null);

      await expect(service.validateUser('wrong@example.com', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      usersService.findByEmailWithMembership.mockResolvedValue(mockUser);
      bcryptCompare.mockResolvedValue(false as never);

      await expect(service.validateUser('test@example.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return JWT token and user info', async () => {
      const mockToken = 'jwt-token-123';
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(result).toEqual({
        accessToken: mockToken,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'admin',
          organizationId: 'org-123',
        },
      });
    });

    it('should include user role and organizationId in JWT payload', async () => {
      jwtService.sign.mockReturnValue('token');

      await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        organizationId: 'org-123',
      });
    });

    it('should log the login event', async () => {
      jwtService.sign.mockReturnValue('token');

      await service.login(mockUser);

      expect(auditService.logLogin).toHaveBeenCalledWith('user-123', 'org-123');
    });

    it('should default to viewer role when no membership', async () => {
      const userWithoutMembership = { ...mockUser, memberships: [] };
      jwtService.sign.mockReturnValue('token');

      const result = await service.login(userWithoutMembership);

      expect(result.user.role).toBe('viewer');
      expect(result.user.organizationId).toBeNull();
    });
  });
});

