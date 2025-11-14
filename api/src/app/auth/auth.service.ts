import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwt: JwtService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const matches = await bcrypt.compare(password, user.passwordHash);
        if (!matches) throw new UnauthorizedException('Invalid credentials');

        return user;
    }

    login(user: any) {
        const payload = { sub: user.id };
        return {
            accessToken: this.jwt.sign(payload),
            user,
        };
    }
}
