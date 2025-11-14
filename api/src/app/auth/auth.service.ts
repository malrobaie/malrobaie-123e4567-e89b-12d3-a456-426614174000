import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from './types';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwt: JwtService,
        private auditService: AuditService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmailWithMembership(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const matches = await bcrypt.compare(password, user.passwordHash);
        if (!matches) throw new UnauthorizedException('Invalid credentials');

        return user;
    }

    async login(user: AuthenticatedUser) {
        // Get the user's primary membership (first one, or you could add logic to determine primary)
        const membership = user.memberships?.[0];
        const role = membership?.role || 'viewer';
        const organizationId = membership?.organization?.id || null;

        const payload = {
            sub: user.id,
            email: user.email,
            role,
            organizationId,
        };

        // Log the login event
        if (organizationId) {
            await this.auditService.logLogin(user.id, organizationId);
        }

        return {
            accessToken: this.jwt.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role,
                organizationId,
            },
        };
    }
}
